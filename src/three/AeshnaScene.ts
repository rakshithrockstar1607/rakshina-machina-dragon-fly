import * as THREE from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import gsap from 'gsap';
import { CameraRig, SPECIMEN_THORAX_CENTER } from './CameraRig';
import { loadDragonfly, type LoadedDragonfly } from './DragonflyLoader';
import { MotionController } from './MotionController';
import { IdleBehavior } from './IdleBehavior';
import { ExplodedView } from './ExplodedView';
import { HeadTracker } from './HeadTracker';
import { FlightFollower } from './FlightFollower';
import { BasePlateCompass } from './BasePlateCompass';
import type { ThemeMode, CameraPreset } from '../types/dragonfly';
import { dragonflyStore } from '../store/useDragonflyStore';
import { SYSTEM_DETAILS } from './AnnotationPoints';

export class AeshnaScene {
  private container: HTMLElement;
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public cameraRig: CameraRig;

  // Environment & Lights
  private pmremGenerator: THREE.PMREMGenerator;
  private envTexture: THREE.Texture | null = null;
  private keyLight: THREE.DirectionalLight;
  private fillLight: THREE.DirectionalLight;
  private rimLight: THREE.DirectionalLight;
  private ground: THREE.Mesh;
  private groundMaterial: THREE.MeshStandardMaterial;
  private groundAlphaTexture: THREE.CanvasTexture | null = null;
  private basePlateCompass: BasePlateCompass | null = null;
  private tempAnchorVec: THREE.Vector3 = new THREE.Vector3();

  // Model & Controllers
  private dragonfly: LoadedDragonfly | null = null;
  private motionController: MotionController | null = null;
  private idleBehavior: IdleBehavior | null = null;
  private explodedView: ExplodedView | null = null;
  private headTracker: HeadTracker | null = null;
  private flightFollower: FlightFollower | null = null;

  // Runtime loop
  private isRunning: boolean = false;
  private lastTime: number = 0;
  private animFrameId: number = 0;

  // Store subscription
  private unsubscribeStore: () => void;
  private currentTheme: ThemeMode = 'ivory';

  // Projected 2D anchors for Anatomy section
  private screenAnchors: Map<string, { x: number; y: number; visible: boolean }> = new Map();

  constructor(container: HTMLElement) {
    this.container = container;

    // High performance renderer with capped pixel ratio & transparent canvas
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      stencil: false,
      alpha: true
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.toneMapping = THREE.AgXToneMapping;
    this.renderer.toneMappingExposure = 0.875;

    // Optimized shadow map: 1024x1024 gives crisp contact shadows without 2048x2048 fill-rate drag
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    container.appendChild(this.renderer.domElement);

    // Prevent accidental page scroll when zooming over the 3D specimen in Section 01
    this.renderer.domElement.addEventListener('wheel', (e: WheelEvent) => {
      if (dragonflyStore.getState().activeSection === 'specimen') {
        e.preventDefault();
      }
    }, { passive: false });

    // Scene (transparent to allow background reticule to sit strictly behind specimen)
    this.scene = new THREE.Scene();
    this.scene.background = null;

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      34,
      container.clientWidth / container.clientHeight,
      0.005,
      10
    );
    this.cameraRig = new CameraRig(this.camera, this.renderer.domElement);

    // PMREM
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.pmremGenerator.compileEquirectangularShader();

    // Lights
    this.keyLight = new THREE.DirectionalLight(0xffefdc, 2.5);
    this.keyLight.position.set(0.12, 0.25, 0.18);
    this.keyLight.target.position.set(...SPECIMEN_THORAX_CENTER);
    this.scene.add(this.keyLight.target);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.set(1024, 1024);
    Object.assign(this.keyLight.shadow.camera, {
      left: -0.14,
      right: 0.14,
      top: 0.14,
      bottom: -0.14,
      near: 0.02,
      far: 0.7
    });
    this.keyLight.shadow.bias = -0.00015;
    this.keyLight.shadow.normalBias = 0.0002;
    this.keyLight.shadow.radius = 2.5;
    this.scene.add(this.keyLight);

    this.fillLight = new THREE.DirectionalLight(0xcbe4ef, 0.7);
    this.fillLight.position.set(-2, 1, -1);
    this.scene.add(this.fillLight);

    this.rimLight = new THREE.DirectionalLight(0xffe5c6, 1.3);
    this.rimLight.position.set(0, 1, -3);
    this.scene.add(this.rimLight);

    // Soft radial ground receiver: gentle cosine falloff completely eliminates hard horizon edges
    this.groundAlphaTexture = this.createRadialAlphaMap();
    this.groundMaterial = new THREE.MeshStandardMaterial({
      color: 0xd5cec1,
      roughness: 0.88,
      metalness: 0.05,
      transparent: true,
      alphaMap: this.groundAlphaTexture,
      depthWrite: false
    });
    this.ground = new THREE.Mesh(
      new THREE.CircleGeometry(1.4, 64),
      this.groundMaterial
    );
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.position.set(0, -0.0298, -0.058);
    this.ground.receiveShadow = true;
    this.ground.matrixAutoUpdate = false;
    this.ground.updateMatrix();
    this.scene.add(this.ground);

