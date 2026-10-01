import React from 'react';
import { useDragonflyStore } from '../../store/useDragonflyStore';

export const LoadingScreen: React.FC = () => {
  const isLoaded = useDragonflyStore((s) => s.isLoaded);
  const loadProgress = useDragonflyStore((s) => s.loadProgress);
  const loadStatusText = useDragonflyStore((s) => s.loadStatusText);
  const theme = useDragonflyStore((s) => s.theme);

  if (isLoaded) return null;

  const isDark = theme === 'obsidian';

  return (
    <div className={`loading-screen-root ${isDark ? 'theme-obsidian' : 'theme-ivory'}`}>
      <div className="loading-card">
        {/* Animated Circular Calibration Reticle */}
        <div className="loader-reticle-wrap">
          <svg className="loader-svg" viewBox="0 0 160 160">
            {/* Outer static dashed ring */}
            <circle
              cx="80"
              cy="80"
              r="72"
              fill="none"
              className="loader-ring-static"
              strokeDasharray="2 6"
            />
            {/* Spinning arc */}
            <circle
              cx="80"
              cy="80"
              r="64"
              fill="none"
              className="loader-ring-spin"
              strokeDasharray="80 320"
            />
            {/* Progress circle */}
            <circle
              cx="80"
              cy="80"
              r="54"
              fill="none"
              className="loader-ring-progress"
              strokeDasharray="339.29"
              strokeDashoffset={339.29 - (339.29 * loadProgress) / 100}
            />
            {/* Center Crosshair */}
            <line x1="72" y1="80" x2="88" y2="80" className="loader-cross" />
            <line x1="80" y1="72" x2="80" y2="88" className="loader-cross" />
          </svg>

          {/* Large Numerical Counter */}
          <div className="loader-percentage-num font-mono">
            {loadProgress}
            <span className="loader-percent-symbol">%</span>
          </div>
        </div>

        {/* Brand & Subtitle */}
        <div className="loader-brand-block">
          <h1 className="loader-title">RAKSHINA MACHINA</h1>
          <p className="loader-subtitle">ARTIFICIAL ODONATA SPECIMEN</p>
          <div className="loader-status-bar-wrap">
            <div
              className="loader-status-bar"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
          <p className="loader-status-text font-mono">{loadStatusText}</p>
        </div>
      </div>
    </div>
  );
};
