def chunk_text(
    pages: list[dict],
    chunk_size: int = 1000,
    chunk_overlap: int = 200,
) -> list[dict]:
    """Split PDF pages into overlapping text chunks without cutting words in half."""
    if chunk_size <= 0:
        raise ValueError("chunk_size must be greater than zero")

    if chunk_overlap < 0 or chunk_overlap >= chunk_size:
        raise ValueError(
            "chunk_overlap must be non-negative and smaller than chunk_size"
        )

    chunks = []
    chunk_index = 0

    for page in pages:
        text = page.get("text", "").strip()
        page_number = page.get("page_number", 1)

        if not text:
            continue

        start = 0
        text_length = len(text)

        while start < text_length:
            end = min(start + chunk_size, text_length)

            # Avoid splitting in the middle of a word if not at the end of the page
            if end < text_length:
                last_space = text.rfind(" ", start, end)
                if last_space > start + chunk_overlap:
                    end = last_space

            content = text[start:end].strip()

            if content:
                chunks.append({
                    "chunk_index": chunk_index,
                    "page_number": page_number,
                    "content": content,
                })
                chunk_index += 1

            if end >= text_length:
                break

            start = end - chunk_overlap

    return chunks