# RAKSHINA MACHINA
### Interactive 3D Mechanical Dragonfly Web Experience
> **Made by Rakshith** • High-Fidelity Biomimetic Aerospace & Robotics Specimen Study

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=white)](https://greensock.com/gsap/)

---

## Overview

**Rakshina Machina** is an interactive, browser-native 3D museum specimen study of an artificial biomimetic odonata (*Aeshna*) flight platform. Engineered in Three.js and React 19 with museum-grade physical rendering, real-time kinematics, multi-tier inspection systems, and dynamic day/night optical modes.

---

## Key Highlights

- **Biomimetic Flight Kinematics:** Smooth takeoff, aerodynamic banking, figure-8 hovering loops, mouse-following gaze tracking, and soft-landing stabilization.
- **Stationary Precision Turntable & Azimuth Compass:** Independent turntable podium with a flat 2048×2048 technical azimuth compass ring aligned to world cardinal orientations (N / E / S / W).
- **Dual Optical Modes (Ivory & Obsidian):**
  - **Ivory Mode:** Warm daylight studio illumination with soft cosine contact shadows and titanium reflections.
  - **Obsidian Mode:** Deep tactical stealth aesthetic with glowing emerald compound ommatidia (28,400 lenses) and teal photonic bus illumination.
- **Interactive Mechanical Disassembly (Exploded View):** Continuous 0%–100% radial dispersion slider to inspect internal carbon framing, actuators, servos, optical buses, and 9 articulated tail vertebrae.
- **High-Frequency Wing Kinetics:** Variable stroke frequency slider (0–48 Hz) with realistic stroke, pitch, and twist phase offsets.
- **Editorial Museum Typography:** Cormorant Garamond italic serif and IBM Plex Mono precision technical layouts.

---

## Technology Stack

- **3D Engine:** [Three.js](https://threejs.org/) (r186) with AgX Tone Mapping, PCF soft shadows, and custom PMREM studio lighting
- **Geometry & Mesh Optimization:** [Meshoptimizer WASM](https://github.com/zeux/meshoptimizer) for fast streaming of complex mechanical hierarchies
- **Animation & Transitions:** [GSAP 3](https://greensock.com/gsap/) for smooth camera tweening and parameter interpolation
- **Framework:** React 19 + TypeScript + Vite 8
- **Icons & Styling:** Lucide React, Custom CSS variables, responsive touch/mouse controls

---

## Camera Presets & Navigation

- **ISO:** Isometric 3/4 perspective highlighting the complete specimen and turntable.
- **PLAN:** Direct top-down blueprint plan view for inspecting wing aspect ratio and dorsal carapace.
- **FRONT:** Direct forward gaze into the compound optical ommatidia and cranial bridge.
- **PROFILE:** True lateral elevation profile showcasing articulation of the 9-segment caudal tail and landing gear.
- **Orbit & Zoom:** Tactile damped orbit controls with bounded distance (`0.12m` – `0.38m`) to prevent clipping.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone repository
git clone https://github.com/rakshithrockstar1607/rakshina-machina-dragon-fly.git

# Enter project directory
cd rakshina-machina-dragon-fly

# Install dependencies
npm install

# Start local development server
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

---

## Project Structure

```
├── public/
│   ├── assets/models/
│   │   └── AESHNA_MACHINA_WEB_HQ.glb  # Optimized GLTF 3D model
│   └── environments/
│       └── studio.exr                 # Studio HDRI reflection map
├── src/
│   ├── components/
│   │   ├── Anatomy/                   # Section 02 exploded callouts & details
│   │   ├── Background/                # Calibration reticule & background graphics
│   │   ├── Canvas/                    # Persistent WebGL single canvas root
│   │   ├── Controls/                  # Floating glassmorphic dock
│   │   ├── Cursor/                    # Precision custom technical cursor
│   │   ├── Hero/                      # Specimen taxonomy card & typography
│   │   ├── Navigation/                # Real-time telemetry & header
│   │   └── Theme/                     # Ivory / Obsidian mode toggle
│   ├── store/
│   │   └── useDragonflyStore.ts       # Global state management
│   ├── three/
│   │   ├── AeshnaScene.ts             # Core Three.js render pipeline & scene
│   │   ├── BasePlateCompass.ts        # Flat 3D azimuth compass
│   │   ├── CameraRig.ts               # Damped orbit controller & presets
│   │   ├── DragonflyLoader.ts         # Meshopt loader & material configuration
│   │   ├── ExplodedView.ts            # Disassembly vector kinematics
│   │   ├── FlightFollower.ts          # Hover loop & cursor tracking
│   │   ├── HeadTracker.ts             # Inverse kinematics head look-at
│   │   └── MotionController.ts        # Wing strokes & flight state machine
│   └── App.tsx                        # Root layout orchestrator
└── package.json
```

---

## Author & Credits

- **Project:** Rakshina Machina
- **Creator / Architect:** **Rakshith**
- **Repository:** [https://github.com/rakshithrockstar1607/rakshina-machina-dragon-fly](https://github.com/rakshithrockstar1607/rakshina-machina-dragon-fly)
