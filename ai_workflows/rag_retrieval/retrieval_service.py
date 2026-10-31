from typing import Optional
from sqlalchemy.orm import Session

from backend.database.models import Document, DocumentChunk
from backend.services.embedding_service import generate_embedding

SIMILARITY_THRESHOLD = 0.55
DISTANCE_THRESHOLD = 1.0 - SIMILARITY_THRESHOLD


def search_similar_chunks(
    db: Session,
    query: str,
    top_k: int = 10,
    department: Optional[str] = None,
) -> list[dict]:
    """Search pgvector for document chunks matching the query."""
    query_embedding = generate_embedding(query, task_type="RETRIEVAL_QUERY")

    distance_expression = DocumentChunk.embedding.cosine_distance(query_embedding)

    db_query = (
        db.query(
            DocumentChunk,
            Document.title,
            Document.document_id.label("document_code"),
            Document.department,
            distance_expression.label("distance"),
        )
        .join(Document, DocumentChunk.document_id == Document.id)
        .filter(DocumentChunk.embedding.is_not(None))
        .filter(distance_expression <= DISTANCE_THRESHOLD)
    )

    if department and department.strip():
        db_query = db_query.filter(Document.department.ilike(department.strip()))

    results = db_query.order_by(distance_expression).limit(top_k).all()

    retrieved_chunks = []

    print("\n--- RETRIEVAL DEBUG ---")

    for chunk, title, document_code, dept, distance in results:
        similarity = float(1.0 - distance)

        print(
            f"Retrieved: {title} | "
            f"Page: {chunk.page_number} | "
            f"Similarity: {similarity:.4f}"
        )

        retrieved_chunks.append({
            "document_title": title,
            "document_id": document_code,
            "department": dept,
            "chunk_id": chunk.id,
            "chunk_index": chunk.chunk_index,
            "page_number": chunk.page_number,
            "content": chunk.content,
            "similarity": similarity,
        })

    print(f"Total relevant chunks: {len(retrieved_chunks)}")

    return retrieved_chunks