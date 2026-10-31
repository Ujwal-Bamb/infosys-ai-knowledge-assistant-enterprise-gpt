from backend.database.connection import SessionLocal
from ai_workflows.rag_retrieval.retrieval_service import search_similar_chunks
from ai_workflows.grounded_synthesis.answer_service import generate_answer
db = SessionLocal()

try:
    query = "What is the referral reward for employees?"

    chunks = search_similar_chunks(
        db=db,
        query=query,
        top_k=5
    )

    answer = generate_answer(query, chunks)

    print("\nQUESTION:")
    print(query)

    print("\nGENERATED ANSWER:")
    print(answer)

finally:
    db.close()