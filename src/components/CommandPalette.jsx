import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from '../styles/CommandPalette.module.css';

export function CommandPalette({ isOpen, onClose, commands }) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);

  // Filter commands
  const filteredCommands = commands.filter(cmd => 
    cmd.name.toLowerCase().includes(query.toLowerCase())
  );

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      // Focus input
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        setActiveIndex(prev => (prev + 1) % filteredCommands.length);
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        setActiveIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        e.preventDefault();
      } else if (e.key === 'Enter') {
        if (filteredCommands[activeIndex]) {
          filteredCommands[activeIndex].action();
          onClose();
        }
        e.preventDefault();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, activeIndex, onClose]);

  // Handle clicking outside
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className={styles.overlay} onMouseDown={handleOverlayClick}>
      <div className={styles.palette}>
        <div className={styles.inputWrap}>
          <span className={styles.searchIcon}>⌕</span>
          <input
            ref={inputRef}
            className={styles.input}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
            placeholder="Type a command or search..."
            spellCheck={false}
          />
        </div>
        <div className={styles.results}>
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, idx) => (
              <div
                key={cmd.id}
                className={`${styles.resultItem} ${idx === activeIndex ? styles.active : ''}`}
                onClick={() => { cmd.action(); onClose(); }}
                onMouseEnter={() => setActiveIndex(idx)}
              >
                <span className={styles.icon}>{cmd.icon || '→'}</span>
                <span>{cmd.name}</span>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>No commands found.</div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
