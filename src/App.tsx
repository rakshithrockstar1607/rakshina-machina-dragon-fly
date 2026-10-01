import React, { useState, useRef } from 'react';
import { PersistentCanvas } from './components/Canvas/PersistentCanvas';
import { TechnicalReticule } from './components/Background/TechnicalReticule';
import { TopRightHeader } from './components/Navigation/TopRightHeader';
import { HeroOverlay } from './components/Hero/HeroOverlay';
import { ControlDock } from './components/Controls/ControlDock';
import { AnatomySection } from './components/Anatomy/AnatomySection';
import { AnatomyLabels } from './components/Anatomy/AnatomyLabels';
import { LoadingScreen } from './components/Loader/LoadingScreen';
import { CustomCursor } from './components/Cursor/CustomCursor';
import { AeshnaScene } from './three/AeshnaScene';
import { useDragonflyStore, dragonflyStore } from './store/useDragonflyStore';
import type { CameraPreset } from './types/dragonfly';
import { SYSTEM_DETAILS } from './three/AnnotationPoints';

export const App: React.FC = () => {
  const [scene, setScene] = useState<AeshnaScene | null>(null);
  const theme = useDragonflyStore((s) => s.theme);
  const isLoaded = useDragonflyStore((s) => s.isLoaded);

  const anatomyRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const handleSceneReady = (readyScene: AeshnaScene) => {
    setScene(readyScene);
  };

  const handleTakeFlight = () => {
    if (scene) scene.takeFlight();
  };

  const handleLand = () => {
    if (scene) scene.land();
  };

  const handleSetPreset = (preset: CameraPreset) => {
    if (scene) scene.setPreset(preset);
  };

  const handleZoomIn = () => {
    if (scene) scene.zoomIn();
  };

  const handleZoomOut = () => {
    if (scene) scene.zoomOut();
  };

  const handleSelectSystem = (id: string) => {
    dragonflyStore.setSelectedSystemId(id);
    const detail = SYSTEM_DETAILS.find((s) => s.id === id);
    if (detail && scene) {
      scene.cameraRig.tweenTo(detail.cameraPos, detail.cameraTarget, 1.2);
    }
  };

  const scrollToAnatomy = () => {
    if (anatomyRef.current) {
      anatomyRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToHero = () => {
    if (heroRef.current) {
      heroRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`app-root ${theme === 'obsidian' ? 'theme-obsidian' : 'theme-ivory'}`}>
      {/* Loading Experience */}
      <LoadingScreen />

      {/* Custom Precision Cursor */}
      <CustomCursor />

      {/* Persistent Single WebGL Canvas */}
      <PersistentCanvas onSceneReady={handleSceneReady} />

      {/* Precision Calibration Reticule Graphic */}
      <TechnicalReticule />

      {/* Top Right Theme Toggle & Telemetry */}
      <header className="app-top-nav pointer-events-none">
        <TopRightHeader />
      </header>

      {/* SECTION 01: Specimen Hero */}
      <section ref={heroRef} className="hero-section-wrapper">
        <HeroOverlay onScrollToAnatomy={scrollToAnatomy} />
      </section>

      {/* SECTION 02: Technical Anatomy & Systems */}
      <section ref={anatomyRef} className="anatomy-section-container">
        <AnatomySection scene={scene} onScrollToHero={scrollToHero} />
        <AnatomyLabels scene={scene} onSelectSystem={handleSelectSystem} />
      </section>

      {/* Floating Bottom Control Dock */}
      {isLoaded && (
        <ControlDock
          onTakeFlight={handleTakeFlight}
          onLand={handleLand}
          onSetPreset={handleSetPreset}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
        />
      )}
    </div>
  );
};

export default App;
