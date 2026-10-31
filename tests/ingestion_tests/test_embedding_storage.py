from backend.database.connection import SessionLocal
from backend.database.models import Document, DocumentChunk
from ingestion_pipeline.embedding_jobs.embedding_job import generate_document_embeddings
db = SessionLocal()

try:
    document = db.query(Document).filter(
        Document.document_id == "DOC-106EA6EBF40D"
    ).first()

    if not document:
        raise ValueError("Document not found")

    count = generate_document_embeddings(db, document.id)

    print("Embeddings generated:", count)

    saved_count = db.query(DocumentChunk).filter(
        DocumentChunk.document_id == document.id,
        DocumentChunk.embedding.isnot(None)
    ).count()

    print("Embeddings verified:", saved_count)

finally:
    db.close()