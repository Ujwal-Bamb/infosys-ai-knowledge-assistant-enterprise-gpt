from pathlib import Path
from fastapi.testclient import TestClient
from sqlalchemy import text

from backend.api.main import app
from backend.database.connection import SessionLocal, engine
from backend.database.init_db import initialize_database
from backend.database.seed_roles import seed_roles
from backend.services.embedding_service import generate_embedding
from ingestion_pipeline.chunking.text_chunker import chunk_text
from ingestion_pipeline.document_parsing.pdf_parser import extract_text_from_pdf
from ai_workflows.rag_retrieval.retrieval_service import search_similar_chunks
from ai_workflows.grounded_synthesis.answer_service import generate_answer

client = TestClient(app)


def run_all_checks():
    print("\n=== 1. CHECKING DATABASE & PGVECTOR ===")
    initialize_database()
    seed_roles()
    with engine.connect() as conn:
        ext = conn.execute(
            text("SELECT extname FROM pg_extension WHERE extname = 'vector';")
        ).scalar()
        assert ext == "vector", "pgvector extension is NOT installed!"
    print("✅ Database & pgvector verified.")

    print("\n=== 2. CHECKING FASTAPI HEALTH & AUTH ENDPOINTS ===")
    health_res = client.get("/health")
    assert health_res.status_code == 200
    print("✅ /health endpoint working.")

    test_email = "test_employee@infosys.com"
    test_password = "Password123!"

    # Register (ignore 400 if already registered from previous test run)
    reg_res = client.post(
        "/auth/register",
        json={
            "full_name": "Test Employee",
            "email": test_email,
            "password": test_password,
        },
    )
    assert reg_res.status_code in (201, 400)

    # Login
    login_res = client.post(
        "/auth/login",
        json={"email": test_email, "password": test_password},
    )
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✅ Register, Login & JWT generation verified.")

    # Verify /auth/me
    me_res = client.get("/auth/me", headers=headers)
    assert me_res.status_code == 200
    print(f"✅ Authenticated profile verified: {me_res.json()['email']}")

    # Verify RBAC (Employee should get 403 on /admin/test)
    admin_res = client.get("/admin/test", headers=headers)
    assert admin_res.status_code == 403
    print("✅ Role-Based Access Control (403 for non-admin) verified.")

    print("\n=== 3. CHECKING PDF PARSER & CHUNKER ===")
    uploads_dir = Path("data/uploads")
    pdf_files = list(uploads_dir.glob("*.pdf"))
    if pdf_files:
        sample_pdf = pdf_files[0]
        pages = extract_text_from_pdf(str(sample_pdf))
        chunks = chunk_text(pages, chunk_size=1000, chunk_overlap=200)
        assert len(pages) > 0 and len(chunks) > 0
        print(
            f"✅ Parsed '{sample_pdf.name}': {len(pages)} pages -> {len(chunks)} chunks."
        )
    else:
        print("⚠️ No PDF found in data/uploads/ to test local PDF file parsing.")

    print("\n=== 4. CHECKING GEMINI EMBEDDING SERVICE ===")
    vector = generate_embedding("Infosys leave policy and working hours", task_type="RETRIEVAL_QUERY")
    assert len(vector) == 1536, f"Expected 1536 dimensions, got {len(vector)}"
    print(f"✅ Gemini Embedding generated successfully (dim={len(vector)}).")

    print("\n=== 5. CHECKING RAG RETRIEVAL & ANSWER SYNTHESIS (/query) ===")
    query_res = client.post(
        "/query",
        headers=headers,
        json={"question": "What are the key guidelines or policies in the documents?"},
    )
    assert query_res.status_code == 200, f"Query failed: {query_res.text}"
    data = query_res.json()
    print(f"✅ /query Status: 200 OK")
    print(f"   Sources retrieved: {len(data.get('sources', []))}")
    print(f"   Generated Answer: {data.get('answer')[:200]}...")

    print("\n🎉 ALL SYSTEM CHECKS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    run_all_checks()