import os
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types

PROJECT_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(PROJECT_ROOT / ".env")

api_key = os.getenv("GEMINI_API_KEY") or os.getenv("LLM_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY is missing from .env")

client = genai.Client(api_key=api_key)

EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "gemini-embedding-001")
EMBEDDING_DIMENSIONS = int(os.getenv("EMBEDDING_DIMENSION", "1536"))


def generate_embedding(
    text: str,
    task_type: str = "RETRIEVAL_DOCUMENT",
) -> list[float]:
    """Generate an embedding vector for a single text string."""
    if not text or not text.strip():
        raise ValueError("Text for embedding cannot be empty")

    response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text.strip(),
        config=types.EmbedContentConfig(
            output_dimensionality=EMBEDDING_DIMENSIONS,
            task_type=task_type,
        ),
    )

    return response.embeddings[0].values


def generate_embeddings(
    texts: list[str],
    task_type: str = "RETRIEVAL_DOCUMENT",
) -> list[list[float]]:
    """Generate embedding vectors for a batch of texts."""
    if not texts:
        return []

    response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=texts,
        config=types.EmbedContentConfig(
            output_dimensionality=EMBEDDING_DIMENSIONS,
            task_type=task_type,
        ),
    )

    return [item.values for item in response.embeddings]