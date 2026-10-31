import os
from fastapi import (
    Depends,
    FastAPI,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from ai_workflows.grounded_synthesis.answer_service import (
    NOT_AVAILABLE_MESSAGE,
    generate_answer,
)
from ai_workflows.rag_retrieval.retrieval_service import search_similar_chunks
from backend.auth.dependencies import get_current_user
from backend.auth.permissions import require_admin
from backend.auth.schemas import UserLogin, UserRegister
from backend.auth.service import login_user, register_user
from backend.auth.token import create_access_token
from backend.database.dependencies import get_db
from backend.database.models import Document
from backend.services.document_schemas import DocumentResponse
from backend.services.document_service import save_document
from backend.services.query_schemas import QueryRequest

app = FastAPI(
    title="Infosys AI Knowledge Assistant",
    description="AI-powered enterprise knowledge assistant",
    version="1.0.0",
)

# Enable CORS for local development and Vercel frontend deployment
cors_origins_env = os.getenv("CORS_ORIGINS", "*")
allowed_origins = (
    ["*"]
    if cors_origins_env == "*"
    else [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Infosys AI Knowledge Assistant API"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.post("/auth/register", status_code=status.HTTP_201_CREATED)
def register(
    user_data: UserRegister,
    db: Session = Depends(get_db),
):
    try:
        new_user = register_user(user_data, db)

        return {
            "message": "Registration successful",
            "user_id": new_user.id,
            "full_name": new_user.full_name,
            "email": new_user.email,
            "role": "Employee",
        }

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@app.post("/auth/login")
def login(
    user_data: UserLogin,
    db: Session = Depends(get_db),
):
    try:
        user = login_user(user_data, db)
        access_token = create_access_token(user.id)

        return {
            "message": "Login successful",
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "role": user.role.name,
            },
        }

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(error),
        )


@app.get("/auth/me")
def get_my_profile(current_user=Depends(get_current_user)):
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role.name,
    }


@app.get("/admin/test")
def admin_test(current_user=Depends(require_admin)):
    return {
        "message": "Admin access granted",
        "user": current_user.full_name,
        "role": current_user.role.name,
    }


@app.get("/documents", response_model=list[DocumentResponse])
def list_documents(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all uploaded documents ordered by newest first."""
    return db.query(Document).order_by(Document.uploaded_at.desc()).all()


@app.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    department: str = Form(...),
    document_type: str = Form(...),
    current_user=Depends(require_admin),
    db: Session = Depends(get_db),
):
    result = await save_document(
        file=file,
        title=title,
        department=department,
        document_type=document_type,
        current_user=current_user,
        db=db,
    )

    return {
        "message": "Document uploaded and processed successfully",
        "uploaded_by": current_user.full_name,
        **result,
    }


@app.post("/query")
def query_documents(
    request: QueryRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    chunks = search_similar_chunks(
        db=db,
        query=request.question,
        top_k=request.top_k,
        department=request.department,
    )

    sources = [
        {
            "document_title": chunk["document_title"],
            "document_id": chunk["document_id"],
            "department": chunk.get("department"),
            "page_number": chunk["page_number"],
            "chunk_id": chunk["chunk_id"],
            "similarity": round(chunk["similarity"], 4),
        }
        for chunk in chunks
    ]

    if not chunks:
        return {
            "question": request.question,
            "answer": NOT_AVAILABLE_MESSAGE,
            "sources": [],
        }

    answer = generate_answer(
        query=request.question,
        retrieved_chunks=chunks,
    )

    return {
        "question": request.question,
        "answer": answer,
        "sources": sources,
    }