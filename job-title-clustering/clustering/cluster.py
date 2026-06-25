"""
clustering/cluster.py
---------------------
Applies K-Means clustering to group embedding vectors,
and provides utilities to print and return the results.
"""

from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
import numpy as np


def find_optimal_k(embeddings: np.ndarray, max_k: int, random_state: int = 42) -> tuple[int, KMeans]:
    """Find the optimal number of clusters using Silhouette Score."""
    best_k = 2
    best_score = -1
    best_kmeans = None

    for k in range(2, max_k + 1):
        kmeans = KMeans(n_clusters=k, random_state=random_state, n_init=10)
        labels = kmeans.fit_predict(embeddings)
        score = silhouette_score(embeddings, labels)
        
        if score > best_score:
            best_score = score
            best_k = k
            best_kmeans = kmeans

    return best_k, best_kmeans


def cluster_titles(
    embeddings: np.ndarray,
    n_clusters: int | None = None,
    random_state: int = 42,
) -> tuple[np.ndarray, KMeans]:
    """Run K-Means on the embedding matrix.

    Args:
        embeddings:   numpy array of shape (n_titles, embedding_dim).
        n_clusters:   Number of clusters to form. If None, uses dynamic K-Means.
        random_state: Seed for reproducibility.

    Returns:
        A tuple of (labels array, fitted KMeans model).
    """
    if n_clusters is None:
        # Dynamic K-Means using Silhouette Score
        # max_k is min(8, n_samples - 1)
        max_k = min(8, len(embeddings) - 1)
        if max_k < 2:
            # Fallback if there are too few samples
            kmeans = KMeans(n_clusters=1, random_state=random_state, n_init=10)
            labels = kmeans.fit_predict(embeddings)
            return labels, kmeans
            
        _, kmeans = find_optimal_k(embeddings, max_k, random_state)
        labels = kmeans.labels_
    else:
        kmeans = KMeans(
            n_clusters=n_clusters,
            random_state=random_state,
            n_init=10,
        )
        labels = kmeans.fit_predict(embeddings)
        
    return labels, kmeans


def assign_to_nearest_cluster(embedding: np.ndarray, kmeans_model: KMeans) -> int:
    """Assign a single embedding to the nearest cluster centroid."""
    # Ensure embedding is 2D: (1, embedding_dim)
    if embedding.ndim == 1:
        embedding = embedding.reshape(1, -1)
    return int(kmeans_model.predict(embedding)[0])


def group_by_cluster(
    original_titles: list[str],
    cleaned_titles: list[str],
    labels: np.ndarray,
) -> dict[int, list[dict]]:
    """Organize titles into a dict keyed by cluster number."""
    groups: dict[int, list[dict]] = {}
    for orig, clean, label in zip(original_titles, cleaned_titles, labels):
        cluster_id = int(label)
        groups.setdefault(cluster_id, []).append(
            {"original": orig, "cleaned": clean}
        )
    return groups


def print_clusters(groups: dict[int, list[dict]]) -> None:
    for cluster_id in sorted(groups.keys()):
        titles = groups[cluster_id]
        print(f"\n--- Cluster {cluster_id} ({len(titles)} titles) ---")
        for entry in titles:
            print(f"  • {entry['original']}")
    print()
