import os
import traceback
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types

PROJECT_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(PROJECT_ROOT / ".env")

api_key = os.getenv("GEMINI_API_KEY") or os.getenv("LLM_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY is missing from .env")

client = genai.Client(
    api_key=api_key,
    http_options=types.HttpOptions(timeout=30000),
)

GENERATION_MODEL = os.getenv("LLM_MODEL") or "gemini-3.1-flash-lite"

NOT_AVAILABLE_MESSAGE = (
    "The available documents do not contain sufficient information "
    "to answer this question."
)


def generate_answer(query: str, retrieved_chunks: list[dict]) -> str:
    """Synthesize a grounded, cited answer from retrieved document chunks."""
    if not retrieved_chunks:
        return NOT_AVAILABLE_MESSAGE

    context = ""

    for index, chunk in enumerate(retrieved_chunks, start=1):
        context += (
            f"\n[Source {index}]\n"
            f"Document: {chunk['document_title']}\n"
            f"Page: {chunk['page_number']}\n"
            f"Content: {chunk['content']}\n"
        )

    prompt = f"""You are an enterprise knowledge assistant for Infosys.

Answer the user's question using ONLY the supplied document context.

STRICT RULES:
1. Never use outside knowledge or assumptions.
2. Never invent facts, figures, policies, or procedures.
3. If the supplied context does not contain sufficient evidence, respond exactly:
   "{NOT_AVAILABLE_MESSAGE}"
4. If only part of the answer is available, clearly state which information is available and which is not.
5. Cite the supporting document title and page number for every claim (e.g., [Document Title, Page X]).
6. Keep the answer clear and concise.
7. Do not treat unrelated retrieved content as evidence.

DOCUMENT CONTEXT:
{context}

USER QUESTION:
{query}

ANSWER:
"""

    try:
        response = client.models.generate_content(
            model=GENERATION_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.1,
            ),
        )

        answer = response.text

        if not answer or not answer.strip():
            return "Unable to generate an answer. Please try again."

        return answer.strip()

    except Exception as error:
        print("\n--- GEMINI GENERATION ERROR ---")
        traceback.print_exc()
        print(f"LLM Error Details: {error}")

        return (
            "The answer service is temporarily unavailable. "
            "Please try again later."
        )