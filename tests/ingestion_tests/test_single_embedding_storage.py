from backend.database.connection import SessionLocal
from backend.database.models import Document, DocumentChunk
from backend.services.embedding_service import generate_embedding

db = SessionLocal()

try:
    document = db.query(Document).filter(
        Document.document_id == "DOC-106EA6EBF40D"
    ).first()

    chunk = db.query(DocumentChunk).filter(
        DocumentChunk.document_id == document.id
    ).order_by(DocumentChunk.chunk_index).first()

    print("Chunk ID:", chunk.id)

    embedding = generate_embedding(chunk.content)

    print("Generated dimensions:", len(embedding))

    chunk.embedding = embedding
    db.commit()

    db.refresh(chunk)

    print("Embedding saved:", chunk.embedding is not None)

except Exception as e:
    db.rollback()
    print("Error:", repr(e))

finally:
    db.close()