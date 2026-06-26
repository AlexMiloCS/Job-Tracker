import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import './DynamicInput.css';

function DynamicInput({ value, onChange, placeholder, className = '', style = {} }) {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);

  // useLayoutEffect ensures we measure and set height before the browser paints the expanded frame
  useLayoutEffect(() => {
    if (textareaRef.current) {
      if (isFocused) {
        // Reset height temporarily to get accurate scrollHeight for wrapped text
        textareaRef.current.style.height = '38px';
        const scrollHeight = textareaRef.current.scrollHeight;
        // Cap max height at 250px
        textareaRef.current.style.height = `${Math.min(250, Math.max(38, scrollHeight))}px`;
        
        if (scrollHeight > 250) {
          textareaRef.current.style.overflowY = 'auto';
        } else {
          textareaRef.current.style.overflowY = 'hidden';
        }
      } else {
        textareaRef.current.style.height = '38px';
        textareaRef.current.style.overflowY = 'hidden';
      }
    }
  }, [value, isFocused]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      placeholder={placeholder}
      className={`dynamic-input ${isFocused ? 'is-focused' : ''} ${className}`}
      style={style}
      rows={1}
    />
  );
}

export default DynamicInput;
