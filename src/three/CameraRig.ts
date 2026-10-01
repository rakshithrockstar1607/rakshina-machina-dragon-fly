import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';
import type { CameraPreset } from '../types/dragonfly';
import { dragonflyStore } from '../store/useDragonflyStore';

export interface CameraPose {
  position: [number, number, number];
  target: [number, number, number];
}

// Visual center of specimen thorax & longitudinal symmetry axis
export const SPECIMEN_THORAX_CENTER: [number, number, number] = [0, 0.005, -0.065];

export const PRESET_POSES: Record<CameraPreset, CameraPose> = {
  ISO: {
    position: [0.20, 0.17, 0.21],
    target: SPECIMEN_THORAX_CENTER
  },
  PLAN: {
    position: [0, 0.35, -0.065],
    target: SPECIMEN_THORAX_CENTER
  },
  FRONT: {
    position: [0, 0.07, 0.25],
    target: SPECIMEN_THORAX_CENTER
  },
  PROFILE: {
    position: [-0.29, 0.075, -0.065],
    target: SPECIMEN_THORAX_CENTER
  }
};

export class CameraRig {
  public camera: THREE.PerspectiveCamera;
  public controls: OrbitControls;
  public isTweening: boolean = false;
  private currentTween: gsap.core.Tween | null = null;

  // Strict physical distance limits
  public readonly minDistance = 0.12; // Prevents zooming through model
  public readonly maxDistance = 0.38; // Prevents specimen from becoming tiny

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    this.camera = camera;
    this.controls = new OrbitControls(camera, domElement);

    // Premium damped motion
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.055;

    // Speeds tuned for heavy, precise, tactile feel
    this.controls.rotateSpeed = 0.75;
    this.controls.zoomSpeed = 0.95;

    // Strict zoom bounds
    this.controls.minDistance = this.minDistance;
    this.controls.maxDistance = this.maxDistance;

    // Polar bounds to prevent camera roll and underneath-podium penetration
    this.controls.minPolarAngle = 0.08;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.04;

    // Disable panning: Camera must ALWAYS orbit around specimen visual center / thorax
    this.controls.enablePan = false;
    this.controls.screenSpacePanning = false;

    // Mouse buttons: Left = Rotate, Middle = Zoom/Dolly, Right = None (no pan)
    this.controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.DOLLY
    };

    // Touch inputs: 1 finger = Rotate, 2 fingers = Pinch zoom
    this.controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN
    };

    // Initial pose
    const initial = PRESET_POSES.ISO;
    this.camera.position.set(...initial.position);
    this.controls.target.set(...initial.target);
    this.controls.update();

    // Track user drag state
    this.controls.addEventListener('start', () => {
      dragonflyStore.setIsDragging(true);
      if (this.currentTween) {
        this.currentTween.kill();
        this.currentTween = null;
        this.isTweening = false;
      }
    });

    this.controls.addEventListener('end', () => {
      dragonflyStore.setIsDragging(false);
    });
  }

  public setPreset(preset: CameraPreset, duration: number = 1.1) {
    const pose = PRESET_POSES[preset];
    if (!pose) return;
    dragonflyStore.setCameraPreset(preset);
    this.tweenTo(pose.position, pose.target, duration);
  }

  public tweenTo(
    targetPos: [number, number, number],
    targetLookAt: [number, number, number],
    duration: number = 1.0,
    onComplete?: () => void
  ) {
    if (this.currentTween) {
      this.currentTween.kill();
    }

    this.isTweening = true;
    const startPos = {
      x: this.camera.position.x,
      y: this.camera.position.y,
      z: this.camera.position.z
    };
    const startTarget = {
      x: this.controls.target.x,
      y: this.controls.target.y,
      z: this.controls.target.z
    };

    const obj = { progress: 0 };
    this.currentTween = gsap.to(obj, {
      progress: 1,
      duration,
      ease: 'power3.inOut',
      onUpdate: () => {
        const p = obj.progress;
        this.camera.position.x = THREE.MathUtils.lerp(startPos.x, targetPos[0], p);
        this.camera.position.y = THREE.MathUtils.lerp(startPos.y, targetPos[1], p);
        this.camera.position.z = THREE.MathUtils.lerp(startPos.z, targetPos[2], p);

        this.controls.target.x = THREE.MathUtils.lerp(startTarget.x, targetLookAt[0], p);
        this.controls.target.y = THREE.MathUtils.lerp(startTarget.y, targetLookAt[1], p);
        this.controls.target.z = THREE.MathUtils.lerp(startTarget.z, targetLookAt[2], p);

        this.controls.update();
      },
      onComplete: () => {
        this.isTweening = false;
        this.currentTween = null;
        if (onComplete) onComplete();
      }
    });
  }

  public zoomIn(factor: number = 0.22) {
    const dir = new THREE.Vector3().subVectors(this.controls.target, this.camera.position);
    const dist = dir.length();
    const newDist = Math.max(this.minDistance, dist * (1 - factor));
    dir.normalize().multiplyScalar(dist - newDist);

    const newPos = this.camera.position.clone().add(dir);
    this.tweenTo(
      [newPos.x, newPos.y, newPos.z],
      [this.controls.target.x, this.controls.target.y, this.controls.target.z],
      0.4
    );
  }

  public zoomOut(factor: number = 0.22) {
    const dir = new THREE.Vector3().subVectors(this.camera.position, this.controls.target);
    const dist = dir.length();
    const newDist = Math.min(this.maxDistance, dist * (1 + factor));
    dir.normalize().multiplyScalar(newDist - dist);

    const newPos = this.camera.position.clone().add(dir);
    this.tweenTo(
      [newPos.x, newPos.y, newPos.z],
      [this.controls.target.x, this.controls.target.y, this.controls.target.z],
      0.4
    );
  }

  public update() {
    if (!this.isTweening) {
      // In specimen hero section, lock the target strictly to visual center
      if (dragonflyStore.getState().activeSection === 'specimen') {
        this.controls.target.set(...SPECIMEN_THORAX_CENTER);
      }
      this.controls.update();
    }
  }

  public dispose() {
    if (this.currentTween) this.currentTween.kill();
    this.controls.dispose();
  }
}
