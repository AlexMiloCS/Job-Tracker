import { useState, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * useJobAutofill — calls POST /api/groq/parse-job to extract
 * structured job fields from a raw description.
 *
 * Returns:
 *   parsedJob           — { company, title, workModel, city, country, requirements } (or null)
 *   error               — error message string (or null)
 *   isLoading           — true while a request is in-flight
 *   parseJobDescription — async function that triggers the parse
 */
export function useJobAutofill() {
  const [parsedJob, setParsedJob] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const parseJobDescription = useCallback(async (description) => {
    setIsLoading(true);
    setError(null);
    setParsedJob(null);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/groq/parse-job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ description }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Request failed with status ${response.status}`);
      }

      setParsedJob(result);
      return result;
    } catch (err) {
      const message = err.message || 'An unexpected error occurred';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { parsedJob, error, isLoading, parseJobDescription };
}