    // Flat 3D technical azimuth compass around the base plate
    this.basePlateCompass = new BasePlateCompass(this.currentTheme === 'obsidian');
    this.scene.add(this.basePlateCompass.mesh);

    // Resize listener
    window.addEventListener('resize', this.onResize);

    // Subscribe to store
    this.unsubscribeStore = dragonflyStore.subscribe(this.onStoreUpdate);

    // Start loading assets
    this.init();
  }

  private async init() {
    try {
      dragonflyStore.setLoadingProgress(15, 'SYNCHRONIZING OPTICAL ENVIRONMENT...');

      // Base URL from Vite configuration for GitHub Pages compatibility
      const baseUrl = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;

      // Load studio EXR environment
      const exrLoader = new EXRLoader();
      const exrData = await exrLoader.loadAsync(`${baseUrl}environments/studio.exr`);
      this.envTexture = this.pmremGenerator.fromEquirectangular(exrData).texture;
      this.scene.environment = this.envTexture;
      this.scene.environmentIntensity = 0.7;
      exrData.dispose();

      dragonflyStore.setLoadingProgress(45, 'DECODING SPECIMEN CARAPACE...');

      // Load GLB
      this.dragonfly = await loadDragonfly(`${baseUrl}models/AESHNA_MACHINA_WEB_HQ.glb`, (p) => {
        const mapped = Math.round(45 + p * 0.5);
        dragonflyStore.setLoadingProgress(mapped, `VERIFYING KINEMATICS (${p}%)...`);
      });

      this.scene.add(this.dragonfly.scene);

      // Initialize Controllers
      this.idleBehavior = new IdleBehavior(this.dragonfly.mixer, this.dragonfly.animations);
      this.motionController = new MotionController(
        this.dragonfly.mixer,
        this.dragonfly.animations,
        this.idleBehavior
      );
      this.explodedView = new ExplodedView(this.dragonfly.scene);
      this.headTracker = new HeadTracker(
        this.dragonfly.headYawNode,
        this.dragonfly.headPitchNode
      );
      this.flightFollower = new FlightFollower(
        this.dragonfly.flyGroup,
        this.dragonfly.tailNode,
        this.camera,
        new THREE.Vector3(...SPECIMEN_THORAX_CENTER)
      );

      dragonflyStore.setLoadingProgress(100, 'CALIBRATION COMPLETE.');
      setTimeout(() => {
        dragonflyStore.setIsLoaded(true);
      }, 400);

      // Start render loop
      this.start();
    } catch (err) {
      console.error('Failed to initialize AeshnaScene:', err);
      dragonflyStore.setLoadingProgress(100, 'LOAD ERROR - CHECK CONSOLE');
    }
  }

  private onStoreUpdate = () => {
    const s = dragonflyStore.getState();

    // Theme changes
    if (s.theme !== this.currentTheme) {
      this.applyTheme(s.theme);
    }

    // Wing speed changes from UI
    if (this.motionController) {
      this.motionController.setWingSpeed(s.wingSpeed);
    }

    // Exploded view slider changes
    if (this.explodedView) {
      this.explodedView.setExplodeAmount(s.explodeAmount);
    }
  };

  public applyTheme(theme: ThemeMode, duration: number = 0.8) {
    this.currentTheme = theme;
    const isDark = theme === 'obsidian';

    const targetEnvInt = isDark ? 0.45 : 0.70;
    const targetKeyInt = isDark ? 1.4 : 2.5;
    const targetRimInt = isDark ? 2.4 : 1.3;
    const targetFillInt = isDark ? 0.35 : 0.70;

    // Update flat 3D base plate compass theme
    this.basePlateCompass?.setTheme(isDark);

    // Keep ground receiver active in both themes to catch soft contact shadows with zero geometric edge
    this.ground.visible = true;
    this.groundMaterial.color.set(isDark ? '#060a09' : '#d5cec1');

    gsap.to(this.scene, {
      environmentIntensity: targetEnvInt,
      duration,
      ease: 'power2.inOut'
    });

    gsap.to(this.keyLight, {
      intensity: targetKeyInt,
      duration,
      ease: 'power2.inOut'
    });

    gsap.to(this.rimLight, {
      intensity: targetRimInt,
      duration,
      ease: 'power2.inOut'
    });

    gsap.to(this.fillLight, {
      intensity: targetFillInt,
      duration,
      ease: 'power2.inOut'
    });

    // Selective Glow in Dark Mode
    if (this.dragonfly) {
      const glowTeal = new THREE.Color('#10b981');
      const zeroColor = new THREE.Color(0x000000);

      this.dragonfly.glowMaterials.forEach((mat) => {
        const isEye = mat.name.includes('Eye');
        const isOptic = mat.name.includes('Optical');
        const isEmission = mat.name.includes('Emission') || mat.name.includes('Photonic');

        if (isDark) {
          mat.emissive = isEmission || isOptic ? glowTeal : isEye ? new THREE.Color('#059669') : glowTeal;
          gsap.to(mat, {
            emissiveIntensity: isEmission ? 1.4 : 0.85,
            duration,
            ease: 'power2.inOut'
          });
        } else {
          gsap.to(mat, {
            emissiveIntensity: 0.0,
            duration,
            ease: 'power2.inOut',
            onComplete: () => {
              if (mat.name !== 'MAT_EmissionTeal') {
                mat.emissive = zeroColor;
              }
            }
          });
        }
      });
    }
  }

  public takeFlight() {
    if (this.motionController) {
      this.motionController.takeoff();
    }
  }

  public land() {
    if (this.motionController) {
      this.motionController.land();
    }
  }

  public setPreset(preset: CameraPreset) {
    this.cameraRig.setPreset(preset);
  }

  public zoomIn() {
    this.cameraRig.zoomIn();
  }

  public zoomOut() {
    this.cameraRig.zoomOut();
  }

  public updatePointer(normalizedX: number, normalizedY: number) {
    if (this.headTracker) {
      this.headTracker.updatePointer(normalizedX, normalizedY);
    }
    if (this.flightFollower) {
      this.flightFollower.setPointer(normalizedX, normalizedY);
    }
  }

  public getScreenAnchors(): Map<string, { x: number; y: number; visible: boolean }> {
    return this.screenAnchors;
  }

  private updateScreenAnchors() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    SYSTEM_DETAILS.forEach((item) => {
      this.tempAnchorVec.set(...item.anchor);
      this.tempAnchorVec.project(this.camera);

      // Check if in front of camera
      const isVisible = this.tempAnchorVec.z < 1.0;
      const x = (this.tempAnchorVec.x * 0.5 + 0.5) * width;
      const y = (-(this.tempAnchorVec.y * 0.5) + 0.5) * height;

      this.screenAnchors.set(item.id, { x, y, visible: isVisible });
    });
  }

  private createRadialAlphaMap(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    const cx = 256;
    const cy = 256;
    const rOuter = 256;

    // Soft radial falloff:
    // r=0 to r=60px (r=0.23 normalized): 100% opaque (under podium where contact shadows fall)
    // r=60px to r=256px: gentle cosine S-curve down to 0.0 (completely transparent at perimeter)
    const imgData = ctx.createImageData(512, 512);
    const data = imgData.data;

    for (let y = 0; y < 512; y++) {
      for (let x = 0; x < 512; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const normDist = dist / rOuter;

        let alpha = 0;
        if (normDist <= 0.23) {
          alpha = 1.0;
        } else if (normDist < 1.0) {
          const t = (normDist - 0.23) / (1.0 - 0.23);
          alpha = 0.5 * (1 + Math.cos(Math.PI * t));
        }

        const idx = (y * 512 + x) * 4;
        const val = Math.round(alpha * 255);
        data[idx] = val;     // R
        data[idx + 1] = val; // G
        data[idx + 2] = val; // B
        data[idx + 3] = val; // A
      }
    }

    ctx.putImageData(imgData, 0, 0);

    const tex = new THREE.CanvasTexture(canvas);
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  public stop() {
    this.isRunning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
  }

  private loop = (time: number) => {
    if (!this.isRunning) return;

    const dt = Math.min(0.1, (time - this.lastTime) / 1000);
    this.lastTime = time;

    // Update animations
    if (this.dragonfly) {
      this.dragonfly.mixer.update(dt);
    }
    if (this.motionController) {
      this.motionController.update(dt);
    }
    if (this.idleBehavior) {
      this.idleBehavior.update(dt);
    }
    if (this.explodedView) {
      this.explodedView.update(dt);
    }
    if (this.headTracker) {
      this.headTracker.update(dt);
    }
    if (this.flightFollower) {
      const isHovering = this.motionController?.getState() === 'HOVERING';
      this.flightFollower.update(dt, isHovering);
    }

    // Update camera controls
    this.cameraRig.update();

    // Project 3D labels ONLY when in Anatomy section
    if (dragonflyStore.getState().activeSection === 'anatomy') {
      this.updateScreenAnchors();
    }

    // Render
    this.renderer.render(this.scene, this.camera);

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  private onResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public dispose() {
    this.stop();
    window.removeEventListener('resize', this.onResize);
    this.unsubscribeStore();
    this.cameraRig.dispose();
    this.pmremGenerator.dispose();
    this.basePlateCompass?.dispose();
    this.groundMaterial?.dispose();
    this.groundAlphaTexture?.dispose();
    if (this.envTexture) this.envTexture.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
