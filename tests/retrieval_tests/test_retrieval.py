from backend.database.connection import SessionLocal
from ai_workflows.rag_retrieval.retrieval_service import search_similar_chunks
db = SessionLocal()

try:
    query = "What is the referral reward for employees?"

    results = search_similar_chunks(
        db=db,
        query=query,
        top_k=5
    )

    print("\nRetrieved chunks:", len(results))

    for index, result in enumerate(results, start=1):
        print(f"\nResult {index}")
        print("Document:", result["document_title"])
        print("Page:", result["page_number"])
        print("Content:", result["content"][:300])

finally:
    db.close()