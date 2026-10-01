import * as THREE from 'three';

interface ExplodeTarget {
  wrapper: THREE.Group;
  direction: THREE.Vector3;
}

export class ExplodedView {
  private targets: ExplodeTarget[] = [];
  private targetAmount: number = 0; // 0 to 100
  private currentAmount: number = 0;

  constructor(scene: THREE.Group) {
    // Semantic explosion definition: node name -> directional offset vector in rig space
    const explosionDefinitions: Record<string, [number, number, number]> = {
      // Compound optics & eye assemblies: outward from head
      DF_HEAD_Eye_L: [-1.2, 0.35, 0.7],
      DF_HEAD_Eye_R: [1.2, 0.35, 0.7],
      DF_HEAD_Armor_Crown_L: [-0.4, 0.9, 0.3],
      DF_HEAD_Armor_Crown_R: [0.4, 0.9, 0.3],
      DF_HEAD_CranialBridge: [0.0, 1.1, 0.4],

      // Thorax armor: dorsal upward, lateral outward
      DF_ARMOR_DORSAL: [0.0, 1.6, 0.0],
      DF_ARMOR_LEFT: [-1.5, 0.6, 0.0],
      DF_ARMOR_RIGHT: [1.5, 0.6, 0.0],
      DF_ARMOR_VENTRAL: [0.0, -0.6, 0.4],
      DF_FLIGHT_CORE: [0.0, 0.85, 0.0],

      // Quad wings: outward along root angles
      DF_WINGROOT_FL: [-1.4, 0.8, 0.5],
      DF_WINGROOT_FR: [1.4, 0.8, 0.5],
      DF_WINGROOT_RL: [-1.5, 0.7, -0.6],
      DF_WINGROOT_RR: [1.5, 0.7, -0.6],

      // Abdomen segments: progressive longitudinal separation with slight upward slope
      DF_ABDOMEN_RECEIVER: [0.0, 0.15, -0.3],
      DF_TAIL_SEG_01: [0.0, 0.2, -0.6],
      DF_TAIL_SEG_02: [0.0, 0.25, -1.0],
      DF_TAIL_SEG_03: [0.0, 0.3, -1.4],
      DF_TAIL_SEG_04: [0.0, 0.35, -1.8],
      DF_TAIL_SEG_05: [0.0, 0.4, -2.2],
      DF_TAIL_SEG_06: [0.0, 0.45, -2.6],
      DF_TAIL_SEG_07: [0.0, 0.5, -3.0],
      DF_TAIL_SEG_08: [0.0, 0.55, -3.4],
      DF_TAIL_SEG_09: [0.0, 0.6, -3.8],

      // Hexapod landing system: outward with strong upward bias (NEVER pierces podium!)
      DF_LEG_FL_CoxaCore: [-1.1, 0.85, 0.8],
      DF_LEG_FR_CoxaCore: [1.1, 0.85, 0.8],
      DF_LEG_ML_CoxaCore: [-1.3, 0.85, 0.0],
      DF_LEG_MR_CoxaCore: [1.3, 0.85, 0.0],
      DF_LEG_RL_CoxaCore: [-1.2, 0.85, -0.8],
      DF_LEG_RR_CoxaCore: [1.2, 0.85, -0.8]
    };

    // Construct neutral wrapper THREE.Group for each semantic component
    for (const [nodeName, dir] of Object.entries(explosionDefinitions)) {
      const node = scene.getObjectByName(nodeName);
      if (node && node.parent) {
        const parent = node.parent;
        const wrapper = new THREE.Group();
        wrapper.name = `${nodeName}__EXPLODE_WRAPPER`;

        // Wrapper sits at local origin of parent
        wrapper.position.set(0, 0, 0);
        wrapper.quaternion.identity();
        wrapper.scale.set(1, 1, 1);

        parent.add(wrapper);
        // Note: keeping node's original local position and rotation intact
        wrapper.add(node);

        this.targets.push({
          wrapper,
          direction: new THREE.Vector3(...dir)
        });
      }
    }
  }

  public setExplodeAmount(amount: number) {
    this.targetAmount = Math.max(0, Math.min(100, amount));
  }

  public update(dt: number) {
    // Smooth damping interpolation
    const lerpSpeed = Math.min(1.0, dt * 7.0);
    this.currentAmount += (this.targetAmount - this.currentAmount) * lerpSpeed;

    const fraction = this.currentAmount / 100;

    // Apply offset directly to wrapper without touching animated children
    for (let i = 0; i < this.targets.length; i++) {
      const t = this.targets[i];
      if (fraction <= 0.0001) {
        t.wrapper.position.set(0, 0, 0);
      } else {
        t.wrapper.position.copy(t.direction).multiplyScalar(fraction);
      }
    }
  }

  public getAmount(): number {
    return this.currentAmount;
  }
}
