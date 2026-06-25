"""
embedding/embed.py
------------------
Generates sentence embeddings for a list of job titles
using the all-MiniLM-L6-v2 model from sentence-transformers.
"""

from sentence_transformers import SentenceTransformer
import numpy as np


# Module-level cache so the model is only loaded once per process
_model = None


def _get_model() -> SentenceTransformer:
    """Lazy-load and cache the sentence-transformer model."""
    global _model
    if _model is None:
        print("  Loading all-MiniLM-L6-v2 model...")
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def generate_embeddings(titles: list[str]) -> np.ndarray:
    """Convert a list of cleaned job titles into dense vectors.

    Args:
        titles: A list of normalized title strings.

    Returns:
        A numpy array of shape (len(titles), 384) containing
        the embedding vectors.
    """
    model = _get_model()
    embeddings = model.encode(titles, show_progress_bar=True)
    return np.array(embeddings)
