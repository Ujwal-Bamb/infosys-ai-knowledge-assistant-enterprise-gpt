import uuid
import pytest
from tests.access_control_tests.conftest import TestingSessionLocal, client
from backend.database.models import Document, DocumentChunk, Role, User, QueryHistory
from backend.auth.security import hash_password


def generate_unique_email(prefix: str = "p3") -> str:
    return f"{prefix}_{uuid.uuid4().hex[:8]}@infosys.com"


def create_user_helper(role_name: str = "Employee", password: str = "Password123!") -> tuple[str, str, str, int]:
    """Helper to create user and return (email, password, token, user_id)."""
    email = generate_unique_email(role_name.lower())
    with TestingSessionLocal() as session:
        role = session.query(Role).filter(Role.name == role_name).first()
        user = User(
            full_name=f"{role_name} User",
            email=email,
            hashed_password=hash_password(password),
            role_id=role.id,
            is_active=True,
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        user_id = user.id

    login_res = client.post(
        "/auth/login",
        json={"email": email, "password": password},
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    return email, password, token, user_id


class TestPhase3HistoryAndDashboard:
    """Phase 3: Database Query History Persistence & Live Analytics Test Suite."""

    def test_01_new_user_has_zero_queries_and_zero_answered_rate(self):
        """1. Verify new user initially has 0 queries and answered_rate 0% in analytics."""
        _, _, token, user_id = create_user_helper("Employee")

        # GET /queries/history
        hist_res = client.get(
            "/queries/history",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert hist_res.status_code == 200
        assert hist_res.json() == []

        # GET /analytics/dashboard-stats
        stats_res = client.get(
            "/analytics/dashboard-stats",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert stats_res.status_code == 200
        stats = stats_res.json()
        assert stats["user_recent_queries_count"] == 0
        assert stats["answered_rate"] == 0.0
        assert stats["recent_queries"] == []

    def test_02_post_query_persists_query_history_in_database(self):
        """2. Verify POST /query persists a QueryHistory record with user_id and flags."""
        _, _, token, user_id = create_user_helper("Employee")

        post_res = client.post(
            "/query",
            headers={"Authorization": f"Bearer {token}"},
            json={"question": "What are the rules regarding annual leaves?", "department": "HR"},
        )
        assert post_res.status_code == 200
        data = post_res.json()
        assert "query_id" in data
        assert "question" in data
        assert "answer" in data
        query_id = data["query_id"]

        # Verify directly in SQLite test database
        with TestingSessionLocal() as session:
            record = session.query(QueryHistory).filter(QueryHistory.id == query_id).first()
            assert record is not None
            assert record.user_id == user_id
            assert record.question == "What are the rules regarding annual leaves?"
            assert record.department == "HR"

    def test_03_query_history_is_isolated_between_users(self):
        """3. Verify User A cannot view User B's query history in GET /queries/history."""
        _, _, user_a_token, user_a_id = create_user_helper("Employee")
        _, _, user_b_token, user_b_id = create_user_helper("Employee")

        # User A makes a query
        client.post(
            "/query",
            headers={"Authorization": f"Bearer {user_a_token}"},
            json={"question": "User A secret question about bonus", "department": "Finance"},
        )

        # User B makes a query
        client.post(
            "/query",
            headers={"Authorization": f"Bearer {user_b_token}"},
            json={"question": "User B secret question about travel", "department": "IT"},
        )

        # User A history must contain ONLY User A's question
        res_a = client.get(
            "/queries/history",
            headers={"Authorization": f"Bearer {user_a_token}"},
        )
        assert res_a.status_code == 200
        questions_a = [q["question"] for q in res_a.json()]
        assert "User A secret question about bonus" in questions_a
        assert "User B secret question about travel" not in questions_a

        # User B history must contain ONLY User B's question
        res_b = client.get(
            "/queries/history",
            headers={"Authorization": f"Bearer {user_b_token}"},
        )
        assert res_b.status_code == 200
        questions_b = [q["question"] for q in res_b.json()]
        assert "User B secret question about travel" in questions_b
        assert "User A secret question about bonus" not in questions_b

    def test_04_user_cannot_delete_another_users_query(self):
        """4. Verify User A receives 404 when trying to delete User B's query."""
        _, _, user_a_token, _ = create_user_helper("Employee")
        _, _, user_b_token, _ = create_user_helper("Employee")

        # User B creates a query
        b_res = client.post(
            "/query",
            headers={"Authorization": f"Bearer {user_b_token}"},
            json={"question": "User B question to protect"},
        )
        b_query_id = b_res.json()["query_id"]

        # User A attempts to delete User B's query
        del_res = client.delete(
            f"/queries/history/{b_query_id}",
            headers={"Authorization": f"Bearer {user_a_token}"},
        )
        assert del_res.status_code == 404
        assert del_res.json()["detail"] == "Query history item not found"

        # Verify User B's query is still intact
        with TestingSessionLocal() as session:
            assert session.query(QueryHistory).filter(QueryHistory.id == b_query_id).first() is not None

    def test_05_clear_history_clears_only_authenticated_users_records(self):
        """5. Verify DELETE /queries/history deletes only current user's history."""
        _, _, user_a_token, user_a_id = create_user_helper("Employee")
        _, _, user_b_token, user_b_id = create_user_helper("Employee")

        # User A logs 2 queries
        client.post(
            "/query",
            headers={"Authorization": f"Bearer {user_a_token}"},
            json={"question": "Question A1"},
        )
        client.post(
            "/query",
            headers={"Authorization": f"Bearer {user_a_token}"},
            json={"question": "Question A2"},
        )

        # User B logs 1 query
        client.post(
            "/query",
            headers={"Authorization": f"Bearer {user_b_token}"},
            json={"question": "Question B1"},
        )

        # User A clears their history
        clear_res = client.delete(
            "/queries/history",
            headers={"Authorization": f"Bearer {user_a_token}"},
        )
        assert clear_res.status_code == 200
        assert clear_res.json()["deleted_count"] == 2

        # User A history is now empty
        hist_a = client.get(
            "/queries/history",
            headers={"Authorization": f"Bearer {user_a_token}"},
        )
        assert hist_a.json() == []

        # User B history is completely untouched
        hist_b = client.get(
            "/queries/history",
            headers={"Authorization": f"Bearer {user_b_token}"},
        )
        assert len(hist_b.json()) >= 1
        assert any(q["question"] == "Question B1" for q in hist_b.json())

    def test_06_dashboard_stats_computes_real_metrics(self):
        """6. Verify GET /analytics/dashboard-stats returns real counts from database."""
        _, _, token, user_id = create_user_helper("Employee")

        # Create 2 distinct department documents
        with TestingSessionLocal() as session:
            doc1 = Document(
                document_id="DOC-STATS-1",
                title="Finance Guidelines",
                filename="fin.pdf",
                department="Finance",
                document_type="Policy",
                storage_key="/tmp/fin.pdf",
                uploaded_by=user_id,
            )
            doc2 = Document(
                document_id="DOC-STATS-2",
                title="Engineering Handbook",
                filename="eng.pdf",
                department="Engineering",
                document_type="Manual",
                storage_key="/tmp/eng.pdf",
                uploaded_by=user_id,
            )
            session.add_all([doc1, doc2])
            session.commit()

        # Add 1 grounded query and 1 ungrounded query directly for this user
        with TestingSessionLocal() as session:
            q1 = QueryHistory(
                user_id=user_id,
                question="Grounded question",
                answer="Found in document page 2",
                has_sufficient_evidence=True,
            )
            q2 = QueryHistory(
                user_id=user_id,
                question="Ungrounded question",
                answer="Information not available",
                has_sufficient_evidence=False,
            )
            session.add_all([q1, q2])
            session.commit()

        stats_res = client.get(
            "/analytics/dashboard-stats",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert stats_res.status_code == 200
        stats = stats_res.json()
        assert stats["total_documents"] >= 2
        assert stats["total_departments"] >= 2
        assert stats["user_recent_queries_count"] == 2
        assert stats["answered_rate"] == 50.0  # 1 out of 2 is grounded -> 50%
        assert len(stats["recent_queries"]) == 2
        assert len(stats["recent_documents"]) >= 2

    def test_07_unauthenticated_requests_are_rejected(self):
        """7. Verify unauthenticated requests to history and analytics return 401."""
        assert client.get("/queries/history").status_code == 401
        assert client.delete("/queries/history").status_code == 401
        assert client.delete("/queries/history/1").status_code == 401
        assert client.get("/analytics/dashboard-stats").status_code == 401
