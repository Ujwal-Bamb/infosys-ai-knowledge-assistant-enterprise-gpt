from pathlib import Path
import pymupdf


def extract_text_from_pdf(file_path: str) -> list[dict]:
    """Extract clean text from each page of a PDF."""
    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"PDF not found: {file_path}")

    pages = []

    try:
        with pymupdf.open(path) as pdf:
            for page_number, page in enumerate(pdf, start=1):
                text = page.get_text("text").strip()

                if text:
                    pages.append({
                        "page_number": page_number,
                        "text": text,
                    })
    except Exception as exc:
        raise ValueError(f"Failed to read PDF file '{path.name}': {exc}")

    return pages