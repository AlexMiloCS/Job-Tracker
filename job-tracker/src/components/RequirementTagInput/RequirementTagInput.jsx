import { useState } from 'react';
import './RequirementTagInput.css';

function RequirementTagInput({ tags, onChange }) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    // Prevent default on Enter or Comma
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && inputValue === '') {
      // Remove last tag if input is empty
      removeTag(tags.length - 1);
    }
  };

  const addTag = () => {
    const trimmed = inputValue.trim().toUpperCase();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInputValue('');
  };

  const removeTag = (indexToRemove) => {
    if (indexToRemove < 0) return;
    onChange(tags.filter((_, index) => index !== indexToRemove));
  };

  // Ensure clicking anywhere in the container focuses the input
  const handleContainerClick = () => {
    document.getElementById('tag-input')?.focus();
  };

  return (
    <div className="tag-input-container" onClick={handleContainerClick}>
      <ul className="tags-list">
        {tags.map((tag, index) => (
          <li key={index} className="tag-chip">
            <span className="tag-text">{tag}</span>
            <button 
              type="button" 
              className="tag-remove-btn" 
              onClick={() => removeTag(index)}
              aria-label={`Remove ${tag}`}
            >
              &times;
            </button>
          </li>
        ))}
      </ul>
      <input
        id="tag-input"
        type="text"
        className="tag-text-input"
        placeholder={tags.length === 0 ? "Add requirements (e.g. PYTHON, RAG) and press Enter" : ""}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
      />
    </div>
  );
}

export default RequirementTagInput;
