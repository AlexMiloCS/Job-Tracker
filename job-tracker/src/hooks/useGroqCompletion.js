import { useState, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * useGroqCompletion — a reusable hook for calling the Groq LLM via our backend proxy.
 *
 * Returns:
 *   data       — { content, usage } from the last successful response (or null)
 *   error      — error message string (or null)
 *   isLoading  — true while a request is in-flight
 *   getCompletion — async function to trigger a completion request
 *
 * Usage:
 *   const { data, error, isLoading, getCompletion } = useGroqCompletion();
 *   await getCompletion([{ role: 'user', content: 'Hello!' }]);
 */
export function useGroqCompletion() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getCompletion = useCallback(async (messages, options = {}) => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/groq/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          messages,
          temperature: options.temperature,
          max_tokens: options.max_tokens,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Request failed with status ${response.status}`);
      }

      setData(result);
      return result;
    } catch (err) {
      const message = err.message || 'An unexpected error occurred';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, error, isLoading, getCompletion };
}
