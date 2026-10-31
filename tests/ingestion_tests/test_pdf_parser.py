from ingestion_pipeline.document_parsing.pdf_parser import extract_text_from_pdf

pdf_path = (
    "data/uploads/"
    "b71bace9ad6f4836aadbe2a13c659a1c.pdf"
)

pages = extract_text_from_pdf(pdf_path)

print("Total extracted pages:", len(pages))

for page in pages[:2]:
    print(f"\n--- Page {page['page_number']} ---")
    print(page["text"][:1000])