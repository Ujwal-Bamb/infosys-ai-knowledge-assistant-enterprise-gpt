from backend.database.connection import SessionLocal
from backend.database.models import Document, DocumentChunk

db = SessionLocal()

try:
    document = db.query(Document).filter(
        Document.document_id == "DOC-106EA6EBF40D"
    ).first()

    if not document:
        print("Document not found")
    else:
        print("Document:", document.title)
        print("Document ID:", document.document_id)
        print("Department:", document.department)

        chunks = db.query(DocumentChunk).filter(
            DocumentChunk.document_id == document.id
        ).order_by(DocumentChunk.chunk_index).all()

        print("Total chunks:", len(chunks))

        for chunk in chunks:
            print(
                f"\nChunk: {chunk.chunk_index}"
                f"\nPage: {chunk.page_number}"
                f"\nContent: {chunk.content[:150]}"
            )

finally:
    db.close()