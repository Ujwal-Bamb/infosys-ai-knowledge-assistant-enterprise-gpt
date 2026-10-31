
from ingestion_pipeline.document_parsing.pdf_parser import extract_text_from_pdf
from ingestion_pipeline.chunking.text_chunker import chunk_text

pdf_path = (
    "data/uploads/"
    "b71bace9ad6f4836aadbe2a13c659a1c.pdf"
)

pages = extract_text_from_pdf(pdf_path)

chunks = chunk_text(
    pages,
    chunk_size=1000,
    chunk_overlap=200
)

print("Total pages:", len(pages))
print("Total chunks:", len(chunks))

for chunk in chunks[:3]:
    print("\nChunk index:", chunk["chunk_index"])
    print("Page number:", chunk["page_number"])
    print("Content:", chunk["content"][:200])
