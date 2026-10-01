import * as THREE from 'three';

export class HeadTracker {
  private yawNode: THREE.Object3D | null;
  private pitchNode: THREE.Object3D | null;
  private baseYawQuat: THREE.Quaternion = new THREE.Quaternion();
  private basePitchQuat: THREE.Quaternion = new THREE.Quaternion();

  private targetYaw: number = 0; // radians
  private targetPitch: number = 0; // radians
  private currentYaw: number = 0;
  private currentPitch: number = 0;

  private readonly maxYaw: number = THREE.MathUtils.degToRad(6.5);
  private readonly maxPitch: number = THREE.MathUtils.degToRad(3.5);

  constructor(yawNode: THREE.Object3D | null, pitchNode: THREE.Object3D | null) {
    this.yawNode = yawNode;
    this.pitchNode = pitchNode;

    if (this.yawNode) {
      this.baseYawQuat.copy(this.yawNode.quaternion);
    }
    if (this.pitchNode) {
      this.basePitchQuat.copy(this.pitchNode.quaternion);
    }
  }

  public updatePointer(normalizedX: number, normalizedY: number) {
    // normalizedX in [-1, 1], normalizedY in [-1, 1]
    this.targetYaw = -normalizedX * this.maxYaw;
    this.targetPitch = -normalizedY * this.maxPitch;
  }

  public update(dt: number) {
    if (!this.yawNode && !this.pitchNode) return;

    // Smooth heavy damping (lerp factor ~ 4.0 * dt)
    const factor = Math.min(1.0, dt * 4.0);
    this.currentYaw += (this.targetYaw - this.currentYaw) * factor;
    this.currentPitch += (this.targetPitch - this.currentPitch) * factor;

    if (this.yawNode) {
      const qYaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), this.currentYaw);
      this.yawNode.quaternion.copy(this.baseYawQuat).multiply(qYaw);
    }

    if (this.pitchNode) {
      const qPitch = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.currentPitch);
      this.pitchNode.quaternion.copy(this.basePitchQuat).multiply(qPitch);
    }
  }
}
