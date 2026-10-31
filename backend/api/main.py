
import json
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
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from ai_workflows.grounded_synthesis.answer_service import (
    NOT_AVAILABLE_MESSAGE,
    generate_answer,
)
from ai_workflows.rag_retrieval.retrieval_service import search_similar_chunks
from backend.auth.dependencies import get_current_user
from backend.auth.permissions import require_admin
from backend.auth.schemas import PasswordChangeRequest, UserLogin, UserRegister
from backend.auth.service import change_user_password, login_user, register_user
from backend.auth.token import create_access_token
from backend.database.dependencies import get_db
from backend.database.models import Base, Document, QueryHistory
from backend.services.document_schemas import DocumentResponse
from backend.services.document_service import delete_document_by_id, save_document
from backend.services.query_schemas import (
    DashboardStatsResponse,
    QueryHistoryItem,
    QueryRequest,
    QueryResponse,
)

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


@app.on_event("startup")
def on_startup():
    try:
        from backend.database.connection import engine
        Base.metadata.create_all(bind=engine)
    except Exception as exc:
        print(f"Startup table creation warning: {exc}")


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


@app.post("/auth/change-password")
def change_password(
    request: PasswordChangeRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        change_user_password(
            user=current_user,
            current_password=request.current_password,
            new_password=request.new_password,
            db=db,
        )
        return {"message": "Password updated successfully"}
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


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
    """List all uploaded documents ordered by newest first with chunk and page counts."""
    docs = (
        db.query(Document)
        .options(joinedload(Document.chunks))
        .order_by(Document.uploaded_at.desc())
        .all()
    )
    result = []
    for doc in docs:
        page_count = max((c.page_number for c in doc.chunks), default=1)
        chunk_count = len(doc.chunks)
        result.append(
            DocumentResponse(
                id=doc.id,
                document_id=doc.document_id,
                title=doc.title,
                filename=doc.filename,
                department=doc.department,
                document_type=doc.document_type,
                access_scope=doc.access_scope,
                uploaded_at=doc.uploaded_at,
                page_count=page_count,
                chunk_count=chunk_count,
            )
        )
    return result


@app.delete("/documents/{doc_id}")
def delete_document(
    doc_id: int,
    current_user=Depends(require_admin),
    db: Session = Depends(get_db),
):
    delete_document_by_id(doc_id=doc_id, db=db)
    return {"message": "Document deleted successfully"}


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


@app.post("/query", response_model=QueryResponse)
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

    # Remove duplicate sources from the same document and page
    seen_sources = set()
    unique_sources = []

    for chunk in chunks:
        source_key = (chunk["document_title"], chunk["page_number"])

        if source_key not in seen_sources:
            seen_sources.add(source_key)
            unique_sources.append({
                "document_title": chunk["document_title"],
                "document_id": chunk["document_id"],
                "department": chunk.get("department"),
                "page_number": chunk["page_number"],
                "chunk_id": chunk["chunk_id"],
                "similarity": round(chunk["similarity"], 4),
            })

    sources = unique_sources

    if not chunks:
        answer = NOT_AVAILABLE_MESSAGE
        has_sufficient_evidence = False
    else:
        answer = generate_answer(
            query=request.question,
            retrieved_chunks=chunks,
        )
        has_sufficient_evidence = answer.strip() != NOT_AVAILABLE_MESSAGE

    history_record = QueryHistory(
        user_id=current_user.id,
        question=request.question,
        answer=answer,
        department=request.department,
        sources_json=json.dumps(sources),
        has_sufficient_evidence=has_sufficient_evidence,
    )
    db.add(history_record)
    db.commit()
    db.refresh(history_record)

    return {
        "query_id": history_record.id,
        "question": request.question,
        "answer": answer,
        "sources": sources,
        "has_sufficient_evidence": has_sufficient_evidence,
    }


@app.get("/queries/history", response_model=list[QueryHistoryItem])
def get_query_history(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve logged-in user's past queries ordered newest first."""
    records = (
        db.query(QueryHistory)
        .filter(QueryHistory.user_id == current_user.id)
        .order_by(QueryHistory.created_at.desc())
        .all()
    )
    results = []
    for r in records:
        try:
            parsed = json.loads(r.sources_json) if r.sources_json else []
        except Exception:
            parsed = []
        results.append(
            QueryHistoryItem(
                id=r.id,
                question=r.question,
                answer=r.answer,
                department=r.department,
                sources=parsed,
                has_sufficient_evidence=r.has_sufficient_evidence,
                created_at=r.created_at,
            )
        )
    return results


@app.delete("/queries/history")
def clear_query_history(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete all queries belonging to current user only."""
    deleted_count = (
        db.query(QueryHistory)
        .filter(QueryHistory.user_id == current_user.id)
        .delete(synchronize_session=False)
    )
    db.commit()
    return {
        "message": "Query history cleared successfully",
        "deleted_count": deleted_count,
    }


@app.delete("/queries/history/{query_id}")
def delete_single_query(
    query_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a single query belonging to the current user."""
    item = (
        db.query(QueryHistory)
        .filter(
            QueryHistory.id == query_id,
            QueryHistory.user_id == current_user.id,
        )
        .first()
    )
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Query history item not found",
        )
    db.delete(item)
    db.commit()
    return {"message": "Query item deleted successfully"}


@app.get("/analytics/dashboard-stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Compute real database statistics and user query activity."""
    total_docs = db.query(Document).count()

    dept_count = (
        db.query(func.count(func.distinct(Document.department)))
        .filter(Document.department.isnot(None), Document.department != "")
        .scalar()
        or 0
    )

    user_queries = (
        db.query(QueryHistory)
        .filter(QueryHistory.user_id == current_user.id)
        .order_by(QueryHistory.created_at.desc())
        .all()
    )
    user_queries_count = len(user_queries)

    if user_queries_count > 0:
        helpful_count = sum(1 for q in user_queries if q.has_sufficient_evidence)
        answered_rate = round((helpful_count / user_queries_count) * 100, 1)
    else:
        answered_rate = 0.0

    recent_queries_items = []
    for q in user_queries[:5]:
        try:
            parsed = json.loads(q.sources_json) if q.sources_json else []
        except Exception:
            parsed = []
        recent_queries_items.append(
            QueryHistoryItem(
                id=q.id,
                question=q.question,
                answer=q.answer,
                department=q.department,
                sources=parsed,
                has_sufficient_evidence=q.has_sufficient_evidence,
                created_at=q.created_at,
            )
        )

    recent_docs_entities = (
        db.query(Document)
        .options(joinedload(Document.chunks))
        .order_by(Document.uploaded_at.desc())
        .limit(5)
        .all()
    )
    recent_docs_items = []
    for d in recent_docs_entities:
        page_count = max((c.page_number for c in d.chunks), default=1)
        chunk_count = len(d.chunks)
        recent_docs_items.append(
            DocumentResponse(
                id=d.id,
                document_id=d.document_id,
                title=d.title,
                filename=d.filename,
                department=d.department,
                document_type=d.document_type,
                access_scope=d.access_scope,
                uploaded_at=d.uploaded_at,
                page_count=page_count,
                chunk_count=chunk_count,
            )
        )

    return DashboardStatsResponse(
        total_documents=total_docs,
        total_departments=dept_count,
        user_recent_queries_count=user_queries_count,
        answered_rate=answered_rate,
        recent_queries=recent_queries_items,
        recent_documents=recent_docs_items,
    )
