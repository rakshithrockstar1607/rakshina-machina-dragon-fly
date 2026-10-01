import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SYSTEM_DETAILS } from '../../three/AnnotationPoints';
import { useDragonflyStore, dragonflyStore } from '../../store/useDragonflyStore';
import { AeshnaScene } from '../../three/AeshnaScene';
import { ChevronRight, ArrowUp } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface AnatomySectionProps {
  scene: AeshnaScene | null;
  onScrollToHero: () => void;
}

export const AnatomySection: React.FC<AnatomySectionProps> = ({ scene, onScrollToHero }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const selectedSystemId = useDragonflyStore((s) => s.selectedSystemId);
  const activeSystem =
    SYSTEM_DETAILS.find((s) => s.id === selectedSystemId) || SYSTEM_DETAILS[0];

  useEffect(() => {
    if (!scene || !triggerRef.current) return;

    // Camera stages definition
    const stages = [
      {
        // STAGE A: Whole specimen 3/4
        camPos: [0.20, 0.17, 0.23],
        camTarget: [0, 0, -0.05],
        explode: 0,
        systemId: 'thoracic-flight-core'
      },
      {
        // STAGE B: 25% exploded view
        camPos: [0.22, 0.16, 0.24],
        camTarget: [0, 0.005, -0.045],
        explode: 28,
        systemId: 'quad-wing-actuation'
      },
      {
        // STAGE C: Wing-root & Thorax mechanics
        camPos: [0.12, 0.11, -0.012],
        camTarget: [0.045, 0.015, -0.018],
        explode: 30,
        systemId: 'quad-wing-actuation'
      },
      {
        // STAGE D: Optical & Compound eye system
        camPos: [0.031, 0.033, 0.045],
        camTarget: [0.009, 0.002, 0.001],
        explode: 20,
        systemId: 'compound-optics'
      },
      {
        // STAGE E: Abdomen articulation & Landing
        camPos: [-0.09, 0.07, -0.15],
        camTarget: [0.0, 0.002, -0.075],
        explode: 15,
        systemId: 'articulated-abdomen'
      },
      {
        // STAGE F: Return toward complete specimen
        camPos: [0.20, 0.17, 0.23],
        camTarget: [0, 0, -0.05],
        explode: 0,
        systemId: 'six-point-landing'
      }
    ];

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: triggerRef.current,
        start: 'top top',
        end: '+=4000',
        pin: true,
        scrub: 1.2,
        onUpdate: (self) => {
          const progress = self.progress; // 0 to 1

          // Enter anatomy section
          if (progress > 0.02) {
            dragonflyStore.setActiveSection('anatomy');
          } else {
            dragonflyStore.setActiveSection('specimen');
          }

          // Determine current stage segment
          const numSegments = stages.length - 1;
          const segProgress = progress * numSegments;
          const index = Math.min(numSegments - 1, Math.floor(segProgress));
          const t = segProgress - index; // 0 to 1 between stages[index] and stages[index + 1]

          const sA = stages[index];
          const sB = stages[index + 1];

          // Interpolate camera
          const posX = THREE.MathUtils.lerp(sA.camPos[0], sB.camPos[0], t);
          const posY = THREE.MathUtils.lerp(sA.camPos[1], sB.camPos[1], t);
          const posZ = THREE.MathUtils.lerp(sA.camPos[2], sB.camPos[2], t);

          const targetX = THREE.MathUtils.lerp(sA.camTarget[0], sB.camTarget[0], t);
          const targetY = THREE.MathUtils.lerp(sA.camTarget[1], sB.camTarget[1], t);
          const targetZ = THREE.MathUtils.lerp(sA.camTarget[2], sB.camTarget[2], t);

          const explodeVal = THREE.MathUtils.lerp(sA.explode, sB.explode, t);

          scene.camera.position.set(posX, posY, posZ);
          scene.cameraRig.controls.target.set(targetX, targetY, targetZ);
          scene.cameraRig.controls.update();

          dragonflyStore.setExplodeAmount(Math.round(explodeVal));

          // Set active system based on progress segment
          const currentStageSys = t > 0.5 ? sB.systemId : sA.systemId;
          dragonflyStore.setSelectedSystemId(currentStageSys);
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, [scene]);

  const handleSystemClick = (sys: typeof SYSTEM_DETAILS[0]) => {
    if (!scene) return;
    dragonflyStore.setSelectedSystemId(sys.id);
    scene.cameraRig.tweenTo(sys.cameraPos, sys.cameraTarget, 1.2);
  };

  return (
    <div ref={containerRef} className="anatomy-section-wrapper">
      <div ref={triggerRef} className="anatomy-pinned-viewport">
        {/* Top Header */}
        <div className="anatomy-header pointer-events-auto">
          <div className="anatomy-badge">
            <span className="badge-dot pulse" />
            <span>SECTION 02 // TECHNICAL DISSECTION</span>
          </div>
          <h2 className="anatomy-title">ANATOMY / SYSTEMS</h2>
          <p className="anatomy-subtitle font-mono">
            ENGINEERED BIOLOGICAL LOGIC &bull; ARCHITECTURAL KINEMATICS
          </p>

          {/* System Chips Bar */}
          <div className="system-chips-nav">
            {SYSTEM_DETAILS.map((sys) => {
              const isSelected = activeSystem.id === sys.id;
              return (
                <button
                  key={sys.id}
                  type="button"
                  onClick={() => handleSystemClick(sys)}
                  className={`system-nav-chip ${isSelected ? 'active' : ''}`}
                  aria-label={`Inspect ${sys.title}`}
                >
                  <span className="chip-num font-mono">{sys.number}</span>
                  <span className="chip-name">{sys.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Floating Technical Detail Card */}
        <div className="anatomy-card-rail pointer-events-auto">
          <div className="anatomy-card glass-panel">
            <div className="card-top-meta">
              <span className="system-num-large font-mono">{activeSystem.number}</span>
              <div className="system-class-tag">
                <span className="tag-dot" />
                <span className="font-mono">{activeSystem.category}</span>
              </div>
            </div>

            <h3 className="system-name-heading">{activeSystem.title}</h3>
            <p className="system-tagline">{activeSystem.tagline}</p>
            <p className="system-description">{activeSystem.description}</p>

            <div className="system-specs-grid">
              {activeSystem.specs.map((spec, i) => (
                <div key={i} className="spec-metric-box">
                  <span className="spec-metric-label font-mono">{spec.label}</span>
                  <span className="spec-metric-val font-mono">{spec.value}</span>
                </div>
              ))}
            </div>

            <div className="card-action-row">
              <button
                type="button"
                onClick={() => handleSystemClick(activeSystem)}
                className="card-focus-btn"
              >
                <span>MACRO FOCUS SENSORS</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Return to Hero Button */}
        <div className="anatomy-footer-actions pointer-events-auto">
          <button
            type="button"
            onClick={onScrollToHero}
            className="return-hero-btn"
            aria-label="Return to Section 01 Specimen Hero"
          >
            <ArrowUp size={14} />
            <span>RETURN TO SPECIMEN HERO</span>
          </button>
        </div>
      </div>
    </div>
  );
};
