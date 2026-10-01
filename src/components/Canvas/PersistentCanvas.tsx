import React, { useEffect, useRef } from 'react';
import { AeshnaScene } from '../../three/AeshnaScene';

interface PersistentCanvasProps {
  onSceneReady: (scene: AeshnaScene) => void;
}

export const PersistentCanvas: React.FC<PersistentCanvasProps> = ({ onSceneReady }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<AeshnaScene | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new AeshnaScene(containerRef.current);
    sceneRef.current = scene;
    (window as any).__aeshnaScene = scene;
    onSceneReady(scene);

    const onPointerMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      scene.updatePointer(x, y);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="webgl-canvas-container" />;
};
