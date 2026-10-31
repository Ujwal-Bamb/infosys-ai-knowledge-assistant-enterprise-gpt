import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.api.main import app
from backend.database.models import Document, DocumentChunk, Role, User
from backend.database.seed_roles import DEFAULT_ROLES
from backend.auth.security import hash_password
from tests.access_control_tests.conftest import TestingSessionLocal, client



def generate_unique_email(prefix: str = "phase2") -> str:
    return f"{prefix}_{uuid.uuid4().hex[:8]}@infosys.com"


def create_user_helper(role_name: str, password: str = "Password123!") -> tuple[str, str, str]:
    """Helper to create a user and return (email, password, jwt_token)."""
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

    login_res = client.post(
        "/auth/login",
        json={"email": email, "password": password},
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    return email, password, token


class TestPhase2PasswordAndDocuments:
    """Phase 2 Password Security & Document Management RBAC Test Suite."""

    def test_01_seed_roles_contains_only_admin_and_employee(self):
        """Verify that DEFAULT_ROLES does not contain deprecated 'Employer' role."""
        assert "Employer" not in DEFAULT_ROLES
        assert "Admin" in DEFAULT_ROLES
        assert "Employee" in DEFAULT_ROLES
        assert len(DEFAULT_ROLES) == 2

    def test_02_password_change_rejects_incorrect_current_password(self):
        """Verify password change returns 400 when current_password is wrong."""
        _, _, token = create_user_helper("Employee", "InitialPass123!")

        res = client.post(
            "/auth/change-password",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "current_password": "WrongPassword999!",
                "new_password": "NewValidPassword123!",
            },
        )
        assert res.status_code == 400
        assert "Current password is incorrect" in res.json()["detail"]

    def test_03_password_change_rejects_same_password(self):
        """Verify password change returns 400 when new password equals current password."""
        _, current_pw, token = create_user_helper("Employee", "SamePassword123!")

        res = client.post(
            "/auth/change-password",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "current_password": current_pw,
                "new_password": current_pw,
            },
        )
        assert res.status_code == 400
        assert "New password cannot be the same as current password" in res.json()["detail"]

    def test_04_password_change_rejects_short_new_password(self):
        """Verify password change returns 422 when new password has length < 8."""
        _, current_pw, token = create_user_helper("Employee", "CurrentPass123!")

        res = client.post(
            "/auth/change-password",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "current_password": current_pw,
                "new_password": "short",
            },
        )
        assert res.status_code == 422

    def test_05_password_change_success_and_login_flow(self):
        """Verify successful password change, old password fails login, new password succeeds."""
        email, old_pw, token = create_user_helper("Employee", "OldPassword123!")
        new_pw = "NewSecurePassword456!"

        change_res = client.post(
            "/auth/change-password",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "current_password": old_pw,
                "new_password": new_pw,
            },
        )
        assert change_res.status_code == 200
        assert change_res.json()["message"] == "Password updated successfully"

        # Old password must now fail
        old_login_res = client.post(
            "/auth/login",
            json={"email": email, "password": old_pw},
        )
        assert old_login_res.status_code == 401

        # New password must succeed
        new_login_res = client.post(
            "/auth/login",
            json={"email": email, "password": new_pw},
        )
        assert new_login_res.status_code == 200
        assert "access_token" in new_login_res.json()

    def test_06_employee_and_admin_can_list_documents(self):
        """Verify both Employee and Admin can call GET /documents and see chunk/page counts."""
        _, _, emp_token = create_user_helper("Employee")
        _, _, admin_token = create_user_helper("Admin")

        # Seed a test document directly with chunks
        with TestingSessionLocal() as session:
            admin_user = session.query(User).filter(User.role.has(name="Admin")).first()
            doc = Document(
                document_id="DOC-TEST-P2",
                title="Test Policy Manual",
                filename="test_policy.pdf",
                department="HR",
                document_type="Policy",
                storage_key="/tmp/nonexistent_test.pdf",
                access_scope="all_users",
                uploaded_by=admin_user.id,
            )
            session.add(doc)
            session.flush()

            chunk1 = DocumentChunk(
                document_id=doc.id,
                chunk_index=0,
                page_number=1,
                content="Chunk 1 content on page 1",
            )
            chunk2 = DocumentChunk(
                document_id=doc.id,
                chunk_index=1,
                page_number=3,
                content="Chunk 2 content on page 3",
            )
            session.add_all([chunk1, chunk2])
            session.commit()

        # Employee reads documents
        emp_res = client.get("/documents", headers={"Authorization": f"Bearer {emp_token}"})
        assert emp_res.status_code == 200
        docs = emp_res.json()
        assert len(docs) >= 1
        matched = next((d for d in docs if d["document_id"] == "DOC-TEST-P2"), None)
        assert matched is not None
        assert matched["title"] == "Test Policy Manual"
        assert matched["page_count"] == 3
        assert matched["chunk_count"] == 2

        # Admin also reads documents
        admin_res = client.get("/documents", headers={"Authorization": f"Bearer {admin_token}"})
        assert admin_res.status_code == 200
        assert len(admin_res.json()) >= 1

    def test_07_employee_cannot_delete_document(self):
        """Verify Employee receives 403 Forbidden when calling DELETE /documents/{id}."""
        _, _, emp_token = create_user_helper("Employee")

        # Pick any document
        with TestingSessionLocal() as session:
            doc = session.query(Document).first()
            doc_id = doc.id

        del_res = client.delete(
            f"/documents/{doc_id}",
            headers={"Authorization": f"Bearer {emp_token}"},
        )
        assert del_res.status_code == 403
        assert del_res.json()["detail"] == "Admin access required"

    def test_08_unauthenticated_cannot_delete_document(self):
        """Verify unauthenticated request to DELETE /documents/{id} returns 401."""
        del_res = client.delete("/documents/1")
        assert del_res.status_code == 401

    def test_09_admin_delete_nonexistent_document_returns_404(self):
        """Verify Admin deleting non-existent doc_id returns 404."""
        _, _, admin_token = create_user_helper("Admin")

        del_res = client.delete(
            "/documents/999999",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert del_res.status_code == 404
        assert del_res.json()["detail"] == "Document not found"

    def test_10_admin_can_delete_document_and_cascade_chunks(self):
        """Verify Admin can delete document (200 OK), cascading deletion of DocumentChunks."""
        _, _, admin_token = create_user_helper("Admin")

        with TestingSessionLocal() as session:
            admin_user = session.query(User).filter(User.role.has(name="Admin")).first()
            doc = Document(
                document_id="DOC-TO-DELETE",
                title="Disposable Document",
                filename="disposable.pdf",
                department="General",
                document_type="Memo",
                storage_key="/tmp/disposable.pdf",
                access_scope="all_users",
                uploaded_by=admin_user.id,
            )
            session.add(doc)
            session.flush()

            chunk = DocumentChunk(
                document_id=doc.id,
                chunk_index=0,
                page_number=1,
                content="Disposable chunk",
            )
            session.add(chunk)
            session.commit()
            target_doc_id = doc.id

        # Admin deletes document
        del_res = client.delete(
            f"/documents/{target_doc_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert del_res.status_code == 200
        assert del_res.json()["message"] == "Document deleted successfully"

        # Verify database record and cascaded chunks are gone
        with TestingSessionLocal() as session:
            assert session.query(Document).filter(Document.id == target_doc_id).first() is None
            assert session.query(DocumentChunk).filter(DocumentChunk.document_id == target_doc_id).count() == 0
