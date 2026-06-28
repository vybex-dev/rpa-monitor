import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from '../styles/ContextMenu.module.css';

export function ContextMenu({ position, rowData, onClose }) {
  // Close on outside click or escape
  useEffect(() => {
    if (!position) return;

    function handleDocClick() {
      onClose();
    }
    
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }

    // Use a tiny timeout to avoid immediate close from the right-click event itself
    const timer = setTimeout(() => {
      document.addEventListener('click', handleDocClick);
      document.addEventListener('contextmenu', handleDocClick);
    }, 10);

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleDocClick);
      document.removeEventListener('contextmenu', handleDocClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [position, onClose]);

  if (!position || !rowData) return null;

  // Prevent menu from going off-screen
  const x = Math.min(position.x, window.innerWidth - 200);
  const y = Math.min(position.y, window.innerHeight - 150);

  const handleCopyId = () => {
    navigator.clipboard.writeText(rowData.project_id);
    onClose();
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(rowData, null, 2));
    onClose();
  };

  const handleLog = () => {
    console.log('[Context Menu] Row Data:', rowData);
    onClose();
  };

  return createPortal(
    <div 
      className={styles.menu} 
      style={{ top: y, left: x }}
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
    >
      <div className={styles.item} onClick={handleCopyId}>
        <span className={styles.icon}>📋</span> Copy Project ID
      </div>
      <div className={styles.item} onClick={handleCopyJson}>
        <span className={styles.icon}>{'{ }'}</span> Copy Row JSON
      </div>
      <div className={styles.divider} />
      <div className={styles.item} onClick={handleLog}>
        <span className={styles.icon}>🖥️</span> Log to Console
      </div>
    </div>,
    document.body
  );
}
