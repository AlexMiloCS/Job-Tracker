"""
app.py
------
Flask microservice that exposes the clustering pipeline as a REST API.

Endpoints:
  POST /cluster-all  - Cluster a list of titles (full pipeline)
  POST /assign       - Assign a single title to the nearest existing cluster

Runs on port 5001 by default.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import os
from dotenv import load_dotenv

# Load env vars from the backend .env file before other imports
backend_env = os.path.join(os.path.dirname(__file__), "..", "backend", ".env")
load_dotenv(backend_env)

from cleaning.normalize import normalize_title, normalize_titles
from embedding.embed import generate_embeddings
from clustering.cluster import (
    cluster_titles,
    assign_to_nearest_cluster,
    group_by_cluster,
)

app = Flask(__name__)
CORS(app)

# In-memory state: persists the KMeans model + cluster-label mapping
# across requests so /assign can work without re-clustering.
_state = {
    "kmeans_model": None,       # Fitted KMeans object
    "cluster_labels": {},       # {cluster_id: "Cluster 0", ...}
    "title_to_cluster": {},     # {"ai engineer": cluster_id, ...}
}


@app.route("/cluster-all", methods=["POST"])
def cluster_all():
    """Cluster a list of job titles.

    Request JSON:
        { "titles": ["AI Engineer", "Data Analyst", ...] }

    Response JSON:
        {
          "optimal_k": 4,
          "clusters": {
            "0": { "label": "Cluster 0", "titles": ["AI Engineer", "AI/ML Engineer"] },
            "1": { "label": "Cluster 1", "titles": ["Data Analyst"] },
            ...
          },
          "assignments": {
            "AI Engineer": { "clusterId": 0, "clusterLabel": "Cluster 0" },
            ...
          }
        }
    """
    data = request.get_json(force=True)
    titles = data.get("titles", [])

    if not titles or not isinstance(titles, list):
        return jsonify({"error": "titles must be a non-empty list of strings"}), 400

    # Filter out empty strings
    titles = [t for t in titles if isinstance(t, str) and t.strip()]
    if len(titles) < 2:
        # Can't cluster fewer than 2 titles
        single_result = {
            "optimal_k": 1,
            "clusters": {
                "0": {"label": "Cluster 0", "titles": titles}
            },
            "assignments": {
                t: {"clusterId": 0, "clusterLabel": "Cluster 0"} for t in titles
            },
        }
        return jsonify(single_result)

    # Step 1: Clean
    cleaned = normalize_titles(titles)

    # Deduplicate for embedding (but keep mapping to originals)
    unique_cleaned = list(set(cleaned))

    # Step 2: Embed
    embeddings = generate_embeddings(unique_cleaned)

    # Step 3: Cluster (dynamic k)
    labels, kmeans_model = cluster_titles(embeddings, n_clusters=None)

    # Build a mapping from cleaned title -> cluster_id
    cleaned_to_cluster = {}
    for clean, label in zip(unique_cleaned, labels):
        cleaned_to_cluster[clean] = int(label)

    # Store state for /assign
    _state["kmeans_model"] = kmeans_model
    n_clusters = kmeans_model.n_clusters
    _state["cluster_labels"] = {
        i: f"Cluster {i}" for i in range(n_clusters)
    }
    _state["title_to_cluster"] = dict(cleaned_to_cluster)

    # Build response: map each original title to its cluster
    clusters = {}
    assignments = {}
    for orig, clean in zip(titles, cleaned):
        cluster_id = cleaned_to_cluster[clean]
        label = _state["cluster_labels"][cluster_id]

        clusters.setdefault(str(cluster_id), {"label": label, "titles": []})
        if orig not in clusters[str(cluster_id)]["titles"]:
            clusters[str(cluster_id)]["titles"].append(orig)

        assignments[orig] = {
            "clusterId": cluster_id,
            "clusterLabel": label,
        }

    return jsonify({
        "optimal_k": n_clusters,
        "clusters": clusters,
        "assignments": assignments,
    })


@app.route("/assign", methods=["POST"])
def assign():
    """Assign a single title to the nearest existing cluster.

    Requires /cluster-all to have been called first (to establish centroids).

    Request JSON:
        { "title": "Gen AI Engineer" }

    Response JSON:
        { "clusterId": 0, "clusterLabel": "Cluster 0" }
    """
    if _state["kmeans_model"] is None:
        return jsonify({
            "error": "No clusters exist yet. Call /cluster-all first."
        }), 400

    data = request.get_json(force=True)
    title = data.get("title", "")

    if not title or not isinstance(title, str):
        return jsonify({"error": "title must be a non-empty string"}), 400

    # Clean and embed the single title
    cleaned = normalize_title(title)

    # Check if we've seen this exact cleaned title before
    if cleaned in _state["title_to_cluster"]:
        cluster_id = _state["title_to_cluster"][cleaned]
    else:
        embedding = generate_embeddings([cleaned])
        cluster_id = assign_to_nearest_cluster(
            embedding[0], _state["kmeans_model"]
        )
        # Cache it
        _state["title_to_cluster"][cleaned] = cluster_id

    label = _state["cluster_labels"].get(cluster_id, f"Cluster {cluster_id}")

    return jsonify({
        "clusterId": cluster_id,
        "clusterLabel": label,
    })



@app.route("/health", methods=["GET"])
def health():
    """Simple health check."""
    has_model = _state["kmeans_model"] is not None
    n_clusters = (
        _state["kmeans_model"].n_clusters if has_model else 0
    )
    return jsonify({
        "status": "ok",
        "model_loaded": has_model,
        "n_clusters": n_clusters,
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
