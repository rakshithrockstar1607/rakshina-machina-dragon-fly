import * as THREE from 'three';

export class BasePlateCompass {
  public mesh: THREE.Mesh;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private texture: THREE.CanvasTexture;
  private material: THREE.MeshBasicMaterial;

  constructor(isDark: boolean = false) {
    const size = 2048;
    this.canvas = document.createElement('canvas');
    this.canvas.width = size;
    this.canvas.height = size;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D canvas context for BasePlateCompass');
    this.ctx = ctx;

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.generateMipmaps = true;
    this.texture.minFilter = THREE.LinearMipmapLinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.anisotropy = 8;

    this.material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
      side: THREE.DoubleSide
    });

    // 0.36m diameter covers from radius 0 to 0.18m (podium outer rim is ~0.103m)
    const geometry = new THREE.PlaneGeometry(0.36, 0.36);
    geometry.rotateX(-Math.PI / 2);

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.name = 'DF_BASEPLATE_COMPASS';
    // Position concentric with DF_PODIUM_MASTER at top of base plate
    this.mesh.position.set(0, -0.0288, -0.058);
    this.mesh.matrixAutoUpdate = false;
    this.mesh.updateMatrix();

    this.renderCompassTexture(isDark);
  }

  public setTheme(isDark: boolean) {
    this.renderCompassTexture(isDark);
    this.texture.needsUpdate = true;
  }

  private renderCompassTexture(isDark: boolean) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    // Color palette based on theme
    const primaryColor = isDark ? 'rgba(94, 234, 212, 0.90)' : 'rgba(38, 48, 44, 0.85)';
    const secondaryColor = isDark ? 'rgba(94, 234, 212, 0.45)' : 'rgba(38, 48, 44, 0.45)';
    const hairlineColor = isDark ? 'rgba(94, 234, 212, 0.22)' : 'rgba(38, 48, 44, 0.22)';
    const accentColor = isDark ? '#2dd4bf' : '#0d7c6f';
    const textColor = isDark ? 'rgba(240, 253, 250, 0.92)' : 'rgba(28, 38, 34, 0.92)';
    const subtleTextColor = isDark ? 'rgba(94, 234, 212, 0.60)' : 'rgba(75, 88, 82, 0.65)';

    // Radius scale: podium rim is at r ≈ 585px (10.3cm / 18cm * 1024px)
    const innerRimR = 600;
    const outerRingR = 980;
    const midRingR = 860;

    ctx.save();
    ctx.translate(cx, cy);

    // 1. Concentric calibration circles
    // Outer boundary ring
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, outerRingR, 0, Math.PI * 2);
    ctx.stroke();

    // Secondary hairline outer ring
    ctx.strokeStyle = hairlineColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, outerRingR - 15, 0, Math.PI * 2);
    ctx.stroke();

    // Mid dashed guide ring
    ctx.strokeStyle = secondaryColor;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.arc(0, 0, midRingR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Secondary inner ring
    ctx.strokeStyle = hairlineColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 720, 0, Math.PI * 2);
    ctx.stroke();

    // Inner podium perimeter ring
    ctx.strokeStyle = secondaryColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, innerRimR, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Degree ticks & Cardinal markers
    // Note: Texture mapping with rotateX(-Math.PI/2):
    // In texture plane:
    // angle 0 is +X (East, right)
    // angle -PI/2 (top, -Y in 2D) maps to -Z in 3D (Forward, North)
    // angle +PI/2 (bottom, +Y in 2D) maps to +Z in 3D (Aft, South)
    // angle PI (left, -X in 2D) maps to -X in 3D (Left, West)
    const totalTicks = 360;
    for (let deg = 0; deg < totalTicks; deg += 2) {
      const rad = (deg * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);

      let tickLen = 14;
      let tickWidth = 1.5;
      let tickColor = hairlineColor;

      if (deg % 30 === 0) {
        tickLen = 42;
        tickWidth = 3.5;
        tickColor = primaryColor;
      } else if (deg % 10 === 0) {
        tickLen = 26;
        tickWidth = 2.5;
        tickColor = secondaryColor;
      } else if (deg % 5 === 0) {
        tickLen = 18;
        tickWidth = 2;
        tickColor = secondaryColor;
      }

      ctx.strokeStyle = tickColor;
      ctx.lineWidth = tickWidth;
      ctx.beginPath();
      ctx.moveTo(cos * (outerRingR - tickLen), sin * (outerRingR - tickLen));
      ctx.lineTo(cos * outerRingR, sin * outerRingR);
      ctx.stroke();

      // Inner tick marks near podium rim
      if (deg % 15 === 0) {
        ctx.beginPath();
        ctx.moveTo(cos * innerRimR, sin * innerRimR);
        ctx.lineTo(cos * (innerRimR + (deg % 30 === 0 ? 25 : 15)), sin * (innerRimR + (deg % 30 === 0 ? 25 : 15)));
        ctx.stroke();
      }
    }

    // 3. Degree Numerals every 30 degrees
    ctx.font = '600 24px "Space Mono", "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let deg = 0; deg < 360; deg += 30) {
      // Offset so 0°/North is at top (-Y in 2D, which maps to -Z in 3D)
      const rad = (deg * Math.PI) / 180 - Math.PI / 2;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);

      const rLabel = 810;
      const lx = cos * rLabel;
      const ly = sin * rLabel;

      ctx.save();
      ctx.translate(lx, ly);
      // Orient text radially so it reads cleanly from above
      ctx.rotate(rad + Math.PI / 2);

      const degStr = String(deg).padStart(3, '0') + '°';
      ctx.fillStyle = (deg % 90 === 0) ? accentColor : subtleTextColor;
      ctx.font = (deg % 90 === 0)
        ? '700 28px "Space Mono", "JetBrains Mono", monospace'
        : '600 22px "Space Mono", "JetBrains Mono", monospace';
      ctx.fillText(degStr, 0, 0);
      ctx.restore();
    }

    // 4. Prominent Cardinal Markers (N, E, S, W)
    const cardinals = [
      { label: 'N', deg: 0, rad: -Math.PI / 2 },
      { label: 'E', deg: 90, rad: 0 },
      { label: 'S', deg: 180, rad: Math.PI / 2 },
      { label: 'W', deg: 270, rad: Math.PI }
    ];

    cardinals.forEach(({ label, rad }) => {
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const badgeR = 905;
      const bx = cos * badgeR;
      const by = sin * badgeR;

      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(rad + Math.PI / 2);

      // Badge outline box
      ctx.fillStyle = isDark ? 'rgba(6, 11, 10, 0.85)' : 'rgba(213, 206, 193, 0.85)';
      ctx.strokeStyle = (label === 'N') ? accentColor : primaryColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-30, -22, 60, 44, 4);
      ctx.fill();
      ctx.stroke();

      // Cardinal letter
      ctx.fillStyle = (label === 'N') ? accentColor : textColor;
      ctx.font = '800 32px "Space Mono", "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, 0, 1);

      // Special North arrow / chevron indicator pointing forward
      if (label === 'N') {
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.moveTo(0, -32);
        ctx.lineTo(-12, -22);
        ctx.lineTo(12, -22);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    });

    // 5. Technical Reticule Microcopy along arcs
    const drawArcText = (text: string, radius: number, startAngle: number, clockwise: boolean = true) => {
      ctx.save();
      ctx.font = '600 16px "Space Mono", "JetBrains Mono", monospace';
      ctx.fillStyle = subtleTextColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const letters = text.split('');
      const charSpacing = 0.022; // radians per character
      const totalArc = letters.length * charSpacing;
      let currAngle = startAngle - totalArc / 2;

      for (let i = 0; i < letters.length; i++) {
        const char = letters[i];
        const a = currAngle + i * charSpacing;
        const x = Math.cos(a) * radius;
        const y = Math.sin(a) * radius;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(a + (clockwise ? Math.PI / 2 : -Math.PI / 2));
        ctx.fillText(char, 0, 0);
        ctx.restore();
      }
      ctx.restore();
    };

    // Arcs in the 4 quadrants
    drawArcText('AESHNA MACHINA // SPECIMEN AZIMUTH DATUM', 660, -Math.PI * 0.75);
    drawArcText('BASE DIA: 206mm // TI-6AL-4V TURNTABLE', 660, -Math.PI * 0.25);
    drawArcText('AXIS: Y-UP // MK.VI BIONIC HORIZON', 660, Math.PI * 0.25);
    drawArcText('CALIBRATION: 360° PRECISION BEARING', 660, Math.PI * 0.75);

    // 6. Crosshair ticks along cardinal axes
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;
    [ -Math.PI / 2, 0, Math.PI / 2, Math.PI ].forEach((rad) => {
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      ctx.beginPath();
      ctx.moveTo(cos * (outerRingR + 4), sin * (outerRingR + 4));
      ctx.lineTo(cos * (outerRingR + 24), sin * (outerRingR + 24));
      ctx.stroke();
    });

    ctx.restore();
  }

  public dispose() {
    this.geometry.dispose?.();
    this.material.dispose?.();
    this.texture.dispose?.();
  }

  private get geometry(): THREE.BufferGeometry {
    return this.mesh.geometry;
  }
}
