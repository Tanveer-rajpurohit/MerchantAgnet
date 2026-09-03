from fastembed import TextEmbedding

_embedder = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")

def get_embedding(text: str) -> list[float]:
    return list(_embedder.embed([text]))[0].tolist()