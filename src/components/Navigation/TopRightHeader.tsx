import React from 'react';
import { ThemeToggle } from '../Theme/ThemeToggle';
import { useDragonflyStore } from '../../store/useDragonflyStore';

export const TopRightHeader: React.FC = () => {
  const flightState = useDragonflyStore((s) => s.flightState);
  const wingSpeed = useDragonflyStore((s) => s.wingSpeed);
  const explodeAmount = useDragonflyStore((s) => s.explodeAmount);

  return (
    <div className="top-right-header-rail pointer-events-none">
      <div className="theme-toggle-wrapper pointer-events-auto">
        <ThemeToggle />
      </div>

      <div className="telemetry-rail pointer-events-auto">
        <div className="telemetry-row">
          <span className="telemetry-label">SPECIMEN ID</span>
          <span className="telemetry-value">RM-8842 // ODONATA</span>
        </div>
        <div className="telemetry-row">
          <span className="telemetry-label">FLIGHT STATUS</span>
          <span className={`telemetry-value ${flightState === 'HOVERING' ? 'status-active' : ''}`}>
            {flightState}
          </span>
        </div>
        <div className="telemetry-row">
          <span className="telemetry-label">ACTUATION FREQ</span>
          <span className="telemetry-value">
            {(wingSpeed * 0.48).toFixed(1)} HZ
          </span>
        </div>
        <div className="telemetry-row">
          <span className="telemetry-label">DISPERSAL SEPARATION</span>
          <span className="telemetry-value">{explodeAmount}%</span>
        </div>
      </div>
    </div>
  );
};
