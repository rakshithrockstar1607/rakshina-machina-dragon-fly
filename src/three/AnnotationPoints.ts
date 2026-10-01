import type { SystemDetail } from '../types/dragonfly';

export const SYSTEM_DETAILS: SystemDetail[] = [
  {
    id: 'compound-optics',
    number: '01',
    title: 'COMPOUND OPTICS',
    category: 'SENSORY TELEMETRY',
    tagline: 'Multi-faceted panoramic optical array with sapphire nano-gaskets.',
    description:
      'Over 28,000 hexagonal photo-receptive facets capture hemispherical light telemetry with zero chromatic aberration. Integrated anti-reflective sapphire gaskets isolate internal laser rangefinders and optical flow sensors.',
    specs: [
      { label: 'ARRAY DENSITY', value: '28,400 OMMATIDIA' },
      { label: 'BANDWIDTH', value: '380 - 1050 NM UV/IR' },
      { label: 'TEMPORAL RES', value: '320 HZ SAMPLING' },
      { label: 'GASKET SUBSTRATE', value: 'SAPPHIRE CERAMIC' }
    ],
    anchor: [0.011, 0.003, 0.013],
    cameraPos: [0.031, 0.033, 0.045],
    cameraTarget: [0.009, 0.002, 0.001]
  },
  {
    id: 'quad-wing-actuation',
    number: '02',
    title: 'QUAD-WING ACTUATION',
    category: 'AERODYNAMIC KINEMATICS',
    tagline: 'Four independent direct-drive brushless piezoelectric root articulators.',
    description:
      'Independent stroke, pitch, and twist kinematics operate asynchronously on forewings and hindwings. Carbon-lattice membrane venation enables passive aeroelastic twist, producing instantaneous hovering vortices and backward flight.',
    specs: [
      { label: 'STROKE FREQ', value: '0 - 48 HZ VARIABLE' },
      { label: 'PITCH CONTROL', value: '+45° / -35° DYNAMIC' },
      { label: 'WINGSPAN', value: '284 MM TOTAL' },
      { label: 'MEMBRANE', value: 'CARBON-GRAPHITE FILM' }
    ],
    anchor: [0.045, 0.016, -0.015],
    cameraPos: [0.12, 0.11, -0.012],
    cameraTarget: [0.045, 0.015, -0.018]
  },
  {
    id: 'thoracic-flight-core',
    number: '03',
    title: 'THORACIC FLIGHT CORE',
    category: 'PROPULSION & POWER',
    tagline: 'High-density flux-coupled kinetic core within titanium dorsal carapace.',
    description:
      'Centralized magnetic resonance drive unit encased within champagne titanium and graphite composite armor. Tri-axial fluidic gyroscopes provide real-time inertial balance while micro-pneumatic dampers isolate motor harmonics.',
    specs: [
      { label: 'CORE TORQUE', value: '1.42 NM PEAK' },
      { label: 'CHASSIS', value: 'TI-6AL-4V CHAMPAGNE' },
      { label: 'INERTIAL DRIFT', value: '< 0.002° / MIN' },
      { label: 'THERMAL FLUX', value: 'SOLID-STATE SINK' }
    ],
    anchor: [0.0, 0.009, -0.015],
    cameraPos: [0.065, 0.053, 0.09],
    cameraTarget: [0.0, 0.005, -0.02]
  },
  {
    id: 'articulated-abdomen',
    number: '04',
    title: 'ARTICULATED ABDOMEN',
    category: 'FLIGHT STABILIZATION',
    tagline: 'Nine-segment articulated caudal architecture with photonic bus.',
    description:
      'Nine individually articulated titanium vertebrae flex sequentially to counterbalance aerostroke turbulence. Photonic conduits transmit high-speed tail vector commands while rear micro-fins provide passive pitch trim.',
    specs: [
      { label: 'SEGMENTS', value: '9 ACTIVE VERTEBRAE' },
      { label: 'DEFLECTION', value: '± 28° MULTI-AXIS' },
      { label: 'TELEMETRY BUS', value: 'PHOTONIC EMERALD' },
      { label: 'STABILIZER', value: 'CAUDAL MICRO-FINS' }
    ],
    anchor: [0.0, 0.002, -0.085],
    cameraPos: [-0.09, 0.07, -0.15],
    cameraTarget: [0.0, 0.002, -0.075]
  },
  {
    id: 'six-point-landing',
    number: '05',
    title: 'SIX-POINT LANDING SYSTEM',
    category: 'TERRESTRIAL INTERFACE',
    tagline: 'Hexapod suspension with coxa-femur micro-damping and magnetic claws.',
    description:
      'Six multi-jointed titanium limbs feature dual-stage hydraulic compression and tungsten-carbide tarsal grippers. Automatically compresses upon landing contact and tucks flush beneath thorax contours in flight.',
    specs: [
      { label: 'SUSPENSION', value: 'DUAL-STAGE HYDRAULIC' },
      { label: 'DOCKING CONTACT', value: '6-POINT MAGNETIC' },
      { label: 'TUCK TIME', value: '320 MS RETRACTION' },
      { label: 'TOUCHDOWN RATING', value: '12G DECELERATION' }
    ],
    anchor: [0.022, -0.016, 0.01],
    cameraPos: [0.057, 0.004, 0.045],
    cameraTarget: [0.015, -0.016, -0.005]
  }
];
