from sqlalchemy.orm import Session

from backend.database.models import DocumentChunk
from backend.services.embedding_service import generate_embeddings


def generate_document_embeddings(
    db: Session,
    document_id: int,
) -> int:
    """Generate and store embeddings for all unembedded chunks of a document."""
    chunks = (
        db.query(DocumentChunk)
        .filter(
            DocumentChunk.document_id == document_id,
            DocumentChunk.embedding.is_(None),
        )
        .order_by(DocumentChunk.chunk_index)
        .all()
    )

    if not chunks:
        return 0

    batch_size = 50
    processed = 0

    try:
        for start in range(0, len(chunks), batch_size):
            batch = chunks[start : start + batch_size]

            texts = [chunk.content for chunk in batch]
            embeddings = generate_embeddings(texts, task_type="RETRIEVAL_DOCUMENT")

            for chunk, embedding in zip(batch, embeddings):
                chunk.embedding = embedding
                processed += 1

            db.commit()
    except Exception:
        db.rollback()
        raise

    return processed