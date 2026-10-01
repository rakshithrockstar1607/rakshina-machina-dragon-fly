import * as THREE from 'three';

export class FlightFollower {
  private flyGroup: THREE.Group;
  private tailNode: THREE.Object3D | null = null;
  private camera: THREE.PerspectiveCamera;
  private thoraxCenter: THREE.Vector3;

  // Normalized mouse target [-1, 1]
  private targetPointerX: number = 0;
  private targetPointerY: number = 0;

  // Current smoothed 3D offset
  private currentOffset: THREE.Vector3 = new THREE.Vector3();
  private targetOffset: THREE.Vector3 = new THREE.Vector3();
  private prevOffset: THREE.Vector3 = new THREE.Vector3();

  // Damped body tilt angles (radians)
  private currentRoll: number = 0;
  private currentPitch: number = 0;

  // Organic time accumulator
  private time: number = 0;

  // Reusable vectors for zero GC allocation in 60fps loop
  private camRight: THREE.Vector3 = new THREE.Vector3();
  private camUp: THREE.Vector3 = new THREE.Vector3();
  private vel: THREE.Vector3 = new THREE.Vector3();
  private zeroVec: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

  constructor(
    flyGroup: THREE.Group,
    tailNode: THREE.Object3D | null,
    camera: THREE.PerspectiveCamera,
    thoraxCenter: THREE.Vector3 = new THREE.Vector3(0, 0.005, -0.05)
  ) {
    this.flyGroup = flyGroup;
    this.tailNode = tailNode;
    this.camera = camera;
    this.thoraxCenter = thoraxCenter;
  }

  public setPointer(normalizedX: number, normalizedY: number) {
    this.targetPointerX = THREE.MathUtils.clamp(normalizedX, -1, 1);
    this.targetPointerY = THREE.MathUtils.clamp(normalizedY, -1, 1);
  }

  public update(dt: number, isHovering: boolean) {
    this.time += dt;

    if (isHovering) {
      // 1. Calculate camera distance to specimen center
      const dist = this.camera.position.distanceTo(this.thoraxCenter);

      // 2. Visible frustum half-extents at specimen plane
      const fovRad = (this.camera.fov * Math.PI) / 180;
      const halfHeight = dist * Math.tan(fovRad / 2);
      const halfWidth = halfHeight * this.camera.aspect;

      // 3. Safe bounds with 15% visual padding to keep entire specimen (wings, head, tail) comfortably in frame
      // Model half-wingspan is ~0.11m, half-length is ~0.09m
      const safeMarginX = Math.max(0.015, halfWidth * 0.82 - 0.10);
      const safeMarginY = Math.max(0.010, halfHeight * 0.82 - 0.07);

      // 4. Extract Camera Right (X) and Up (Y) world vectors without GC allocation
      const camMatrix = this.camera.matrixWorld;
      this.camRight
        .set(camMatrix.elements[0], camMatrix.elements[1], camMatrix.elements[2])
        .normalize();

      this.camUp
        .set(camMatrix.elements[4], camMatrix.elements[5], camMatrix.elements[6])
        .normalize();

      // Soft mouse target in camera-aligned space
      const offsetX = this.targetPointerX * safeMarginX;
      const offsetY = this.targetPointerY * safeMarginY;

      // Subtle organic vertical float
      const bioFloat = Math.sin(this.time * 2.2) * 0.0025;

      this.targetOffset
        .copy(this.camRight)
        .multiplyScalar(offsetX)
        .addScaledVector(this.camUp, offsetY + bioFloat);

      // 5. Heavy exponential damping for organic, living lag (never twitches, never snaps)
      const dampFactor = 1 - Math.exp(-3.2 * dt);
      this.currentOffset.lerp(this.targetOffset, dampFactor);

      // 6. Compute velocity for subtle banking tilts (approx +/- 2 to 4 degrees max)
      this.vel
        .subVectors(this.currentOffset, this.prevOffset)
        .divideScalar(Math.max(dt, 0.001));
      this.prevOffset.copy(this.currentOffset);

      const velRight = this.vel.dot(this.camRight);
      const velUp = this.vel.dot(this.camUp);

      // Maximum tilt is ~0.06 rad (3.4 degrees)
      const targetRoll = -THREE.MathUtils.clamp(velRight * 5.5, -0.06, 0.06);
      const targetPitch = THREE.MathUtils.clamp(velUp * 4.5, -0.045, 0.045);

      const tiltDamp = 1 - Math.exp(-5.0 * dt);
      this.currentRoll += (targetRoll - this.currentRoll) * tiltDamp;
      this.currentPitch += (targetPitch - this.currentPitch) * tiltDamp;

      // Apply translation to fly group
      this.flyGroup.position.copy(this.currentOffset);

      // Apply subtle body tilt
      this.flyGroup.rotation.z = this.currentRoll;
      this.flyGroup.rotation.x = this.currentPitch;

      // 7. Subtle tail counter-correction
      if (this.tailNode) {
        this.tailNode.rotation.z = -this.currentRoll * 0.4;
        this.tailNode.rotation.x = -this.currentPitch * 0.4;
      }
    } else {
      // Graceful return to base pose (0, 0, 0)
      const returnDamp = 1 - Math.exp(-5.0 * dt);
      this.currentOffset.lerp(this.zeroVec, returnDamp);
      this.flyGroup.position.copy(this.currentOffset);
      this.prevOffset.copy(this.currentOffset);

      this.currentRoll += (0 - this.currentRoll) * returnDamp;
      this.currentPitch += (0 - this.currentPitch) * returnDamp;
      this.flyGroup.rotation.z = this.currentRoll;
      this.flyGroup.rotation.x = this.currentPitch;

      if (this.tailNode) {
        this.tailNode.rotation.z += (0 - this.tailNode.rotation.z) * returnDamp;
        this.tailNode.rotation.x += (0 - this.tailNode.rotation.x) * returnDamp;
      }
    }
  }

  public reset() {
    this.currentOffset.set(0, 0, 0);
    this.targetOffset.set(0, 0, 0);
    this.prevOffset.set(0, 0, 0);
    this.currentRoll = 0;
    this.currentPitch = 0;
    this.flyGroup.position.set(0, 0, 0);
    this.flyGroup.rotation.set(0, 0, 0);
    if (this.tailNode) {
      this.tailNode.rotation.set(0, 0, 0);
    }
  }
}
