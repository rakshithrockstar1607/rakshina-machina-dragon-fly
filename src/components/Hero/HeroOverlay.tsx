import React from 'react';
import { ArrowDown } from 'lucide-react';

interface HeroOverlayProps {
  onScrollToAnatomy: () => void;
}

export const HeroOverlay: React.FC<HeroOverlayProps> = ({ onScrollToAnatomy }) => {
  return (
    <div className="hero-overlay-container pointer-events-none">
      {/* Left Column Rail: Header + Taxonomy */}
      <div className="hero-left-rail pointer-events-none">
        {/* Top Left Editorial Title Block */}
        <header className="hero-header pointer-events-auto">
          <div className="brand-badge">
            <span className="badge-dot" />
            <span className="badge-text">SPECIMEN LAB // STUDY 001 • MADE BY RAKSHITH</span>
          </div>

          <h1 className="hero-title">RAKSHINA MACHINA</h1>

          <div className="hero-subtitle-block">
            <h2 className="hero-subtitle">ARTIFICIAL ODONATA SPECIMEN</h2>
            <p className="hero-tagline">
              BIOMIMETIC FLIGHT SYSTEM / INTERACTIVE AEROSPACE ARCHITECTURE
            </p>
          </div>
        </header>

        {/* Scientific Classification Block */}
        <aside className="specimen-data-card pointer-events-auto">
          <div className="card-header">
            <span className="card-prefix">TAXONOMY // SYSTEM SPECIFICATION</span>
          </div>
          <div className="card-grid">
            <div className="card-row">
              <span className="row-key">CLASS</span>
              <span className="row-val">INSECTA</span>
            </div>
            <div className="card-row">
              <span className="row-key">ORDER</span>
              <span className="row-val">ODONATA</span>
            </div>
            <div className="card-row">
              <span className="row-key">GENUS</span>
              <span className="row-val">AESHNA</span>
            </div>
            <div className="card-row">
              <span className="row-key">SPECIMEN</span>
              <span className="row-val font-semibold">R. MACHINA</span>
            </div>
            <div className="card-row">
              <span className="row-key">CREATOR</span>
              <span className="row-val highlight-val font-semibold">MADE BY RAKSHITH</span>
            </div>
            <div className="card-separator" />
            <div className="card-row">
              <span className="row-key">SYSTEM</span>
              <span className="row-val highlight-val">BIOMIMETIC FLIGHT PLATFORM</span>
            </div>
            <div className="card-row">
              <span className="row-key">CARAPACE</span>
              <span className="row-val">CHAMPAGNE TITANIUM (TI-6AL-4V)</span>
            </div>
            <div className="card-row">
              <span className="row-key">OPTICS</span>
              <span className="row-val">28,400 EMERALD OMMATIDIA</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Bottom Section: Left Microcopy & Right Scroll Cue */}
      <div className="hero-bottom-bar pointer-events-none">
        {/* Bottom Left Minimal Microcopy */}
        <div className="hero-microcopy pointer-events-auto">
          <div className="microcopy-eyebrow">DESIGN ETHOS // MADE BY RAKSHITH</div>
          <div className="microcopy-main">
            NATURE<br />
            ENGINEERED<br />
            FURTHER.
          </div>
          <p className="microcopy-sub">
            A physical study in autonomous biomechanics, gyroscopic flight stabilization, and high-frequency stroke kinetics.
          </p>
        </div>

        {/* Bottom Right Scroll Down Action */}
        <div className="hero-scroll-cue pointer-events-auto">
          <button
            type="button"
            onClick={onScrollToAnatomy}
            className="scroll-cue-btn"
            aria-label="Scroll to Section 02 Anatomy and Technology"
          >
            <span className="scroll-cue-text">SECTION 02 // TECHNICAL ANATOMY</span>
            <ArrowDown size={14} className="scroll-cue-icon animate-bounce" />
          </button>
        </div>
      </div>
    </div>
  );
};
