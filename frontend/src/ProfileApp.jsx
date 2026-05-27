// ProfileApp.jsx — Template-inspired portfolio design (tienmai.space/profile)
// Visual style: dark hero, orange/coral accent, service cards, clean typography.
// Self-contained: all colors explicit, no CSS var dependencies.

import { useState, useEffect, useRef } from "react";
import { useProfile } from "./hooks/useProfile";
import { computeGallery, galleryUrl, galleryCaption } from "./lib/gallery";
import Lightbox from "./components/portfolio/Lightbox";
import JDMatchBanner from "./components/portfolio/JDMatchBanner";
import { ChatPopup, FloatingButton } from "./components/portfolio/ChatPopup";
import ResumePopup from "./components/portfolio/ResumePopup";

// ── Global styles ────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Syne', sans-serif; background: #f8f8f8; color: #111; -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 3px; }

  @keyframes spin        { to { transform: rotate(360deg); } }
  @keyframes fadeUp      { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:none; } }
  @keyframes floatY      { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
  @keyframes floatYBadge { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-5px); } }
  @keyframes scrollCue   { 0%,100% { transform:translateX(-50%) translateY(0); opacity:.3; } 50% { transform:translateX(-50%) translateY(7px); opacity:.8; } }
  @keyframes pulse       { 0%,100% { box-shadow:0 0 0 0 rgba(22,163,74,.4); } 70% { box-shadow:0 0 0 8px rgba(22,163,74,0); } }

  .p-hero-grid {
    display: grid; grid-template-columns: 1fr; gap: 48px; align-items: center;
  }
  @media(min-width: 768px) {
    .p-hero-grid { grid-template-columns: 1.15fr 0.85fr; }
  }

  .p-about-grid {
    display: grid; grid-template-columns: 1fr; gap: 32px;
  }
  @media(min-width: 768px) {
    .p-about-grid { grid-template-columns: 2fr 1fr; }
  }

  .p-service-grid {
    display: grid; grid-template-columns: 1fr; gap: 20px;
  }
  @media(min-width: 520px) { .p-service-grid { grid-template-columns: 1fr 1fr; } }
  @media(min-width: 960px) { .p-service-grid { grid-template-columns: 1fr 1fr 1fr; } }

  .p-proj-grid {
    display: grid; grid-template-columns: 1fr; gap: 20px;
  }
  @media(min-width: 600px) { .p-proj-grid { grid-template-columns: 1fr 1fr; } }
  @media(min-width: 960px) { .p-proj-grid { grid-template-columns: 1fr 1fr 1fr; } }

  .p-gal-grid {
    display: grid; grid-template-columns: repeat(2,1fr); gap: 12px;
  }
  @media(min-width: 480px)  { .p-gal-grid { grid-template-columns: repeat(3,1fr); } }
  @media(min-width: 768px)  { .p-gal-grid { grid-template-columns: repeat(4,1fr); } }
  @media(min-width: 1100px) { .p-gal-grid { grid-template-columns: repeat(5,1fr); } }

  .p-hero-links { display: flex; gap: 10px; flex-wrap: wrap; }
  @media(max-width: 480px) { .p-hero-links { justify-content: center; } }
