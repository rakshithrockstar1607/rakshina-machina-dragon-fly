import React from 'react';
import { useDragonflyStore, dragonflyStore } from '../../store/useDragonflyStore';
import type { CameraPreset } from '../../types/dragonfly';
import { PlaneTakeoff, PlaneLanding, Minus, Plus, Compass } from 'lucide-react';

interface ControlDockProps {
  onTakeFlight: () => void;
  onLand: () => void;
  onSetPreset: (preset: CameraPreset) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export const ControlDock: React.FC<ControlDockProps> = ({
  onTakeFlight,
  onLand,
  onSetPreset,
  onZoomIn,
  onZoomOut
}) => {
  const flightState = useDragonflyStore((s) => s.flightState);
  const wingSpeed = useDragonflyStore((s) => s.wingSpeed);
  const explodeAmount = useDragonflyStore((s) => s.explodeAmount);
  const activePreset = useDragonflyStore((s) => s.cameraPreset);

  const isTransitioning = flightState === 'TAKING_OFF' || flightState === 'LANDING';
  const isAirborne = flightState === 'HOVERING' || flightState === 'TAKING_OFF';

  const handleFlightToggle = () => {
    if (isTransitioning) return;
    if (isAirborne) {
      onLand();
    } else {
      onTakeFlight();
    }
  };

  const handleWingSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    dragonflyStore.setWingSpeed(val);
  };

  const handleExplodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    dragonflyStore.setExplodeAmount(val);
  };

  const presets: { id: CameraPreset; label: string }[] = [
    { id: 'ISO', label: 'ISO' },
    { id: 'PLAN', label: 'PLAN' },
    { id: 'FRONT', label: 'FRONT' },
    { id: 'PROFILE', label: 'PROFILE' }
  ];

  return (
    <div className="control-dock-wrapper">
      <nav className="control-dock-container glass-panel" aria-label="Specimen Controls">
        {/* Row 1: Primary Controls */}
        <div className="control-dock-primary">
          {/* Wing Speed Slider */}
          <div className="slider-control-group">
            <div className="slider-label-row">
              <span className="slider-title">WING SPEED</span>
              <span className="slider-value font-mono">{Math.round(wingSpeed)}%</span>
            </div>
            <div className="slider-track-wrap">
              <input
                type="range"
                min="0"
                max="100"
                value={wingSpeed}
                onChange={handleWingSpeedChange}
                className="custom-range-slider"
                aria-label="Wing beat frequency percentage"
              />
            </div>
          </div>

          <div className="dock-separator" />

          {/* Primary Take Flight / Land Button */}
          <button
            type="button"
            onClick={handleFlightToggle}
            disabled={isTransitioning}
            className={`flight-action-btn ${isAirborne ? 'btn-airborne' : 'btn-grounded'} ${
              isTransitioning ? 'btn-transitioning' : ''
            }`}
            aria-label={isAirborne ? 'Land dragonfly on podium' : 'Engage takeoff and flight'}
          >
            {isTransitioning ? (
              <span className="flight-btn-content animate-pulse">
                <Compass size={14} className="animate-spin" />
                <span>{flightState === 'TAKING_OFF' ? 'ASCENDING...' : 'LANDING...'}</span>
              </span>
            ) : isAirborne ? (
              <span className="flight-btn-content">
                <PlaneLanding size={14} />
                <span>LAND SPECIMEN</span>
              </span>
            ) : (
              <span className="flight-btn-content">
                <PlaneTakeoff size={14} />
                <span>TAKE FLIGHT</span>
              </span>
            )}
          </button>

          <div className="dock-separator" />

          {/* Exploded View Slider */}
          <div className="slider-control-group">
            <div className="slider-label-row">
              <span className="slider-title">EXPLODED VIEW</span>
              <span className="slider-value font-mono">{Math.round(explodeAmount)}%</span>
            </div>
            <div className="slider-track-wrap">
              <input
                type="range"
                min="0"
                max="100"
                value={explodeAmount}
                onChange={handleExplodeChange}
                className="custom-range-slider"
                aria-label="Mechanical assembly exploded separation percentage"
              />
            </div>
          </div>

          <div className="dock-separator" />

          {/* Zoom In & Zoom Out Buttons */}
          <div className="zoom-btn-group">
            <button
              type="button"
              onClick={onZoomOut}
              className="dock-tool-btn"
              title="Zoom out"
              aria-label="Zoom out"
            >
              <Minus size={13} />
            </button>
            <button
              type="button"
              onClick={onZoomIn}
              className="dock-tool-btn"
              title="Zoom in"
              aria-label="Zoom in"
            >
              <Plus size={13} />
            </button>
          </div>
        </div>

        {/* Row 2: Camera Presets */}
        <div className="control-dock-secondary">
          <span className="presets-label">CAMERA ORIENTATION:</span>
          <div className="presets-pill-group">
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onSetPreset(p.id)}
                className={`preset-pill ${activePreset === p.id ? 'active' : ''}`}
                aria-label={`Switch camera to ${p.label} view`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};
