"""
clustering/cluster.py
---------------
Applies K-Means clustering to group embedding vectors.
Supports dynamic cluster count via Silhouette Score analysis
and fast single-title assignment to existing centroids.
"""

from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
import numpy as np


def find_optimal_k(
    embeddings: np.ndarray,
    min_k: int = 2,
    max_k: int = 8,
    random_state: int = 42,
) -> int:
    """Determine the optimal number of clusters using the Silhouette Score.

    Tries K-Means with k = min_k..max_k and picks the k that produces
    the highest average silhouette score (best-separated clusters).

    Args:
        embeddings:   numpy array of shape (n_samples, embedding_dim).
        min_k:        Minimum number of clusters to try.
        max_k:        Maximum number of clusters to try.
        random_state: Seed for reproducibility.

    Returns:
        The optimal k value.
    """
    n_samples = embeddings.shape[0]

    # Need at least 3 unique samples to compare k=2
    if n_samples < 3:
        return min(min_k, n_samples)

    # Cap max_k: can't have more clusters than samples
    max_k = min(max_k, n_samples - 1)

    if max_k < min_k:
        return min_k

    best_k = min_k
    best_score = -1

    for k in range(min_k, max_k + 1):
        kmeans = KMeans(
            n_clusters=k,
            random_state=random_state,
            n_init=10,
        )
        labels = kmeans.fit_predict(embeddings)

        # Silhouette score requires at least 2 distinct labels
        if len(set(labels)) < 2:
            continue

        score = silhouette_score(embeddings, labels)
        if score > best_score:
            best_score = score
            best_k = k

    return best_k


def cluster_titles(
    embeddings: np.ndarray,
    n_clusters: int | None = None,
    random_state: int = 42,
) -> tuple[np.ndarray, "KMeans"]:
    """Run K-Means on the embedding matrix.

    Args:
        embeddings:   numpy array of shape (n_titles, embedding_dim).
        n_clusters:   Number of clusters. If None, determined automatically
                      via Silhouette Score.
        random_state: Seed for reproducibility.

    Returns:
        A tuple of (labels, kmeans_model).
        - labels: 1-D numpy array of cluster assignments.
        - kmeans_model: the fitted KMeans object (holds centroids).
    """
    if n_clusters is None:
        n_clusters = find_optimal_k(embeddings, random_state=random_state)

    kmeans = KMeans(
        n_clusters=n_clusters,
        random_state=random_state,
        n_init=10,
    )
    labels = kmeans.fit_predict(embeddings)
    return labels, kmeans


def assign_to_nearest_cluster(
    embedding: np.ndarray,
    kmeans_model: "KMeans",
) -> int:
    """Assign a single embedding to the nearest existing centroid.

    Args:
        embedding:    A 1-D numpy array (embedding_dim,) or 2-D (1, dim).
        kmeans_model: A previously fitted KMeans model.

    Returns:
        The cluster ID (int) of the nearest centroid.
    """
    if embedding.ndim == 1:
        embedding = embedding.reshape(1, -1)
    label = kmeans_model.predict(embedding)
    return int(label[0])


def group_by_cluster(
    original_titles: list[str],
    cleaned_titles: list[str],
    labels: np.ndarray,
) -> dict[int, list[dict]]:
    """Organize titles into a dict keyed by cluster number.

    Args:
        original_titles: The raw, unmodified job titles.
        cleaned_titles:  The normalized versions used for embedding.
        labels:          Cluster assignment for each title.

    Returns:
        A dict mapping cluster_id -> list of
        {"original": ..., "cleaned": ...} dicts.
    """
    groups: dict[int, list[dict]] = {}
    for orig, clean, label in zip(original_titles, cleaned_titles, labels):
        cluster_id = int(label)
        groups.setdefault(cluster_id, []).append(
            {"original": orig, "cleaned": clean}
        )
    return groups


def print_clusters(groups: dict[int, list[dict]]) -> None:
    """Pretty-print the clustering results to stdout."""
    print("\n" + "=" * 60)
    print("  JOB TITLE CLUSTERS")
    print("=" * 60)

    for cluster_id in sorted(groups.keys()):
        titles = groups[cluster_id]
        print(f"\n--- Cluster {cluster_id} ({len(titles)} titles) ---")
        for entry in titles:
            print(f"  - {entry['original']}")
    print()
