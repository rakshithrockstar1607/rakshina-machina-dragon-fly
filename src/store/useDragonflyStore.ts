import type { ThemeMode, FlightState, CameraPreset } from '../types/dragonfly';

type Listener = () => void;

interface StoreState {
  theme: ThemeMode;
  flightState: FlightState;
  wingSpeed: number;
  explodeAmount: number;
  cameraPreset: CameraPreset;
  activeSection: 'specimen' | 'anatomy';
  selectedSystemId: string | null;
  isLoaded: boolean;
  loadProgress: number;
  loadStatusText: string;
  isDragging: boolean;
}

const state: StoreState = {
  theme: 'ivory',
  flightState: 'GROUNDED',
  wingSpeed: 0,
  explodeAmount: 0,
  cameraPreset: 'ISO',
  activeSection: 'specimen',
  selectedSystemId: null,
  isLoaded: false,
  loadProgress: 0,
  loadStatusText: 'INITIALIZING SPECIMEN LAB...',
  isDragging: false,
};

const listeners = new Set<Listener>();

function notify() {
  listeners.forEach(fn => fn());
}

export const dragonflyStore = {
  getState: () => state,

  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  setTheme: (theme: ThemeMode) => {
    if (state.theme === theme) return;
    state.theme = theme;
    notify();
  },

  toggleTheme: () => {
    state.theme = state.theme === 'ivory' ? 'obsidian' : 'ivory';
    notify();
  },

  setFlightState: (flightState: FlightState) => {
    if (state.flightState === flightState) return;
    state.flightState = flightState;
    notify();
  },

  setWingSpeed: (speed: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(speed)));
    if (state.wingSpeed === clamped) return;
    state.wingSpeed = clamped;
    notify();
  },

  setExplodeAmount: (amount: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(amount)));
    if (state.explodeAmount === clamped) return;
    state.explodeAmount = clamped;
    notify();
  },

  setCameraPreset: (preset: CameraPreset) => {
    if (state.cameraPreset === preset) return;
    state.cameraPreset = preset;
    notify();
  },

  setActiveSection: (section: 'specimen' | 'anatomy') => {
    if (state.activeSection === section) return;
    state.activeSection = section;
    notify();
  },

  setSelectedSystemId: (id: string | null) => {
    if (state.selectedSystemId === id) return;
    state.selectedSystemId = id;
    notify();
  },

  setLoadingProgress: (progress: number, statusText?: string) => {
    const clamped = Math.min(100, Math.round(progress));
    if (state.loadProgress === clamped && (!statusText || state.loadStatusText === statusText)) return;
    state.loadProgress = clamped;
    if (statusText) state.loadStatusText = statusText;
    if (clamped >= 100) {
      state.isLoaded = true;
    }
    notify();
  },

  setIsLoaded: (isLoaded: boolean) => {
    if (state.isLoaded === isLoaded) return;
    state.isLoaded = isLoaded;
    notify();
  },

  setIsDragging: (isDragging: boolean) => {
    if (state.isDragging === isDragging) return;
    state.isDragging = isDragging;
    notify();
  }
};

// React hook
import { useSyncExternalStore } from 'react';

export function useDragonflyStore<T>(selector: (s: StoreState) => T): T {
  return useSyncExternalStore(
    dragonflyStore.subscribe,
    () => selector(dragonflyStore.getState()),
    () => selector(dragonflyStore.getState())
  );
}
