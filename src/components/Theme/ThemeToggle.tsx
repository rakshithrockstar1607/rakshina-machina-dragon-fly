import React from 'react';
import { useDragonflyStore, dragonflyStore } from '../../store/useDragonflyStore';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const theme = useDragonflyStore((s) => s.theme);

  return (
    <div className="theme-toggle-dock">
      <button
        type="button"
        onClick={() => dragonflyStore.setTheme('ivory')}
        className={`theme-btn ${theme === 'ivory' ? 'active' : ''}`}
        aria-label="Switch to Ivory Theme"
      >
        <Sun size={13} className="theme-icon" />
        <span>IVORY</span>
      </button>

      <div className="theme-divider" />

      <button
        type="button"
        onClick={() => dragonflyStore.setTheme('obsidian')}
        className={`theme-btn ${theme === 'obsidian' ? 'active' : ''}`}
        aria-label="Switch to Obsidian Theme"
      >
        <Moon size={13} className="theme-icon" />
        <span>OBSIDIAN</span>
      </button>
    </div>
  );
};
