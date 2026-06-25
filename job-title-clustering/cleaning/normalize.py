"""
cleaning/normalize.py
---------------------
Provides a function to normalize raw job titles before embedding.
"""

import re


def normalize_title(title: str) -> str:
    """Clean a single job title string.

    Steps:
        1. Convert to lowercase.
        2. Remove any text inside parentheses (including the parentheses).
        3. Strip leading/trailing whitespace.

    Args:
        title: The raw job title string.

    Returns:
        The cleaned, normalized title.
    """
    # Lowercase
    title = title.lower()

    # Remove parenthesised text, e.g. "(R&D / EU P...)"
    title = re.sub(r"\([^)]*\)", "", title)

    # Collapse any leftover multiple spaces and strip
    title = re.sub(r"\s+", " ", title).strip()

    return title


def normalize_titles(titles: list[str]) -> list[str]:
    """Apply normalize_title to every element in a list.

    Args:
        titles: A list of raw job title strings.

    Returns:
        A new list of cleaned title strings (same order).
    """
    return [normalize_title(t) for t in titles]
