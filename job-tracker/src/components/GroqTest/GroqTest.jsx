import { useState } from 'react';
import { useGroqCompletion } from '../../hooks/useGroqCompletion';

/**
 * GroqTest — Barebones, unstyled test component to verify
 * the end-to-end Groq integration works.
 *
 * Usage: Import and render <GroqTest /> on any page to test.
 */
export default function GroqTest() {
  const [prompt, setPrompt] = useState('');
  const { data, error, isLoading, getCompletion } = useGroqCompletion();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    await getCompletion([
      { role: 'user', content: prompt.trim() },
    ]);
  };

  return (
    <div>
      <h3>Groq LLM Test</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type a prompt..."
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Send'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {data && (
        <div>
          <h4>Response:</h4>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{data.content}</pre>
          <small>
            Tokens — prompt: {data.usage?.prompt_tokens}, completion: {data.usage?.completion_tokens}, total: {data.usage?.total_tokens}
          </small>
        </div>
      )}
    </div>
  );
}
