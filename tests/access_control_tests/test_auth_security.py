import io
import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.api.main import app
from backend.database.dependencies import get_db
from backend.database.models import Base, Role, User
from backend.database.seed_admin import provision_admin

from tests.access_control_tests.conftest import TestingSessionLocal, client


def generate_unique_email(prefix: str = "test") -> str:
    """Generate a unique email to guarantee test isolation."""
    return f"{prefix}_{uuid.uuid4().hex[:8]}@infosys.com"


class TestAuthenticationAndSecurity:
    """Phase 1 Security & Authentication Test Suite."""

    def test_01_valid_user_login_and_jwt_retrieval(self):
        """1. Verify that valid credentials return a 200 response with a valid JWT access token."""
        email = generate_unique_email("login_valid")
        password = "SecurePassword123!"

        # Register employee first
        reg_res = client.post(
            "/auth/register",
            json={
                "full_name": "Valid Test User",
                "email": email,
                "password": password,
            },
        )
        assert reg_res.status_code == 201

        # Attempt login
        login_res = client.post(
            "/auth/login",
            json={"email": email, "password": password},
        )
        assert login_res.status_code == 200
        data = login_res.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == email.lower()
        assert data["user"]["role"] == "Employee"

    def test_02_invalid_password_rejection(self):
        """2. Verify that an incorrect password results in HTTP 401 Unauthorized."""
        email = generate_unique_email("bad_pass")
        password = "CorrectPassword123!"

        # Register employee
        client.post(
            "/auth/register",
            json={
                "full_name": "Password Test User",
                "email": email,
                "password": password,
            },
        )

        # Login with wrong password
        login_res = client.post(
            "/auth/login",
            json={"email": email, "password": "WrongPassword999!"},
        )
        assert login_res.status_code == 401
        assert "Invalid email or password" in login_res.json()["detail"]

    def test_03_unregistered_email_login_rejection(self):
        """3. Verify that an unregistered email address results in HTTP 401 Unauthorized."""
        random_email = generate_unique_email("nonexistent")
        login_res = client.post(
            "/auth/login",
            json={"email": random_email, "password": "AnyPassword123!"},
        )
        assert login_res.status_code == 401
        assert "Invalid email or password" in login_res.json()["detail"]

    def test_04_duplicate_registration_handling(self):
        """4. Verify that attempting to register an existing email returns HTTP 400."""
        email = generate_unique_email("duplicate")
        payload = {
            "full_name": "Initial User",
            "email": email,
            "password": "Password123!",
        }

        # First registration should succeed
        res1 = client.post("/auth/register", json=payload)
        assert res1.status_code == 201

        # Second registration with duplicate email must fail with 400 Bad Request
        res2 = client.post("/auth/register", json=payload)
        assert res2.status_code == 400
        assert "Email is already registered" in res2.json()["detail"]

    def test_05_public_registration_strictly_assigns_employee_role(self):
        """5. Verify that public registration always assigns 'Employee' role, blocking 'Admin'."""
        email = generate_unique_email("priv_escalation")
        # Attempt privilege escalation by passing "role": "Admin" in payload
        payload = {
            "full_name": "Attacker Trying Admin",
            "email": email,
            "password": "Password123!",
            "role": "Admin",
        }

        reg_res = client.post("/auth/register", json=payload)
        assert reg_res.status_code == 201
        data = reg_res.json()
        assert data["role"] == "Employee"

        # Verify directly in the database that role is Employee (not Admin)
        with TestingSessionLocal() as db:
            user = db.query(User).filter(User.email == email.lower()).first()
            assert user is not None
            assert user.role.name == "Employee"
            assert user.role.name != "Admin"

    def test_06_admin_provisioning_script_flow(self):
        """6. Verify backend admin provisioning: creates Admin, checks uniqueness, enforces password rules."""
        admin_email = generate_unique_email("sys_admin")
        admin_pass = "AdminSuperSecret2026!"

        with TestingSessionLocal() as db:
            # 6a. Successfully provision an Admin
            admin_user = provision_admin(
                full_name="System Administrator",
                email=admin_email,
                password=admin_pass,
                db=db,
            )
            assert admin_user.id is not None
            assert admin_user.role.name == "Admin"

            # 6b. Attempt duplicate email provisioning (must raise ValueError)
            with pytest.raises(ValueError) as dup_err:
                provision_admin(
                    full_name="Duplicate Admin",
                    email=admin_email,
                    password="AnotherPassword123!",
                    db=db,
                )
            assert "already exists" in str(dup_err.value)

            # 6c. Attempt password under 8 chars (must raise ValueError)
            with pytest.raises(ValueError) as short_pw_err:
                provision_admin(
                    full_name="Short PW Admin",
                    email=generate_unique_email("short_pw"),
                    password="short",
                    db=db,
                )
            assert "at least 8 characters" in str(short_pw_err.value)

    def test_07_employee_receiving_403_on_document_upload(self):
        """7. Verify that authenticated non-admin users receive 403 Forbidden on document upload."""
        emp_email = generate_unique_email("emp_upload")
        emp_password = "EmployeePassword123!"

        # Register and login employee
        client.post(
            "/auth/register",
            json={
                "full_name": "Standard Employee",
                "email": emp_email,
                "password": emp_password,
            },
        )
        login_res = client.post(
            "/auth/login",
            json={"email": emp_email, "password": emp_password},
        )
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Attempt to upload document as employee
        dummy_file = io.BytesIO(b"%PDF-1.4 mock content")
        upload_res = client.post(
            "/documents/upload",
            headers=headers,
            data={
                "title": "Unauthorized Document",
                "department": "HR",
                "document_type": "Policy",
            },
            files={"file": ("test.pdf", dummy_file, "application/pdf")},
        )

        assert upload_res.status_code == 403
        assert "Admin access required" in upload_res.json()["detail"]

    def test_08_admin_authorized_for_document_upload_route(self):
        """8. Verify that a provisioned Admin user passes the require_admin dependency."""
        admin_email = generate_unique_email("admin_upload")
        admin_pass = "AuthorizedAdmin2026!"

        # Provision Admin account in database
        with TestingSessionLocal() as db:
            provision_admin(
                full_name="Upload Admin",
                email=admin_email,
                password=admin_pass,
                db=db,
            )

        # Login as Admin
        login_res = client.post(
            "/auth/login",
            json={"email": admin_email, "password": admin_pass},
        )
        assert login_res.status_code == 200
        admin_token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {admin_token}"}

        # Verify access to admin test route
        admin_test_res = client.get("/admin/test", headers=headers)
        assert admin_test_res.status_code == 200
        assert admin_test_res.json()["role"] == "Admin"
        assert admin_test_res.json()["message"] == "Admin access granted"
