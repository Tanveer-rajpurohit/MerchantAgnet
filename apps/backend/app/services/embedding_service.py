"""
Local embedding service using fastembed (BAAI/bge-small-en-v1.5, 384-dim).

Runs entirely on CPU — no API calls, no GPU, no network after the one-time
model download. The ONNX model (~130MB) is cached at ~/.cache/fastembed after
the first invocation.

COLD-START HANDLING:
The first call to `_embedder.embed()` triggers a one-time ONNX model load +
warmup that can take 10-30 seconds. This used to block the agent stream on
the very first chat message, causing the "temporary issue, please try again"
error.

We now:
  1. Defer model instantiation until first use (so module import is instant).
  2. Pre-warm the model at app startup (see app/main.py _prewarm_embedding_model)
     in a background thread, so by the time the first real request arrives the
     model is already loaded and `get_embedding()` returns in ~50ms.
  3. If pre-warm hasn't finished when the first request arrives, that request
     will still pay the cold-start cost — but the friendly "Just warming up"
     message in agent_service.py handles that case gracefully.
"""

import logging
import threading
from typing import Optional
from fastembed import TextEmbedding

logger = logging.getLogger(__name__)


_embedder: Optional[TextEmbedding] = None
_embedder_lock = threading.Lock()


def _get_embedder() -> TextEmbedding:
    """Get the singleton TextEmbedding instance, instantiating it on first use."""
    global _embedder
    if _embedder is None:
        with _embedder_lock:
            if _embedder is None:
                logger.info("Initializing fastembed TextEmbedding (BAAI/bge-small-en-v1.5)...")
                _embedder = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
                logger.info("TextEmbedding initialized")
    return _embedder


def prewarm_embedding_model() -> None:
    """Pre-warm the ONNX model by running a tiny dummy embedding.

    Call this at app startup (in a background thread) so the first real
    `get_embedding()` call is fast. Safe to call multiple times — the warmup
    runs only once.
    """
    try:
        embedder = _get_embedder()
        _ = list(embedder.embed(["warmup"]))[0].tolist()
        logger.info("Embedding model pre-warmed (BAAI/bge-small-en-v1.5)")
    except Exception as warmup_err:
        logger.warning("Embedding warmup failed (will retry on first request): %s", warmup_err)


def get_embedding(text: str) -> list[float]:
    """Get the 384-dim embedding for a text. Returns a plain list of floats.

    On the very first call (or if pre-warm hasn't finished), this pays the
    one-time ONNX model load cost (~10-30s). Subsequent calls return in ~50ms.
    """
    embedder = _get_embedder()
    return list(embedder.embed([text]))[0].tolist()
