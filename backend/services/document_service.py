from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from backend.database.models import Document, DocumentChunk
from ingestion_pipeline.chunking.text_chunker import chunk_text
from ingestion_pipeline.document_parsing.pdf_parser import extract_text_from_pdf
from ingestion_pipeline.embedding_jobs.embedding_job import generate_document_embeddings

PROJECT_ROOT = Path(__file__).resolve().parents[2]
UPLOAD_DIR = PROJECT_ROOT / "data" / "uploads"

ALLOWED_EXTENSIONS = {".pdf"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


async def save_document(
    file: UploadFile,
    title: str,
    department: str,
    document_type: str,
    current_user,
    db: Session,
    access_scope: str = "all_users",
) -> dict:
    """Validate, store, parse, chunk, and embed an uploaded PDF document."""
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is missing",
        )

    extension = Path(file.filename).suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed",
        )

    content = await file.read()

    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty",
        )

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds 10 MB limit",
        )

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    stored_filename = f"{uuid4().hex}.pdf"
    file_path = UPLOAD_DIR / stored_filename
    document = None

    try:
        file_path.write_bytes(content)

        pages = extract_text_from_pdf(str(file_path))
        if not pages:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No readable text found in the PDF",
            )

        chunks = chunk_text(
            pages,
            chunk_size=1000,
            chunk_overlap=200,
        )

        document = Document(
            document_id=f"DOC-{uuid4().hex[:12].upper()}",
            title=title.strip(),
            filename=file.filename,
            department=department.strip() if department else "General",
            document_type=document_type.strip() if document_type else "SOP",
            storage_key=str(file_path),
            uploaded_by=current_user.id,
            access_scope=access_scope,
        )

        db.add(document)
        db.flush()

        for chunk in chunks:
            db.add(
                DocumentChunk(
                    document_id=document.id,
                    chunk_index=chunk["chunk_index"],
                    page_number=chunk["page_number"],
                    content=chunk["content"],
                )
            )

        db.commit()
        db.refresh(document)

        # Generate and store embeddings for the uploaded document
        embeddings_generated = generate_document_embeddings(
            db=db,
            document_id=document.id,
        )

        return {
            "document_id": document.document_id,
            "title": document.title,
            "filename": document.filename,
            "department": document.department,
            "document_type": document.document_type,
            "total_pages": len(pages),
            "total_chunks": len(chunks),
            "embeddings_generated": embeddings_generated,
        }

    except Exception:
        db.rollback()

        # If document was already committed before embedding failed, remove it
        if document is not None and document.id is not None:
            try:
                db.delete(document)
                db.commit()
            except Exception:
                db.rollback()

        if file_path.exists():
            file_path.unlink()

        raise


def delete_document_by_id(doc_id: int, db: Session) -> None:
    """Delete a document by ID along with its file and cascading chunks."""
    document = db.query(Document).filter(Document.id == doc_id).first()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

    if document.storage_key:
        file_path = Path(document.storage_key)
        if file_path.exists():
            try:
                file_path.unlink()
            except OSError:
                pass

    db.delete(document)
    db.commit()