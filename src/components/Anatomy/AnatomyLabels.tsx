import React, { useEffect, useRef } from 'react';
import { SYSTEM_DETAILS } from '../../three/AnnotationPoints';
import { useDragonflyStore } from '../../store/useDragonflyStore';
import { AeshnaScene } from '../../three/AeshnaScene';

interface AnatomyLabelsProps {
  scene: AeshnaScene | null;
  onSelectSystem: (id: string) => void;
}

export const AnatomyLabels: React.FC<AnatomyLabelsProps> = ({ scene, onSelectSystem }) => {
  const activeSection = useDragonflyStore((s) => s.activeSection);
  const selectedSystemId = useDragonflyStore((s) => s.selectedSystemId);

  const dotsRef = useRef<Map<string, SVGCircleElement>>(new Map());
  const linesRef = useRef<Map<string, SVGPolylineElement>>(new Map());
  const badgesRef = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (!scene) return;
    let animId: number;

    const updateAnchors = () => {
      if (activeSection === 'anatomy') {
        const anchors = scene.getScreenAnchors();
        const halfWidth = window.innerWidth / 2;

        SYSTEM_DETAILS.forEach((sys) => {
          const pt = anchors.get(sys.id);
          const dot = dotsRef.current.get(sys.id);
          const line = linesRef.current.get(sys.id);
          const badge = badgesRef.current.get(sys.id);

          if (!pt || !pt.visible) {
            if (dot) dot.style.opacity = '0';
            if (line) line.style.opacity = '0';
            if (badge) badge.style.opacity = '0';
            return;
          }

          const isRightSide = pt.x > halfWidth;
          const badgeX = isRightSide ? pt.x + 42 : pt.x - 170;
          const badgeY = pt.y - 45;
          const lineEndX = isRightSide ? pt.x + 40 : pt.x - 40;
          const lineEndY = pt.y - 30;

          if (dot) {
            dot.style.opacity = '1';
            dot.setAttribute('cx', pt.x.toFixed(1));
            dot.setAttribute('cy', pt.y.toFixed(1));
          }
          if (line) {
            line.style.opacity = '1';
            line.setAttribute(
              'points',
              `${pt.x.toFixed(1)},${pt.y.toFixed(1)} ${lineEndX.toFixed(1)},${lineEndY.toFixed(1)}`
            );
          }
          if (badge) {
            badge.style.opacity = '1';
            badge.style.transform = `translate3d(${badgeX.toFixed(1)}px, ${badgeY.toFixed(1)}px, 0)`;
          }
        });
      }
      animId = requestAnimationFrame(updateAnchors);
    };

    animId = requestAnimationFrame(updateAnchors);
    return () => cancelAnimationFrame(animId);
  }, [scene, activeSection]);

  if (activeSection !== 'anatomy') return null;

  return (
    <div className="anatomy-labels-overlay pointer-events-none" aria-hidden="true">
      {/* SVG Leader Lines */}
      <svg className="leader-lines-svg" width="100%" height="100%">
        {SYSTEM_DETAILS.map((sys) => {
          const isSelected = selectedSystemId === sys.id;
          return (
            <g key={sys.id} className={`leader-line-group ${isSelected ? 'selected' : ''}`}>
              <circle
                ref={(el) => {
                  if (el) dotsRef.current.set(sys.id, el);
                  else dotsRef.current.delete(sys.id);
                }}
                cx="0"
                cy="0"
                r="3"
                className="anchor-dot"
                style={{ opacity: 0 }}
              />
              <polyline
                ref={(el) => {
                  if (el) linesRef.current.set(sys.id, el);
                  else linesRef.current.delete(sys.id);
                }}
                points="0,0 0,0"
                className="leader-line"
                style={{ opacity: 0 }}
              />
            </g>
          );
        })}
      </svg>

      {/* HTML Interactive Badges */}
      {SYSTEM_DETAILS.map((sys) => {
        const isSelected = selectedSystemId === sys.id;
        return (
          <div
            key={sys.id}
            ref={(el) => {
              if (el) badgesRef.current.set(sys.id, el);
              else badgesRef.current.delete(sys.id);
            }}
            className={`system-marker-badge pointer-events-auto ${isSelected ? 'active' : ''}`}
            onClick={() => onSelectSystem(sys.id)}
            style={{ opacity: 0 }}
          >
            <span className="marker-number font-mono">{sys.number}</span>
            <div className="marker-info">
              <span className="marker-title">{sys.title}</span>
              <span className="marker-category font-mono">{sys.category}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
