"""
main.py
-------
Entry point for the Job Title Clustering pipeline.

Pulls job titles from your MongoDB Atlas database, then runs:
    1. Cleaning   — normalize the raw titles
    2. Embedding  — vectorize them with all-MiniLM-L6-v2
    3. Clustering  — group with K-Means (k=6)

Usage:
    python main.py              # fetches titles from MongoDB
    python main.py --fallback   # uses built-in sample titles if DB is unavailable
"""

import argparse
import os
import sys

from dotenv import load_dotenv

# ── Import the three pipeline stages ──────────────────────────
from cleaning.normalize import normalize_titles
from embedding.embed import generate_embeddings
from clustering.cluster import cluster_titles, group_by_cluster, print_clusters


# ── Sample titles (used with --fallback flag) ─────────────────
SAMPLE_TITLES = [
    "Software Engineer",
    "Senior Software Engineer",
    "Junior Software Developer",
    "Full Stack Developer",
    "Frontend Developer (React)",
    "Backend Engineer (Node.js / Python)",
    "Data Scientist",
    "Machine Learning Engineer",
    "Data Analyst",
    "Business Intelligence Analyst",
    "DevOps Engineer",
    "Cloud Infrastructure Engineer (AWS)",
    "Site Reliability Engineer",
    "Product Manager",
    "Senior Product Manager (R&D / EU Platform)",
    "Technical Product Owner",
    "UX Designer",
    "UI/UX Designer",
    "Graphic Designer",
    "QA Engineer",
    "Quality Assurance Analyst",
    "Test Automation Engineer",
    "iOS Developer",
    "Android Developer",
    "Mobile Developer (React Native)",
    "Security Engineer",
    "Cybersecurity Analyst",
    "Solutions Architect",
    "Systems Administrator",
    "Network Engineer",
]

N_CLUSTERS = 6


def fetch_titles_from_mongo() -> list[str]:
    """Connect to MongoDB Atlas and pull all distinct job titles.

    Returns:
        A list of unique, non-empty title strings.

    Raises:
        SystemExit: If the connection fails or no titles are found.
    """
    # Load env vars from the backend .env file
    backend_env = os.path.join(os.path.dirname(__file__), "..", "backend", ".env")
    load_dotenv(backend_env)

    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri:
        print("ERROR: MONGO_URI not found in environment or backend/.env")
        sys.exit(1)

    try:
        from pymongo import MongoClient

        client = MongoClient(mongo_uri)
        db = client.get_default_database() or client["test"]
        jobs_collection = db["jobs"]

        # Pull every unique, non-empty title
        titles = jobs_collection.distinct("title", {"title": {"$ne": None, "$ne": ""}})
        titles = [t for t in titles if isinstance(t, str) and t.strip()]

        if not titles:
            print("WARNING: No job titles found in the database. Use --fallback for sample data.")
            sys.exit(1)

        print(f"  Fetched {len(titles)} unique titles from MongoDB.")
        return titles

    except Exception as e:
        print(f"ERROR: Could not connect to MongoDB — {e}")
        print("  Hint: use --fallback to run with built-in sample titles instead.")
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="Job Title Clustering Pipeline")
    parser.add_argument(
        "--fallback",
        action="store_true",
        help="Use built-in sample titles instead of fetching from MongoDB",
    )
    parser.add_argument(
        "--clusters",
        type=int,
        default=N_CLUSTERS,
        help=f"Number of K-Means clusters (default: {N_CLUSTERS})",
    )
    args = parser.parse_args()

    # ── Step 0: Get the titles ────────────────────────────────
    if args.fallback:
        print("\n[Using built-in sample titles]")
        raw_titles = SAMPLE_TITLES
    else:
        print("\n[Fetching titles from MongoDB Atlas...]")
        raw_titles = fetch_titles_from_mongo()

    print(f"  Total titles: {len(raw_titles)}")

    # Ensure we have enough titles for the requested clusters
    n_clusters = min(args.clusters, len(raw_titles))
    if n_clusters < args.clusters:
        print(f"  Adjusted clusters from {args.clusters} to {n_clusters} (not enough titles)")

    # ── Step 1: Clean ─────────────────────────────────────────
    print("\n[Step 1] Cleaning titles...")
    cleaned = normalize_titles(raw_titles)
    for raw, clean in zip(raw_titles[:5], cleaned[:5]):
        print(f"  '{raw}'  ->  '{clean}'")
    if len(raw_titles) > 5:
        print(f"  ... and {len(raw_titles) - 5} more")

    # ── Step 2: Embed ─────────────────────────────────────────
    print("\n[Step 2] Generating embeddings...")
    embeddings = generate_embeddings(cleaned)
    print(f"  Embeddings shape: {embeddings.shape}")

    # ── Step 3: Cluster ───────────────────────────────────────
    print(f"\n[Step 3] Clustering into {n_clusters} groups...")
    labels = cluster_titles(embeddings, n_clusters=n_clusters)
    groups = group_by_cluster(raw_titles, cleaned, labels)
    print_clusters(groups)

    print("Done!")


if __name__ == "__main__":
    main()
