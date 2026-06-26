import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { useSelector, useDispatch } from 'react-redux';
import { DEFAULT_LATEX_TEMPLATE } from '../../utils/defaultCvTemplate';
import './CVBuilder.css';
// import an action if you want to update local auth state, but here the backend updates the DB and we just need the URL

const API_URL = import.meta.env.VITE_API_URL;

function CVBuilder() {
  const [latexCode, setLatexCode] = useState(DEFAULT_LATEX_TEMPLATE);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [error, setError] = useState(null);
  
  const token = useSelector((state) => state.auth.token);

  const handleCompile = async () => {
    setIsCompiling(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/compile-cv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ latexCode })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Compilation failed');
      }

      const data = await response.json();
      if (data.generatedCvUrl) {
        setPdfUrl(`http://localhost:5000${data.generatedCvUrl}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <div className="cv-builder-page">
      <div className="cv-builder-header">
        <h2 style={{ margin: 0 }}>CV Builder</h2>
        <button 
          className="submit-btn compile-btn"
          onClick={handleCompile}
          disabled={isCompiling}
        >
          {isCompiling ? 'Compiling...' : 'Compile PDF'}
        </button>
      </div>
      
      {error && <div className="cv-error-message">{error}</div>}

      <div className="cv-builder-content">
        <div className="cv-editor-panel">
          <Editor
            height="100%"
            defaultLanguage="latex"
            theme="vs-dark"
            value={latexCode}
            onChange={(value) => setLatexCode(value)}
            options={{ 
              minimap: { enabled: false }, 
              wordWrap: 'on',
              fontSize: 14,
              padding: { top: 16 }
            }}
          />
        </div>
        <div className="cv-preview-panel">
          {pdfUrl ? (
            <iframe 
              src={pdfUrl} 
              title="PDF Preview" 
              className="cv-pdf-iframe"
            />
          ) : (
            <div className="cv-preview-placeholder">
              <div className="placeholder-content">
                <h3>No Preview Available</h3>
                <p>Click "Compile PDF" to generate your CV.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CVBuilder;
