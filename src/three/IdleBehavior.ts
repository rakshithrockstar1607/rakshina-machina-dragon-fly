import * as THREE from 'three';

export class IdleBehavior {
  private mixer: THREE.AnimationMixer;
  private breathAction: THREE.AnimationAction | null = null;
  private actions: Map<string, THREE.AnimationAction> = new Map();

  private isEnabled: boolean = true;
  private timers: { [key: string]: number } = {};
  private intervals: { [key: string]: [number, number] } = {
    antenna: [2.0, 5.0],
    head: [3.0, 7.5],
    tail: [4.0, 8.5],
    groom: [14.0, 26.0],
    wingSettle: [11.0, 23.0],
    bodyShift: [9.0, 18.0]
  };

  private activeOneShots: Set<THREE.AnimationAction> = new Set();

  constructor(mixer: THREE.AnimationMixer, animations: THREE.AnimationClip[]) {
    this.mixer = mixer;

    // Continuous breath
    const breathClip = animations.find((a) => a.name === 'IDLE_BREATH');
    if (breathClip) {
      this.breathAction = mixer.clipAction(breathClip);
      this.breathAction.setLoop(THREE.LoopRepeat, Infinity);
      this.breathAction.setEffectiveWeight(0.7);
    }

    // Modular idle actions
    const oneShotNames = [
      'IDLE_ANTENNA',
      'IDLE_HEAD_LOOK_L',
      'IDLE_HEAD_LOOK_R',
      'IDLE_HEAD_LOOK_UP',
      'IDLE_TAIL',
      'IDLE_FRONT_LEG_GROOM',
      'IDLE_WING_SETTLE',
      'IDLE_BODY_SHIFT'
    ];

    oneShotNames.forEach((name) => {
      const clip = animations.find((a) => a.name === name);
      if (clip) {
        const action = mixer.clipAction(clip);
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = false;
        this.actions.set(name, action);
      }
    });

    // Initialize timers
    Object.keys(this.intervals).forEach((key) => {
      const [min, max] = this.intervals[key];
      this.timers[key] = min + Math.random() * (max - min);
    });

    // Listen for animation finish
    this.mixer.addEventListener('finished', (e: any) => {
      if (this.activeOneShots.has(e.action)) {
        this.activeOneShots.delete(e.action);
        e.action.stop();
      }
    });
  }

  public setEnabled(enabled: boolean) {
    if (this.isEnabled === enabled) return;
    this.isEnabled = enabled;

    if (enabled) {
      if (this.breathAction) {
        this.breathAction.reset().fadeIn(0.6).play();
      }
    } else {
      if (this.breathAction) {
        this.breathAction.fadeOut(0.4);
      }
      this.activeOneShots.forEach((act) => {
        act.fadeOut(0.3);
      });
      this.activeOneShots.clear();
    }
  }

  public update(dt: number) {
    if (!this.isEnabled) return;

    // Update timers
    Object.keys(this.intervals).forEach((key) => {
      this.timers[key] -= dt;
      if (this.timers[key] <= 0) {
        const [min, max] = this.intervals[key];
        this.timers[key] = min + Math.random() * (max - min);
        this.triggerBehavior(key);
      }
    });
  }

  private triggerBehavior(type: string) {
    let actionName = '';
    switch (type) {
      case 'antenna':
        actionName = 'IDLE_ANTENNA';
        break;
      case 'head': {
        const variants = ['IDLE_HEAD_LOOK_L', 'IDLE_HEAD_LOOK_R', 'IDLE_HEAD_LOOK_UP'];
        actionName = variants[Math.floor(Math.random() * variants.length)];
        break;
      }
      case 'tail':
        actionName = 'IDLE_TAIL';
        break;
      case 'groom':
        actionName = 'IDLE_FRONT_LEG_GROOM';
        break;
      case 'wingSettle':
        actionName = 'IDLE_WING_SETTLE';
        break;
      case 'bodyShift':
        actionName = 'IDLE_BODY_SHIFT';
        break;
    }

    const action = this.actions.get(actionName);
    if (action && !this.activeOneShots.has(action)) {
      action.reset().fadeIn(0.2).play();
      this.activeOneShots.add(action);
    }
  }
}
