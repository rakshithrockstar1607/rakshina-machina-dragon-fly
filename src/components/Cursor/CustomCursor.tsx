import React, { useEffect, useState } from 'react';
import { useDragonflyStore } from '../../store/useDragonflyStore';

export const CustomCursor: React.FC = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isOverCanvas, setIsOverCanvas] = useState(false);
  const isDragging = useDragonflyStore((s) => s.isDragging);
  const theme = useDragonflyStore((s) => s.theme);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });

      // Check if target is inside interactive UI controls
      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractiveControl =
          target.closest('button') ||
          target.closest('input') ||
          target.closest('a') ||
          target.closest('.system-marker-badge') ||
          target.closest('.system-nav-chip') ||
          target.closest('.glass-panel');

        setIsOverCanvas(!isInteractiveControl);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  return (
    <div
      className={`custom-cursor-root pointer-events-none ${
        theme === 'obsidian' ? 'cursor-obsidian' : 'cursor-ivory'
      }`}
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`
      }}
      aria-hidden="true"
    >
      <div className={`cursor-dot ${isDragging ? 'dragging' : ''}`} />
      <div
        className={`cursor-ring ${isOverCanvas ? 'expanded' : ''} ${
          isDragging ? 'active-drag' : ''
        }`}
      />
      {isOverCanvas && !isDragging && (
        <span className="cursor-label font-mono">DRAG</span>
      )}
    </div>
  );
};
