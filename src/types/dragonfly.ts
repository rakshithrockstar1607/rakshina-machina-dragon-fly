export type ThemeMode = 'ivory' | 'obsidian';

export type FlightState = 'GROUNDED' | 'TAKING_OFF' | 'HOVERING' | 'LANDING';

export type CameraPreset = 'ISO' | 'PLAN' | 'FRONT' | 'PROFILE';

export interface SystemDetail {
  id: string;
  number: string;
  title: string;
  category: string;
  tagline: string;
  description: string;
  specs: { label: string; value: string }[];
  anchor: [number, number, number];
  cameraPos: [number, number, number];
  cameraTarget: [number, number, number];
}

export interface AnnotationScreenPoint {
  id: string;
  x: number;
  y: number;
  visible: boolean;
}
