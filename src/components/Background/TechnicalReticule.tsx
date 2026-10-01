import React from 'react';
import { useDragonflyStore } from '../../store/useDragonflyStore';

export const TechnicalReticule: React.FC = () => {
  const theme = useDragonflyStore((s) => s.theme);
  const isDark = theme === 'obsidian';

  return (
    <div className="reticule-container pointer-events-none" aria-hidden="true">
      {/* Dynamic Concentric Calibration Circles SVG */}
      <svg
        className="reticule-svg"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="reticule-glow" cx="50%" cy="50%" r="50%">
            <stop
              offset="0%"
              stopColor={isDark ? '#10b981' : '#a69269'}
              stopOpacity={isDark ? '0.12' : '0.08'}
            />
            <stop
              offset="60%"
              stopColor={isDark ? '#059669' : '#8c764e'}
              stopOpacity={isDark ? '0.03' : '0.02'}
            />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Center Glow */}
        <circle cx="500" cy="500" r="420" fill="url(#reticule-glow)" />

        {/* Static Ambient Rings */}
        <circle
          cx="500"
          cy="500"
          r="440"
          className="reticule-ring ring-outer"
          strokeDasharray="4 8"
        />
        <circle
          cx="500"
          cy="500"
          r="360"
          className="reticule-ring ring-mid"
          strokeDasharray="1 5"
        />
        <circle
          cx="500"
          cy="500"
          r="280"
          className="reticule-ring ring-inner"
        />
        <circle
          cx="500"
          cy="500"
          r="200"
          className="reticule-ring ring-core"
          strokeDasharray="6 12"
        />
        <circle
          cx="500"
          cy="500"
          r="120"
          className="reticule-ring ring-center"
        />

        {/* Subtle Decorative Ambient Orbital Arcs */}
        <g className="reticule-orbit-slow">
          <path
            d="M 500,80 A 420,420 0 0,1 860,260"
            fill="none"
            className="reticule-arc"
          />
          <path
            d="M 500,920 A 420,420 0 0,1 140,740"
            fill="none"
            className="reticule-arc"
          />
        </g>

        <g className="reticule-orbit-counter">
          <path
            d="M 220,500 A 280,280 0 0,1 500,220"
            fill="none"
            className="reticule-arc arc-fine"
            strokeDasharray="3 6"
          />
          <path
            d="M 780,500 A 280,280 0 0,1 500,780"
            fill="none"
            className="reticule-arc arc-fine"
            strokeDasharray="3 6"
          />
        </g>

      </svg>
    </div>
  );
};
