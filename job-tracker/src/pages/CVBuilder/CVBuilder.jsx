import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { useSelector, useDispatch } from 'react-redux';
import { DEFAULT_LATEX_TEMPLATE } from '../../utils/defaultCvTemplate';
import { DEFAULT_JSON_TEMPLATE } from '../../utils/defaultCvJson';
import CasualForm from './CasualForm';
import './CVBuilder.css';
// import an action if you want to update local auth state, but here the backend updates the DB and we just need the URL

const API_URL = import.meta.env.VITE_API_URL;

function CVBuilder() {
  const [editorMode, setEditorMode] = useState('casual'); // 'casual', 'json', 'latex'
  const [cvData, setCvData] = useState(JSON.parse(DEFAULT_JSON_TEMPLATE));
  const [jsonCode, setJsonCode] = useState(DEFAULT_JSON_TEMPLATE);
  const [latexCode, setLatexCode] = useState(DEFAULT_LATEX_TEMPLATE);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('Resume.pdf');
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  
  const token = useSelector((state) => state.auth.token);

  const handleCompile = async () => {
    setIsCompiling(true);
    setError(null);

    try {
      let payload;
      if (editorMode === 'casual') {
        payload = { mode: 'json', data: cvData, fileName };
      } else if (editorMode === 'json') {
        let parsedData;
        try {
          parsedData = JSON.parse(jsonCode);
        } catch (parseErr) {
          throw new Error('Invalid JSON format. Please fix any syntax errors before compiling.');
        }
        payload = { mode: 'json', data: parsedData, fileName };
      } else {
        payload = { mode: 'latex', data: latexCode, fileName };
      }

      const response = await fetch(`${API_URL}/auth/compile-cv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
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

  const handleRename = async () => {
    if (!fileName.trim()) {
      setIsRenameModalOpen(false);
      return;
    }
    
    // If there's no pdfUrl yet, they haven't compiled, so just save the state and close.
    if (!pdfUrl) {
      setIsRenameModalOpen(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/rename-cv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ fileName })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 && errorData.error === 'No generated CV exists to rename') {
          setIsRenameModalOpen(false);
          return;
        }
        throw new Error(errorData.error || 'Failed to rename file');
      }

      const data = await response.json();
      if (data.generatedCvUrl) {
        setPdfUrl(`http://localhost:5000${data.generatedCvUrl}`);
      }
      setIsRenameModalOpen(false);
    } catch (err) {
      setError(err.message);
      setIsRenameModalOpen(false);
    }
  };

  const switchMode = (newMode) => {
    if (newMode === editorMode) return;

    if (newMode === 'casual') {
      if (editorMode === 'json') {
        try {
          const parsed = JSON.parse(jsonCode);
          setCvData(parsed);
        } catch (err) {
          alert("Invalid JSON format. Please fix the syntax errors before switching to Casual Mode.");
          return;
        }
      }
    } else if (newMode === 'json') {
      if (editorMode === 'casual') {
        setJsonCode(JSON.stringify(cvData, null, 2));
      }
    } else if (newMode === 'latex') {
      const confirm = window.confirm("Warning: LaTeX mode is independent. Any manual changes made here will not sync back to Casual or JSON modes. Are you sure you want to proceed?");
      if (!confirm) return;
    }

    setEditorMode(newMode);
  };

  return (
    <div className="cv-builder-page">
      <div className="cv-builder-header">
        <h2 style={{ margin: 0 }}>CV Builder</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            className="rename-file-btn"
            onClick={() => setIsRenameModalOpen(true)}
          >
            Rename File
          </button>
          <button 
            className="submit-btn compile-btn"
            onClick={handleCompile}
            disabled={isCompiling}
          >
            {isCompiling ? 'Compiling...' : 'Compile PDF'}
          </button>
        </div>
      </div>
      
      {error && <div className="cv-error-message">{error}</div>}

      <div className="cv-builder-content">
        <div className="cv-editor-panel">
          <div className="editor-mode-toggle">
            <button 
              className={`mode-btn ${editorMode === 'casual' ? 'active' : ''}`}
              onClick={() => switchMode('casual')}
            >
              Casual Mode
            </button>
            <button 
              className={`mode-btn ${editorMode === 'json' ? 'active' : ''}`}
              onClick={() => switchMode('json')}
            >
              JSON Mode
            </button>
            <button 
              className={`mode-btn ${editorMode === 'latex' ? 'active' : ''}`}
              onClick={() => switchMode('latex')}
            >
              LaTeX Mode
            </button>
          </div>
          <div className="editor-container">
            {editorMode === 'casual' ? (
              <CasualForm data={cvData} onChange={setCvData} />
            ) : (
              <Editor
                height="100%"
                language={editorMode === 'json' ? 'json' : 'latex'}
                theme="vs-dark"
                value={editorMode === 'json' ? jsonCode : latexCode}
                onChange={(value) => {
                  if (editorMode === 'json') {
                    setJsonCode(value);
                  } else {
                    setLatexCode(value);
                  }
                }}
                options={{ 
                  minimap: { enabled: false }, 
                  wordWrap: 'on',
                  fontSize: 14,
                  padding: { top: 16 }
                }}
              />
            )}
          </div>
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

      {isRenameModalOpen && (
        <div className="rename-modal-overlay">
          <div className="rename-modal">
            <h3>Rename CV File</h3>
            <input 
              type="text" 
              value={fileName} 
              onChange={(e) => setFileName(e.target.value)} 
              placeholder="Filename (e.g. Resume.pdf)"
              style={{
                width: '100%',
                backgroundColor: '#1e1e1e',
                border: '1px solid #444',
                borderRadius: '4px',
                padding: '10px 12px',
                color: '#fff',
                fontFamily: 'inherit',
                fontSize: '0.95rem',
                boxSizing: 'border-box'
              }}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename();
                if (e.key === 'Escape') setIsRenameModalOpen(false);
              }}
            />
            <div className="rename-modal-actions">
              <button onClick={handleRename}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CVBuilder;
