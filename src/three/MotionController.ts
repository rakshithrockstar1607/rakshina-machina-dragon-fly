import * as THREE from 'three';
import type { FlightState } from '../types/dragonfly';
import { IdleBehavior } from './IdleBehavior';
import { dragonflyStore } from '../store/useDragonflyStore';

export class MotionController {
  private idleBehavior: IdleBehavior;

  // Actions
  private restAction: THREE.AnimationAction | null = null;
  private takeoffAction: THREE.AnimationAction | null = null;
  private hoverSlowAction: THREE.AnimationAction | null = null;
  private hoverFastAction: THREE.AnimationAction | null = null;
  private landingAction: THREE.AnimationAction | null = null;
  private wingCalibAction: THREE.AnimationAction | null = null;

  // State
  private currentState: FlightState = 'GROUNDED';
  private targetWingSpeed: number = 0; // 0 - 100
  private currentWingSpeed: number = 0;
  private stateTimer: number = 0;

  constructor(
    mixer: THREE.AnimationMixer,
    animations: THREE.AnimationClip[],
    idleBehavior: IdleBehavior
  ) {
    this.idleBehavior = idleBehavior;

    // Helper to setup action
    const getAction = (name: string) => {
      const clip = animations.find((a) => a.name === name);
      return clip ? mixer.clipAction(clip) : null;
    };

    this.restAction = getAction('REST_BASE');
    this.takeoffAction = getAction('TAKEOFF');
    this.hoverSlowAction = getAction('HOVER_SLOW');
    this.hoverFastAction = getAction('HOVER_FAST');
    this.landingAction = getAction('LANDING');
    this.wingCalibAction = getAction('WING_CALIBRATION');

    if (this.takeoffAction) {
      this.takeoffAction.setLoop(THREE.LoopOnce, 1);
      this.takeoffAction.clampWhenFinished = true;
    }
    if (this.landingAction) {
      this.landingAction.setLoop(THREE.LoopOnce, 1);
      this.landingAction.clampWhenFinished = true;
    }
    if (this.hoverSlowAction) {
      this.hoverSlowAction.setLoop(THREE.LoopRepeat, Infinity);
    }
    if (this.hoverFastAction) {
      this.hoverFastAction.setLoop(THREE.LoopRepeat, Infinity);
    }

    // Start with REST_BASE and enable idle
    if (this.restAction) {
      this.restAction.play();
    }
    this.idleBehavior.setEnabled(true);
  }

  public getState(): FlightState {
    return this.currentState;
  }

  public getWingSpeed(): number {
    return this.currentWingSpeed;
  }

  public takeoff() {
    if (this.currentState === 'TAKING_OFF' || this.currentState === 'HOVERING') return;

    this.currentState = 'TAKING_OFF';
    this.stateTimer = 0;
    dragonflyStore.setFlightState('TAKING_OFF');
    this.idleBehavior.setEnabled(false);

    if (this.restAction) this.restAction.fadeOut(0.3);
    if (this.landingAction) this.landingAction.stop();

    if (this.takeoffAction) {
      this.takeoffAction.reset().fadeIn(0.2).play();
    }

    // Ramp target wing speed to high flight speed
    if (this.targetWingSpeed < 40) {
      this.targetWingSpeed = 65;
      dragonflyStore.setWingSpeed(65);
    }
  }

  public land() {
    if (this.currentState === 'LANDING' || this.currentState === 'GROUNDED') return;

    this.currentState = 'LANDING';
    this.stateTimer = 0;
    dragonflyStore.setFlightState('LANDING');

    if (this.takeoffAction) this.takeoffAction.stop();
    if (this.hoverSlowAction) this.hoverSlowAction.fadeOut(0.6);
    if (this.hoverFastAction) this.hoverFastAction.fadeOut(0.6);

    if (this.landingAction) {
      this.landingAction.reset().fadeIn(0.3).play();
    }

    this.targetWingSpeed = 0;
    dragonflyStore.setWingSpeed(0);
  }

  public setWingSpeed(speed: number) {
    this.targetWingSpeed = Math.max(0, Math.min(100, speed));

    if (this.currentState === 'GROUNDED' && this.targetWingSpeed > 25) {
      this.takeoff();
    } else if (this.currentState === 'HOVERING' && this.targetWingSpeed === 0) {
      this.land();
    }
  }

  public update(dt: number) {
    // Smooth wing speed damping
    const speedLerp = Math.min(1.0, dt * 5.0);
    this.currentWingSpeed += (this.targetWingSpeed - this.currentWingSpeed) * speedLerp;

    if (this.currentState === 'TAKING_OFF') {
      this.stateTimer += dt;
      // Takeoff duration is 4.0s
      if (this.stateTimer >= 3.9) {
        this.currentState = 'HOVERING';
        dragonflyStore.setFlightState('HOVERING');
        this.transitionToHover();
      }
    } else if (this.currentState === 'LANDING') {
      this.stateTimer += dt;
      // Landing duration is 4.5s
      if (this.stateTimer >= 4.4) {
        this.currentState = 'GROUNDED';
        dragonflyStore.setFlightState('GROUNDED');
        if (this.landingAction) this.landingAction.fadeOut(0.3);
        if (this.restAction) this.restAction.reset().fadeIn(0.4).play();
        this.idleBehavior.setEnabled(true);
      }
    } else if (this.currentState === 'HOVERING') {
      this.updateHoverActions();
    } else if (this.currentState === 'GROUNDED') {
      if (this.currentWingSpeed > 2 && this.currentWingSpeed <= 25) {
        // Subtle calibration fluttering
        if (this.wingCalibAction && !this.wingCalibAction.isRunning()) {
          this.wingCalibAction.reset().fadeIn(0.3).play();
        }
      } else {
        if (this.wingCalibAction && this.wingCalibAction.isRunning()) {
          this.wingCalibAction.fadeOut(0.3);
        }
      }
    }
  }

  private transitionToHover() {
    if (this.takeoffAction) {
      this.takeoffAction.fadeOut(0.4);
    }
    if (this.hoverSlowAction) {
      this.hoverSlowAction.reset().fadeIn(0.4).play();
    }
    if (this.hoverFastAction) {
      this.hoverFastAction.reset().fadeIn(0.4).play();
    }
    this.updateHoverActions();
  }

  private updateHoverActions() {
    // Speed: 0 to 100
    // TimeScale: from 0.7 at speed 10 to 2.2 at speed 100
    const normalized = Math.max(0.1, this.currentWingSpeed / 100);
    const timeScale = 0.7 + normalized * 1.5;

    // Blend weights: slow vs fast
    const fastWeight = Math.max(0, Math.min(1, (this.currentWingSpeed - 40) / 40));
    const slowWeight = 1 - fastWeight;

    if (this.hoverSlowAction) {
      this.hoverSlowAction.timeScale = timeScale;
      this.hoverSlowAction.setEffectiveWeight(slowWeight);
    }
    if (this.hoverFastAction) {
      this.hoverFastAction.timeScale = timeScale;
      this.hoverFastAction.setEffectiveWeight(fastWeight);
    }
  }
}