`;

// ── Design tokens ────────────────────────────────────────────────────────────
const A  = "#ec563d";   // orange/coral accent
const AD = "#c94429";   // accent dark (hover)
const BG_DARK  = "#0f0f0f";
const BG_DARK2 = "#1a1a1a";

// Emoji icons for skill groups
const GROUP_ICONS = ["⚙️", "🖥️", "🗄️", "☁️", "🧰", "🔗", "🎨", "📱", "🔒", "📊"];

// ── Hooks ────────────────────────────────────────────────────────────────────
function useReveal(delay = 0) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVis(true); },
      { threshold: 0.07 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return {
    ref,
    style: {
      opacity:   vis ? 1 : 0,
      transform: vis ? "none" : "translateY(30px)",
      transition: `opacity .6s ease ${delay}ms, transform .6s ease ${delay}ms`,
    },
  };
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ text }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 10,
        fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase",
        fontFamily: "'DM Mono', monospace", fontWeight: 700, color: A,
      }}>
        <span style={{ width: 24, height: 2, background: A, display: "inline-block", flexShrink: 0 }} />
        {text}
      </span>
    </div>
  );
}

// ── Full-width section with reveal ────────────────────────────────────────────
function Sect({ id, bg = "#fff", children, pt = 88, pb = 88 }) {
  const r = useReveal();
  return (
    <section id={id} style={{ background: bg, padding: `${pt}px 24px ${pb}px` }}>
      <div ref={r.ref} style={{ maxWidth: 1100, margin: "0 auto", ...r.style }}>
        {children}
      </div>
    </section>
  );
}

// ── Sticky nav ────────────────────────────────────────────────────────────────
function StickyNav({ items, active }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const h = () => setShow(window.scrollY > 80);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const linkStyle = {
    fontSize: 11, color: "rgba(255,255,255,0.38)", textDecoration: "none",
    padding: "4px 10px", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 6, fontFamily: "'DM Mono', monospace", transition: "color .2s",
  };

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 500,
      background: "rgba(15,15,15,0.92)", backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      height: 54, display: "flex", alignItems: "center",
      padding: "0 24px", justifyContent: "space-between",
      transform: show ? "translateY(0)" : "translateY(-100%)",
      transition: "transform .3s ease",
    }}>
      <div style={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap", flex: 1 }}>
        {items.map(({ id, label }) => (
          <button key={id} onClick={() => go(id)} style={{
            fontSize: 11, fontWeight: active === id ? 700 : 400,
            letterSpacing: "0.1em", textTransform: "uppercase",
            color: active === id ? A : "rgba(255,255,255,0.45)",
            background: "none", border: "none",
            padding: "5px 12px", cursor: "pointer",
            fontFamily: "'DM Mono', monospace", transition: "color .2s",
          }}>
            {label}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
        <a href="/" style={linkStyle}
          onMouseEnter={e => { e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.38)"; }}>
          ← Main
        </a>
        <a href="/admin" style={linkStyle}
          onMouseEnter={e => { e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.38)"; }}>
          ⚙
        </a>
      </div>
    </nav>
  );
}

// ── Certification helpers ─────────────────────────────────────────────────────
function isCertExpired(dateStr) {
  if (!dateStr) return false;
  const m = dateStr.match(/Expires?\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/i);
  if (!m) return false;
  const months = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
  const now = new Date();
  const ey = parseInt(m[2]), em = months[m[1]];
  return ey < now.getFullYear() || (ey === now.getFullYear() && em < now.getMonth());
}

function CertList({ certifications }) {
  const [expanded, setExpanded] = useState(false);
  const sorted = [...certifications].sort((a, b) => {
    const yr = s => parseInt((s || "").match(/\d{4}/)?.[0] || "0");
    const mo = s => {
      const M = { Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12 };
      return M[(s || "").match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/)?.[0]] || 0;
    };
    return (yr(b.date) - yr(a.date)) || (mo(b.date) - mo(a.date));
  });
  const visible = expanded ? sorted : sorted.slice(0, 5);

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {visible.map((cert, i) => {
          const expired = isCertExpired(cert.date);
          return (
            <div key={i} style={{
              background: "#fff",
              border:     `1px solid ${expired ? "#fca5a5" : "#e5e7eb"}`,
              borderLeft: `4px solid ${expired ? "#ef4444" : A}`,
              borderRadius: 12, padding: "18px 20px",
              display: "flex", gap: 16, alignItems: "flex-start",
              transition: "transform .25s, box-shadow .25s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateX(4px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: expired ? "#fee2e2" : `${A}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🎓</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 6 }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: expired ? "#991b1b" : "#111" }}>{cert.name}</p>
                    <p style={{ fontSize: 12, color: A, fontFamily: "'DM Mono', monospace", marginTop: 2 }}>{cert.issuer}</p>
                  </div>
                  {cert.date && (
                    <span style={{ fontSize: 11, color: expired ? "#ef4444" : "#6b7280", fontFamily: "'DM Mono', monospace", background: expired ? "#fee2e2" : "#f3f4f6", borderRadius: 6, padding: "2px 8px", flexShrink: 0 }}>
                      {cert.date}
                    </span>
                  )}
                </div>
                {cert.credentialId && <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>ID: {cert.credentialId}</p>}
                {cert.link && (
                  <a href={cert.link} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: A, marginTop: 6, display: "inline-block", fontWeight: 500, textDecoration: "none" }}>
                    Show credential →
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {sorted.length > 5 && (
        <button onClick={() => setExpanded(p => !p)} style={{
          width: "100%", marginTop: 14, padding: "11px",
          borderRadius: 10, border: `2px solid ${A}`,
          background: "transparent", color: A, fontSize: 13,
          cursor: "pointer", fontFamily: "'Syne', sans-serif", fontWeight: 600,
          transition: "all .2s",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = A; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = A; }}>
          {expanded ? "↑ Show less" : `↓ Show all ${sorted.length} certifications`}
        </button>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ProfileApp() {
  const profile = useProfile();
  const [chatOpen,    setChatOpen]    = useState(false);
  const [lbIdx,       setLbIdx]       = useState(null);
  const [resumeOpen,  setResumeOpen]  = useState(false);
  const [hasResume,   setHasResume]   = useState(false);
  const [active,      setActive]      = useState("");

  useEffect(() => {
    fetch("/api/resume/exists").then(r => r.json()).then(d => setHasResume(d.exists)).catch(() => {});
  }, []);

  // Active section tracking for nav highlight
  useEffect(() => {
    const ids = ["about","skills","experience","education","projects","certifications","gallery"];
    const h = () => {
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= 60 && r.bottom > 60) { setActive(id); break; }
      }
    };
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  if (!profile) return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: BG_DARK }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", border: `3px solid ${A}`, borderTopColor: "transparent", animation: "spin .8s linear infinite" }} />
      </div>
    </>
  );

  const t = profile.theme || {};
  const { flat: sortedGallery, groups: galleryGroups } = computeGallery(profile.gallery || []);

  const navItems = [
    profile.about                                                && { id: "about",          label: "About" },
    profile.skills?.length > 0                                   && { id: "skills",         label: "Skills" },
    profile.experiences?.length > 0                              && { id: "experience",     label: "Experience" },
    profile.educations?.length > 0                               && { id: "education",      label: "Education" },
    profile.projects?.length > 0                                 && { id: "projects",       label: "Works" },
    profile.certifications?.length > 0                           && { id: "certifications", label: "Certs" },
    sortedGallery.length > 0 && profile.galleryVisible !== false && { id: "gallery",        label: "Gallery" },
  ].filter(Boolean);

  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  // Button styles
  const btnSolid = {
    display: "inline-flex", alignItems: "center", gap: 6,
    fontSize: 13, fontWeight: 700, color: "#fff",
    background: A, border: `2px solid ${A}`,
    borderRadius: 8, padding: "10px 22px",
    textDecoration: "none", cursor: "pointer",
    fontFamily: "'Syne', sans-serif",
    transition: "all .2s", letterSpacing: "0.02em",
  };
  const btnGhost = {
    display: "inline-flex", alignItems: "center", gap: 6,
    fontSize: 13, fontWeight: 700, color: "#fff",
    background: "transparent", border: "2px solid rgba(255,255,255,0.22)",
    borderRadius: 8, padding: "10px 22px",
    textDecoration: "none", cursor: "pointer",
    fontFamily: "'Syne', sans-serif",
    transition: "all .2s", letterSpacing: "0.02em",
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <StickyNav items={navItems} active={active} />

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section style={{
        minHeight: "100vh", background: BG_DARK,
        padding: "110px 24px 80px",
        display: "flex", alignItems: "center",
        position: "relative", overflow: "hidden",
      }}>
        {/* Decorative circles — template-style */}
        <div style={{ position: "absolute", right: -100, top: -100, width: 500, height: 500, borderRadius: "50%", background: `${A}10`, border: `1px solid ${A}20`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 80,  top: 60,   width: 220, height: 220, borderRadius: "50%", background: `${A}07`, border: `1px solid ${A}15`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: -60,  bottom: 60, width: 280, height: 280, borderRadius: "50%", background: `${A}06`, border: `1px solid ${A}12`, pointerEvents: "none" }} />

        <div className="p-hero-grid" style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>

          {/* ── Left: text ── */}
          <div style={{ animation: "fadeUp .7s ease both" }}>
            {/* Eyebrow label */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
              <div style={{ width: 28, height: 2, background: A, flexShrink: 0 }} />
              <span style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: A, fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>
                Portfolio
              </span>
            </div>

            {/* Name — template style: "I'm [Name]" */}
            <h1 style={{
              fontSize: "clamp(2.6rem, 5.5vw, 5rem)",
              fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05,
              color: "#fff", fontFamily: "'Syne', sans-serif", marginBottom: 18,
            }}>
              I'm{" "}
              <span style={{ color: A }}>{profile.name?.split(" ")[0]}</span>
              {profile.name?.split(" ").length > 1 && (
                <><br />{profile.name.split(" ").slice(1).join(" ")}</>
              )}
            </h1>

            {/* Title */}
            {profile.title && (
              <p style={{ fontSize: 14, fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em", color: "rgba(255,255,255,0.5)", marginBottom: 8, animation: "fadeUp .7s ease .12s both" }}>
                {profile.title}
              </p>
            )}

            {/* Location */}
            {profile.location && (
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 30, fontFamily: "'DM Mono', monospace", animation: "fadeUp .7s ease .22s both" }}>
                📍 {profile.location}
              </p>
            )}

            {/* Open to Work badge */}
            {profile.openToWork && (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                fontSize: 12, fontWeight: 600, letterSpacing: "0.05em",
                color: "#fff", background: "#16a34a",
                borderRadius: 8, padding: "7px 16px", marginBottom: 28,
                animation: "pulse 2.5s ease-in-out infinite",
              }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#86efac", display: "inline-block" }} />
                Open to Work
              </div>
            )}

            {/* CTA buttons */}
            <div className="p-hero-links" style={{ marginBottom: 32, animation: "fadeUp .7s ease .32s both" }}>
              {profile.email && (
                <a href={`mailto:${profile.email}`} style={btnSolid}
                  onMouseEnter={e => { e.currentTarget.style.background = AD; e.currentTarget.style.borderColor = AD; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 20px ${A}50`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = A; e.currentTarget.style.borderColor = A; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
                  ✉ Email Me
                </a>
              )}
              {hasResume && profile.resumeVisible !== false && (
                <button onClick={() => setResumeOpen(true)} style={btnGhost}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)"; e.currentTarget.style.background = "transparent"; }}>
                  ↓ Resume
                </button>
              )}
            </div>

            {/* Social links */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", animation: "fadeUp .7s ease .42s both" }}>
              {[
                profile.phone    && { href: `tel:${profile.phone}`,      label: `📞 ${profile.phone}` },
                profile.github   && { href: profile.github,   label: "GitHub",    target: "_blank" },
                profile.gitlab   && { href: profile.gitlab,   label: "GitLab",    target: "_blank" },
                profile.linkedin && { href: profile.linkedin, label: "LinkedIn",  target: "_blank" },
              ].filter(Boolean).map((lnk, i) => (
                <a key={i} href={lnk.href} target={lnk.target} rel={lnk.target ? "noreferrer" : undefined} style={{
                  fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none",
                  fontFamily: "'DM Mono', monospace", transition: "color .2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.color = A; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}>
                  {lnk.label}
                </a>
              ))}
            </div>

            {/* Section dot navigation */}
            <div style={{ display: "flex", gap: 8, marginTop: 48, animation: "fadeUp .7s ease .52s both" }}>
              {navItems.map(({ id }) => (
                <button key={id} onClick={() => go(id)} title={id} style={{
                  width: active === id ? 24 : 8, height: 8, borderRadius: 4,
                  background: active === id ? A : "rgba(255,255,255,0.18)",
                  border: "none", cursor: "pointer", padding: 0,
                  transition: "all .3s ease",
                }} />
              ))}
            </div>
          </div>

          {/* ── Right: avatar ── */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", animation: "fadeUp .7s ease .18s both" }}>
            <div style={{ position: "relative" }}>
              {/* Concentric decorative rings */}
              <div style={{ position: "absolute", inset: -14, borderRadius: "50%", border: `2px solid ${A}35`, animation: "floatY 5.5s ease-in-out infinite" }} />
              <div style={{ position: "absolute", inset: -28, borderRadius: "50%", border: `1px solid ${A}18`, animation: "floatY 5.5s ease-in-out infinite .4s" }} />

              {/* Photo circle */}
              <div style={{
                width: 280, height: 280, borderRadius: "50%",
                overflow: "hidden", border: `4px solid ${A}`,
                background: BG_DARK2, flexShrink: 0,
                animation: "floatY 5.5s ease-in-out infinite",
                boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px ${A}30`,
              }}>
                {profile.avatar
                  ? <img src={profile.avatar} alt={profile.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 72, fontWeight: 800, color: A, fontFamily: "'Syne', sans-serif" }}>
                        {profile.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                }
              </div>

              {/* Corner badge */}
              <div style={{
                position: "absolute", bottom: 14, right: -10,
                width: 50, height: 50, borderRadius: "50%",
                background: A, border: `4px solid ${BG_DARK}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
              }}>
                💼
              </div>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div style={{ position: "absolute", bottom: 28, left: "50%", fontSize: 22, color: "rgba(255,255,255,0.25)", animation: "scrollCue 2s ease-in-out infinite" }}>↓</div>
      </section>

      {/* ══ JD MATCH ════════════════════════════════════════════════════════ */}
      <section style={{ background: "#f3f4f6", padding: "52px 24px", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          {/* CSS var override so JDMatchBanner renders in light mode */}
          <div style={{
            "--bg-card": "#fff", "--bg-surface": "#f8f9fa",
            "--border": "rgba(0,0,0,0.09)", "--border-hover": "rgba(0,0,0,0.16)",
            "--text": "#111", "--text-muted": "#6b7280",
            "--accent": A, "--accent-border": `${A}40`,
            "--font-mono": "'DM Mono',monospace", "--font-display": "'Syne',sans-serif",
          }}>
            <JDMatchBanner theme={{
              ...t,
              bannerBg:      "#fff",
              bannerBorder:  "#e5e7eb",
              bannerLabel:   A,
              bannerTitle:   "#111",
              bannerText:    "#6b7280",
              bannerBtnText: A,
            }} />
          </div>
        </div>
      </section>

      {/* ══ ABOUT ══════════════════════════════════════════════════════════ */}
      {profile.about && (
        <Sect id="about" bg="#fff">
          <div className="p-about-grid">
            {/* Left: bio text */}
            <div>
              <SectionLabel text="About Me" />
              <p style={{ fontSize: "clamp(.95rem,2vw,1.05rem)", color: "#374151", lineHeight: 2.05, whiteSpace: "pre-wrap" }}>
                {profile.about}
              </p>
            </div>

            {/* Right: personal info card — orange bg, template-style */}
            <div style={{ background: A, borderRadius: 18, padding: "28px 24px", color: "#fff", alignSelf: "start" }}>
              <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 20, opacity: .75 }}>
                Personal Info
              </p>
              {[
                profile.name     && { label: "Name",     value: profile.name },
                profile.location && { label: "Location", value: `📍 ${profile.location}` },
                profile.title    && { label: "Role",     value: profile.title },
                profile.email    && { label: "Email",    value: profile.email, href: `mailto:${profile.email}` },
              ].filter(Boolean).map((item, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: 10, opacity: .65, fontFamily: "'DM Mono', monospace", marginBottom: 3, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    {item.label}
                  </p>
                  {item.href
                    ? <a href={item.href} style={{ fontSize: 13, color: "#fff", textDecoration: "none", fontWeight: 500 }}>{item.value}</a>
                    : <p style={{ fontSize: 13, fontWeight: 600 }}>{item.value}</p>
                  }
                </div>
              ))}

              {/* Social icon circles */}
              {(profile.github || profile.linkedin || profile.gitlab) && (
                <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
                  {[
                    profile.github   && { href: profile.github,   label: "⌥" },
                    profile.linkedin && { href: profile.linkedin, label: "in" },
                    profile.gitlab   && { href: profile.gitlab,   label: "⌦" },
                  ].filter(Boolean).map((s, i) => (
                    <a key={i} href={s.href} target="_blank" rel="noreferrer" style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: "rgba(255,255,255,0.15)", display: "flex",
                      alignItems: "center", justifyContent: "center",
                      color: "#fff", textDecoration: "none", fontSize: 13,
                      border: "1px solid rgba(255,255,255,0.25)",
                      transition: "background .2s",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.3)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}>
                      {s.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Sect>
      )}

      {/* ══ SKILLS — service cards (template "What I'm Doing" style) ════════ */}
      {profile.skills?.length > 0 && (
        <Sect id="skills" bg="#f8f8f8">
          <SectionLabel text="What I Do" />
          {profile.skills[0]?.group !== undefined ? (
            <div className="p-service-grid">
              {profile.skills.map((grp, gi) => (
                <div key={gi} style={{
                  background: "#fff", borderRadius: 16, padding: "28px 24px",
                  border: "1px solid #e5e7eb", transition: "all .25s",
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow   = `0 14px 36px ${A}1a`;
                    e.currentTarget.style.transform   = "translateY(-5px)";
                    e.currentTarget.style.borderColor = `${A}50`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow   = "";
                    e.currentTarget.style.transform   = "";
                    e.currentTarget.style.borderColor = "#e5e7eb";
                  }}>
                  {/* Icon circle — template style */}
                  <div style={{
                    width: 54, height: 54, borderRadius: "50%",
                    background: `${A}10`, border: `2px solid ${A}25`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, marginBottom: 18,
                  }}>
                    {GROUP_ICONS[gi % GROUP_ICONS.length]}
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 14, fontFamily: "'Syne', sans-serif" }}>
                    {grp.group}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {(grp.items || []).map((s, si) => (
                      <span key={si} style={{
                        fontSize: 11, fontFamily: "'DM Mono', monospace",
                        color: A, background: `${A}0d`,
                        border: `1px solid ${A}22`, borderRadius: 6, padding: "3px 10px",
                      }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Flat list fallback
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {profile.skills.map((s, i) => (
                <span key={i} style={{
                  fontSize: 12, fontFamily: "'DM Mono', monospace",
                  color: A, background: `${A}0d`, border: `1px solid ${A}22`,
                  borderRadius: 20, padding: "5px 14px", transition: "all .2s", cursor: "default",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = A; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${A}0d`; e.currentTarget.style.color = A; }}>
                  {s}
                </span>
              ))}
            </div>
          )}
        </Sect>
      )}

      {/* ══ EXPERIENCE ══════════════════════════════════════════════════════ */}
      {profile.experiences?.length > 0 && (
        <Sect id="experience" bg="#fff">
          <SectionLabel text="Experience" />
          <div style={{ position: "relative", paddingLeft: 28 }}>
            <div style={{ position: "absolute", left: 6, top: 8, bottom: 8, width: 2, background: `${A}28`, borderRadius: 1 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {profile.experiences.map((exp, i) => (
                <div key={i} style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: -31, top: 20, width: 14, height: 14, borderRadius: "50%", background: A, border: "3px solid #fff", boxShadow: `0 0 0 3px ${A}28` }} />
                  <div style={{
                    background: "#fff", borderRadius: 14, padding: "20px 22px",
                    border: "1px solid #e5e7eb", borderLeft: `4px solid ${A}`,
                    transition: "all .25s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 10px 28px ${A}1a`; e.currentTarget.style.transform = "translateX(6px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = ""; e.currentTarget.style.transform = ""; }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>{exp.role}</p>
                        <p style={{ fontSize: 13, color: A, fontFamily: "'DM Mono', monospace", marginTop: 2 }}>{exp.company}</p>
                      </div>
                      <span style={{ fontSize: 11, color: "#6b7280", fontFamily: "'DM Mono', monospace", background: "#f3f4f6", borderRadius: 8, padding: "3px 10px", flexShrink: 0 }}>
                        {exp.period}
                      </span>
                    </div>
                    {exp.description && <p style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.78 }}>{exp.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Sect>
      )}

      {/* ══ EDUCATION ═══════════════════════════════════════════════════════ */}
      {profile.educations?.length > 0 && (
        <Sect id="education" bg="#f8f8f8">
          <SectionLabel text="Education" />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {profile.educations.map((edu, i) => (
              <div key={i} style={{
                background: "#fff", borderRadius: 14, padding: "20px 22px",
                border: "1px solid #e5e7eb", borderLeft: `4px solid ${A}`,
                display: "flex", justifyContent: "space-between",
                alignItems: "flex-start", flexWrap: "wrap", gap: 10,
                transition: "all .25s",
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 10px 28px ${A}15`; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = ""; e.currentTarget.style.transform = ""; }}>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>{edu.school}</p>
                  <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>{edu.degree}</p>
                </div>
                <span style={{ fontSize: 11, color: A, fontFamily: "'DM Mono', monospace", background: `${A}0d`, border: `1px solid ${A}22`, borderRadius: 8, padding: "3px 10px", flexShrink: 0 }}>
                  {edu.period}
                </span>
              </div>
            ))}
          </div>
        </Sect>
      )}

      {/* ══ PROJECTS / MY WORKS ═════════════════════════════════════════════ */}
      {profile.projects?.length > 0 && (
        <Sect id="projects" bg="#fff">
          <SectionLabel text="My Works" />
          <div className="p-proj-grid">
            {profile.projects.map((p, i) => (
              <div key={i} style={{
                background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb",
                overflow: "hidden", transition: "all .25s", display: "flex", flexDirection: "column",
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 18px 44px ${A}1c`; e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.borderColor = `${A}45`; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = ""; e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = "#e5e7eb"; }}>
                {/* Accent top bar */}
                <div style={{ height: 4, background: A, flexShrink: 0 }} />
                <div style={{ padding: "20px 20px 22px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#111", flex: 1, marginRight: 8 }}>{p.title}</p>
                    {p.tag && (
                      <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: A, background: `${A}10`, border: `1px solid ${A}28`, borderRadius: 6, padding: "2px 8px", flexShrink: 0 }}>
                        {p.tag}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.72, flex: 1 }}>{p.description}</p>
                  {p.link && (
                    <a href={p.link} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: A, marginTop: 14, display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none", fontWeight: 600 }}>
                      View project →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Sect>
      )}

      {/* ══ CERTIFICATIONS ══════════════════════════════════════════════════ */}
      {profile.certifications?.length > 0 && (
        <Sect id="certifications" bg="#f8f8f8">
          <SectionLabel text="Certifications" />
          <CertList certifications={profile.certifications} />
        </Sect>
      )}

      {/* ══ GALLERY ═════════════════════════════════════════════════════════ */}
      {sortedGallery.length > 0 && profile.galleryVisible !== false && (
        <Sect id="gallery" bg="#fff">
          <SectionLabel text="Gallery" />
          {galleryGroups.map(({ year, items }, gIdx) => (
            <div key={year ?? "noyear"} style={{ marginBottom: gIdx < galleryGroups.length - 1 ? 32 : 0 }}>
              {year && (
                <p style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#9ca3af", letterSpacing: ".12em", marginBottom: 12 }}>
                  {year}
                </p>
              )}
              <div className="p-gal-grid">
                {items.map(item => {
                  const url = galleryUrl(item);
                  const cap = galleryCaption(item);
                  const fi  = sortedGallery.indexOf(item);
                  return (
                    <div key={fi} onClick={() => setLbIdx(fi)} style={{ cursor: "pointer" }}>
                      <div style={{ width: "100%", aspectRatio: "1", borderRadius: 10, overflow: "hidden", border: "1px solid #e5e7eb", transition: "all .25s" }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.boxShadow = `0 12px 28px ${A}25`; e.currentTarget.style.borderColor = `${A}55`; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = "#e5e7eb"; }}>
                        <img src={url} alt={cap || `Gallery ${fi + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      </div>
                      {cap && (
                        <p style={{ fontSize: 10, color: "#9ca3af", marginTop: 5, textAlign: "center", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                          {cap}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </Sect>
      )}

      {/* ══ FOOTER ══════════════════════════════════════════════════════════ */}
      <footer style={{ background: BG_DARK, padding: "60px 24px 44px", textAlign: "center" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 800, color: "#fff", fontFamily: "'Syne', sans-serif", marginBottom: 6 }}>
            {profile.name}
          </p>
          {profile.title && (
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Mono', monospace", marginBottom: 30 }}>
              {profile.title}
            </p>
          )}

          {/* Social icon circles — template footer style */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 36 }}>
            {[
              profile.github   && { href: profile.github,            label: "⌥", title: "GitHub" },
              profile.linkedin && { href: profile.linkedin,          label: "in", title: "LinkedIn" },
              profile.gitlab   && { href: profile.gitlab,            label: "⌦", title: "GitLab" },
              profile.email    && { href: `mailto:${profile.email}`, label: "✉", title: "Email" },
            ].filter(Boolean).map((s, i) => (
              <a key={i} href={s.href} target={s.href.startsWith("mailto") ? undefined : "_blank"} rel="noreferrer" title={s.title} style={{
                width: 42, height: 42, borderRadius: "50%",
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "rgba(255,255,255,0.45)", textDecoration: "none",
                fontSize: 14, transition: "all .2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = A; e.currentTarget.style.borderColor = A; e.currentTarget.style.color = "#fff"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; e.currentTarget.style.transform = ""; }}>
                {s.label}
              </a>
            ))}
          </div>

          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 24 }} />
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "'DM Mono', monospace" }}>
            Built with React &amp; FastAPI · tienmai.space
          </p>
        </div>
      </footer>

      {/* ══ Overlays ════════════════════════════════════════════════════════ */}
      {resumeOpen    && <ResumePopup onClose={() => setResumeOpen(false)} />}
      {lbIdx !== null && <Lightbox images={sortedGallery} index={lbIdx} onClose={() => setLbIdx(null)} />}
      {chatOpen      && <ChatPopup onClose={() => setChatOpen(false)} />}
      <FloatingButton onClick={() => setChatOpen(p => !p)} isOpen={chatOpen} />
    </>
  );
}
