from backend.services.embedding_service import generate_embedding

text = "Infosys HR policies include leave and compensation guidelines."

embedding = generate_embedding(text)

print("Embedding generated successfully")
print("Dimensions:", len(embedding))
print("First 5 values:", embedding[:5])