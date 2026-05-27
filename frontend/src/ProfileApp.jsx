// ProfileApp.jsx — Behance-inspired light colorful portfolio (test at /profile)
// Self-contained: all colors explicit, no CSS var dependencies.

import { useState, useEffect, useRef } from "react";
import { useProfile } from "./hooks/useProfile";
import { computeGallery, galleryUrl, galleryCaption } from "./lib/gallery";
import Lightbox from "./components/portfolio/Lightbox";
import JDMatchBanner from "./components/portfolio/JDMatchBanner";
import { ChatPopup, FloatingButton } from "./components/portfolio/ChatPopup";
import ResumePopup from "./components/portfolio/ResumePopup";

// ── Global styles injected once ────────────────────────────────────────────────
const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Syne', sans-serif; background: #fafaf8; color: #111; -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 3px; }

  @keyframes spin       { to { transform: rotate(360deg); } }
  @keyframes gradFlow   { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
  @keyframes floatY     { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
  @keyframes floatYBadge{ 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
  @keyframes scrollCue  { 0%,100% { transform: translateX(-50%) translateY(0); opacity:.4; } 50% { transform: translateX(-50%) translateY(7px); opacity:.9; } }
  @keyframes fadeUp     { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:none; } }

  .p-proj-grid { display:grid; grid-template-columns:1fr; gap:18px; }
  @media(min-width:600px) { .p-proj-grid { grid-template-columns:1fr 1fr; } }
  @media(min-width:960px) { .p-proj-grid { grid-template-columns:1fr 1fr 1fr; } }

  .p-gal-grid  { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; }
  @media(min-width:480px) { .p-gal-grid { grid-template-columns:repeat(3,1fr); } }
  @media(min-width:768px) { .p-gal-grid { grid-template-columns:repeat(4,1fr); } }
  @media(min-width:1100px){ .p-gal-grid { grid-template-columns:repeat(5,1fr); } }

  .p-hero-links { display:flex; gap:8px; flex-wrap:wrap; justify-content:center; }
  @media(max-width:480px) { .p-hero-links a, .p-hero-links button { font-size:11px !important; padding:5px 12px !important; } }
`;

// ── Color palette per skill group ──────────────────────────────────────────────
const PAL = [
  { bg: "#EEF2FF", fg: "#4338CA", bd: "#C7D2FE" },
  { bg: "#FFF7ED", fg: "#C2410C", bd: "#FED7AA" },
  { bg: "#F0FDF4", fg: "#15803D", bd: "#BBF7D0" },
  { bg: "#FDF4FF", fg: "#7E22CE", bd: "#E9D5FF" },
  { bg: "#EFF6FF", fg: "#1D4ED8", bd: "#BFDBFE" },
  { bg: "#FFFBEB", fg: "#B45309", bd: "#FDE68A" },
  { bg: "#FFF1F2", fg: "#BE123C", bd: "#FECDD3" },
];

// Section accent colors
const ACCENTS = {
  about:           "#4F46E5",
  skills:          "#D97706",
  experience:      "#059669",
  education:       "#7C3AED",
  projects:        "#2563EB",
  certifications:  "#B45309",
  gallery:         "#374151",
};

// ── Scroll-reveal hook ─────────────────────────────────────────────────────────
function useReveal(delay = 0) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return {
    ref,
    style: {
      opacity: vis ? 1 : 0,
      transform: vis ? "none" : "translateY(30px)",
      transition: `opacity .65s ease ${delay}ms, transform .65s ease ${delay}ms`,
    },
  };
}

// ── Section heading ────────────────────────────────────────────────────────────
function Heading({ label, accent }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <p style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700, color: accent, fontFamily: "'DM Mono', monospace", marginBottom: 8 }}>
        — {label} —
      </p>
      <div style={{ width: 36, height: 3, borderRadius: 2, background: accent, opacity: 0.4 }} />
    </div>
  );
}

// ── Full-width section wrapper with reveal ─────────────────────────────────────
function FullSection({ id, bg, children, pt = 80, pb = 80 }) {
  const reveal = useReveal();
  return (
    <section id={id} style={{ background: bg, padding: `${pt}px 24px ${pb}px` }}>
      <div ref={reveal.ref} style={{ maxWidth: 1100, margin: "0 auto", ...reveal.style }}>
        {children}
      </div>
    </section>
  );
}

// ── Sticky nav ─────────────────────────────────────────────────────────────────
function StickyNav({ items, active }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const h = () => setShow(window.scrollY > 70);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 500,
      background: "rgba(255,255,255,0.88)", backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      borderBottom: "1px solid rgba(0,0,0,0.06)",
      height: 52, display: "flex", alignItems: "center",
      padding: "0 20px", justifyContent: "space-between",
      transform: show ? "translateY(0)" : "translateY(-100%)",
      transition: "transform .3s ease",
      boxShadow: "0 1px 20px rgba(0,0,0,0.05)",
    }}>
      <div style={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap", flex: 1 }}>
        {items.map(({ id, label, accent }) => (
          <button key={id} onClick={() => go(id)} style={{
            fontSize: 12, fontWeight: active === id ? 600 : 400,
            color: active === id ? accent : "#666",
            background: active === id ? `${accent}18` : "none",
            border: "none", borderRadius: 6, padding: "5px 12px",
            cursor: "pointer", fontFamily: "'Syne', sans-serif",
            transition: "all .2s",
          }}>
            {label}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
        <a href="/" style={{ fontSize: 11, color: "#aaa", textDecoration: "none", padding: "4px 10px", border: "1px solid #eee", borderRadius: 6, fontFamily: "'DM Mono', monospace" }}>← Main</a>
        <a href="/admin" style={{ fontSize: 11, color: "#aaa", textDecoration: "none", padding: "4px 10px", border: "1px solid #eee", borderRadius: 6, fontFamily: "'DM Mono', monospace" }}>⚙</a>
      </div>
    </nav>
  );
}

// ── Certification helpers (inlined — no Section/Card deps) ─────────────────────
function isCertExpired(dateStr) {
  if (!dateStr) return false;
  const m = dateStr.match(/Expires?\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/i);
  if (!m) return false;
  const months = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
  const now = new Date();
  const ey = parseInt(m[2]), em = months[m[1]];
  return ey < now.getFullYear() || (ey === now.getFullYear() && em < now.getMonth());
}

function CertList({ certifications, t }) {
  const [expanded, setExpanded] = useState(false);
  const sorted = [...certifications].sort((a, b) => {
    const yr = s => parseInt((s||"").match(/\d{4}/)?.[0]||"0");
    const mo = s => { const M={Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12}; return M[(s||"").match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/)?.[0]]||0; };
    return (yr(b.date)-yr(a.date)) || (mo(b.date)-mo(a.date));
  });
  const visible = expanded ? sorted : sorted.slice(0, 5);
  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {visible.map((cert, i) => {
          const expired = isCertExpired(cert.date);
          return (
            <div key={i} style={{
              background: expired ? "#fff5f5" : "#fff",
              border: `1px solid ${expired ? "#fecaca" : "#fde68a"}`,
              borderRadius: 16, padding: "18px 20px",
              display: "flex", gap: 16, alignItems: "flex-start",
              boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
              transition: "all .25s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(180,83,9,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.04)"; }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: expired ? "#fee2e2" : "#fef3c7", border: `1px solid ${expired ? "#fca5a5" : "#fde68a"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🎓</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 6 }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: expired ? "#991b1b" : (t.sectionCertifications || "#1a1a18") }}>{cert.name}</p>
                    <p style={{ fontSize: 12, color: "#B45309", fontFamily: "'DM Mono', monospace", marginTop: 2 }}>{cert.issuer}</p>
                  </div>
                  {cert.date && <span style={{ fontSize: 11, color: expired ? "#ef4444" : "#92400e", fontFamily: "'DM Mono', monospace", background: expired ? "#fee2e2" : "#fef3c7", border: `1px solid ${expired ? "#fca5a5" : "#fde68a"}`, borderRadius: 6, padding: "2px 8px", flexShrink: 0 }}>{cert.date}</span>}
                </div>
                {cert.credentialId && <p style={{ fontSize: 12, color: "#92400e", marginTop: 4 }}>ID: {cert.credentialId}</p>}
                {cert.link && <a href={cert.link} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#B45309", marginTop: 6, display: "inline-block", fontWeight: 500 }}>Show credential →</a>}
              </div>
            </div>
          );
        })}
      </div>
      {sorted.length > 5 && (
        <button onClick={() => setExpanded(p => !p)} style={{
          width: "100%", marginTop: 14, padding: "11px",
          borderRadius: 12, border: "1px solid #fde68a",
          background: "#fffbeb", color: "#B45309", fontSize: 13,
          cursor: "pointer", fontFamily: "'Syne', sans-serif", fontWeight: 500,
          transition: "all .2s",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "#B45309"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#fffbeb"; e.currentTarget.style.color = "#B45309"; }}>
          {expanded ? "↑ Show less" : `↓ Show all ${sorted.length} certifications`}
        </button>
      )}
    </div>
  );
}

// ── Main ProfileApp ────────────────────────────────────────────────────────────
export default function ProfileApp() {
  const profile = useProfile();
  const [chatOpen, setChatOpen] = useState(false);
  const [lbIdx, setLbIdx]       = useState(null);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [hasResume, setHasResume]   = useState(false);
  const [active, setActive]         = useState("");

  useEffect(() => {
    fetch("/api/resume/exists").then(r => r.json()).then(d => setHasResume(d.exists)).catch(() => {});
  }, []);

  // Track active section for nav highlight
  useEffect(() => {
    const ids = ["about","skills","experience","education","projects","certifications","gallery"];
    const h = () => {
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= 70 && r.bottom > 70) { setActive(id); break; }
      }
    };
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  if (!profile) return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid #6366f1", borderTopColor: "transparent", animation: "spin .8s linear infinite" }} />
      </div>
    </>
  );

  const t = profile.theme || {};
  const { groups: galleryGroups, flat: sortedGallery } = computeGallery(profile.gallery || []);

  const navItems = [
    profile.about                                                    && { id: "about",          label: "About",          accent: ACCENTS.about },
    profile.skills?.length > 0                                       && { id: "skills",         label: "Skills",         accent: ACCENTS.skills },
    profile.experiences?.length > 0                                  && { id: "experience",     label: "Experience",     accent: ACCENTS.experience },
    profile.educations?.length > 0                                   && { id: "education",      label: "Education",      accent: ACCENTS.education },
    profile.projects?.length > 0                                     && { id: "projects",       label: "Projects",       accent: ACCENTS.projects },
    profile.certifications?.length > 0                               && { id: "certifications", label: "Certifications", accent: ACCENTS.certifications },
    sortedGallery.length > 0 && profile.galleryVisible !== false     && { id: "gallery",        label: "Gallery",        accent: ACCENTS.gallery },
  ].filter(Boolean);

  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  // Link button base style
  const lnk = {
    fontSize: 12, color: "#555", background: "#fff",
    border: "1px solid #e5e5e5", borderRadius: 20, padding: "6px 16px",
    textDecoration: "none", fontFamily: "'DM Mono', monospace",
    display: "inline-flex", alignItems: "center", gap: 5,
    transition: "all .2s", cursor: "pointer",
  };
  const hov = (e, on) => {
    e.currentTarget.style.borderColor = on ? "#6366f1" : "#e5e5e5";
    e.currentTarget.style.color       = on ? "#6366f1" : "#555";
    e.currentTarget.style.boxShadow   = on ? "0 4px 14px rgba(99,102,241,.2)" : "";
    e.currentTarget.style.transform   = on ? "translateY(-1px)" : "";
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <StickyNav items={navItems} active={active} />

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #fafaf8 0%, #eff0ff 45%, #faf0ff 100%)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "100px 24px 80px",
        textAlign: "center", position: "relative",
      }}>
        {/* Animated gradient avatar ring */}
        <div style={{
          width: 188, height: 188, borderRadius: "50%", padding: 4,
          background: "linear-gradient(135deg,#6366f1,#a855f7,#06b6d4,#10b981)",
          backgroundSize: "300% 300%",
          animation: "gradFlow 3s ease infinite, floatY 5s ease-in-out infinite",
          marginBottom: 28, flexShrink: 0,
        }}>
          <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", background: "#f4f4f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {profile.avatar
              ? <img src={profile.avatar} alt={profile.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span style={{ fontSize: 38, fontWeight: 700, color: "#6366f1", fontFamily: "'Syne',sans-serif" }}>
                  {profile.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                </span>
            }
          </div>
        </div>

        {/* Name with animated gradient */}
        <h1 style={{
          fontSize: "clamp(2.4rem,5vw,4rem)",
          fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1,
          background: "linear-gradient(135deg,#6366f1 0%,#a855f7 40%,#06b6d4 75%,#10b981 100%)",
          backgroundSize: "200% 200%",
          animation: "gradFlow 5s ease infinite",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          fontFamily: "'Syne',sans-serif",
          marginBottom: 10,
        }}>
          {profile.name}
        </h1>

        {/* Title */}
        <p style={{ fontSize: 14, fontFamily: "'DM Mono',monospace", letterSpacing: "0.08em", color: "#6366f1", marginBottom: 8, animation: "fadeUp .6s ease .15s both" }}>
          {profile.title}
        </p>

        {/* Location */}
        <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 22, animation: "fadeUp .6s ease .25s both" }}>
          📍 {profile.location}
        </p>

        {/* Open to Work badge */}
        {profile.openToWork && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 12, fontWeight: 600, letterSpacing: "0.05em",
            color: t.openToWorkText || "#fff",
            background: t.openToWorkBg || "#10b981",
            border: `1px solid ${t.openToWorkBorder || "rgba(255,255,255,0.25)"}`,
            borderRadius: 20, padding: "6px 18px", marginBottom: 22,
            boxShadow: "0 4px 20px rgba(16,185,129,.35)",
            animation: "floatYBadge 3s ease-in-out infinite, fadeUp .6s ease .35s both",
          }}>✦ Open to Work</div>
        )}

        {/* Social links */}
        <div className="p-hero-links" style={{ marginBottom: 44, animation: "fadeUp .6s ease .45s both" }}>
          {profile.phone    && <a href={`tel:${profile.phone}`}              style={lnk} onMouseEnter={e=>hov(e,true)} onMouseLeave={e=>hov(e,false)}>📞 {profile.phone}</a>}
          {profile.email    && <a href={`mailto:${profile.email}`}           style={lnk} onMouseEnter={e=>hov(e,true)} onMouseLeave={e=>hov(e,false)}>✉ Email</a>}
          {profile.github   && <a href={profile.github}   target="_blank" rel="noreferrer" style={lnk} onMouseEnter={e=>hov(e,true)} onMouseLeave={e=>hov(e,false)}>⌥ GitHub</a>}
          {profile.gitlab   && <a href={profile.gitlab}   target="_blank" rel="noreferrer" style={lnk} onMouseEnter={e=>hov(e,true)} onMouseLeave={e=>hov(e,false)}>⌦ GitLab</a>}
          {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noreferrer" style={lnk} onMouseEnter={e=>hov(e,true)} onMouseLeave={e=>hov(e,false)}>in LinkedIn</a>}
          {hasResume && profile.resumeVisible !== false && (
            <button onClick={() => setResumeOpen(true)} style={{ ...lnk, border: "1px solid #6366f1", color: "#6366f1", background: "#EEF2FF" }}
              onMouseEnter={e => { e.currentTarget.style.background="#6366f1"; e.currentTarget.style.color="#fff"; e.currentTarget.style.boxShadow="0 4px 16px rgba(99,102,241,.35)"; }}
              onMouseLeave={e => { e.currentTarget.style.background="#EEF2FF"; e.currentTarget.style.color="#6366f1"; e.currentTarget.style.boxShadow=""; }}>
              ↓ Resume
            </button>
          )}
        </div>

        {/* Section dot navigation */}
        <div style={{ display: "flex", gap: 8, marginBottom: 40, animation: "fadeUp .6s ease .55s both" }}>
          {navItems.map(({ id, accent }) => (
            <button key={id} onClick={() => go(id)} style={{
              width: 8, height: 8, borderRadius: "50%", background: accent,
              border: "none", cursor: "pointer", padding: 0, opacity: .4,
              transition: "all .2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.opacity="1"; e.currentTarget.style.transform="scale(1.7)"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity=".4"; e.currentTarget.style.transform=""; }}
            />
          ))}
        </div>

        {/* Scroll cue */}
        <div style={{ position: "absolute", bottom: 28, left: "50%", fontSize: 20, color: "#bbb", animation: "scrollCue 2s ease-in-out infinite" }}>↓</div>
      </section>

      {/* ── JD MATCH BANNER ─────────────────────────────────────────────── */}
      <section style={{ background: "#fff", padding: "48px 24px", borderTop: "1px solid #f0f0ee", borderBottom: "1px solid #f0f0ee" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          {/* Override dark CSS vars so JDMatchBanner renders in light theme */}
          <div style={{
            "--bg-card": "#fff", "--bg-surface": "#f8f9fa",
            "--border": "rgba(0,0,0,0.09)", "--border-hover": "rgba(0,0,0,0.16)",
            "--text": "#111", "--text-muted": "#6b7280",
            "--accent": "#6366f1", "--accent-border": "rgba(99,102,241,.3)",
            "--font-mono": "'DM Mono',monospace", "--font-display": "'Syne',sans-serif",
          }}>
            <JDMatchBanner theme={{
              ...t,
              bannerBg:      "#fff",
              bannerBorder:  "#e5e7eb",
              bannerLabel:   "#6366f1",
              bannerTitle:   "#111",
              bannerText:    "#6b7280",
              bannerBtnText: "#6366f1",
            }} />
          </div>
        </div>
      </section>

      {/* ── ABOUT ───────────────────────────────────────────────────────── */}
      {profile.about && (
        <FullSection id="about" bg="#fff">
          <Heading label="About" accent={t.labelAbout || ACCENTS.about} />
          <p style={{ fontSize: "clamp(.95rem,2vw,1.05rem)", color: "#374151", lineHeight: 1.95, whiteSpace: "pre-wrap", maxWidth: 780 }}>
            {profile.about}
          </p>
        </FullSection>
      )}

      {/* ── SKILLS ──────────────────────────────────────────────────────── */}
      {profile.skills?.length > 0 && (
        <FullSection id="skills" bg="#fafaf8">
          <Heading label="Skills" accent={t.labelSkills || ACCENTS.skills} />
          {profile.skills[0]?.group !== undefined ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              {profile.skills.map((grp, gi) => {
                const p = PAL[gi % PAL.length];
                return (
                  <div key={gi}>
                    <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: p.fg, marginBottom: 12 }}>{grp.group}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {(grp.items || []).map((s, si) => (
                        <span key={si} style={{ fontSize: 12, fontFamily: "'DM Mono',monospace", color: p.fg, background: p.bg, border: `1px solid ${p.bd}`, borderRadius: 20, padding: "5px 14px", transition: "all .2s", cursor: "default" }}
                          onMouseEnter={e => { e.currentTarget.style.background=p.fg; e.currentTarget.style.color="#fff"; e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 4px 14px ${p.fg}50`; }}
                          onMouseLeave={e => { e.currentTarget.style.background=p.bg; e.currentTarget.style.color=p.fg; e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {profile.skills.map((s, i) => {
                const p = PAL[i % PAL.length];
                return <span key={i} style={{ fontSize: 12, fontFamily: "'DM Mono',monospace", color: p.fg, background: p.bg, border: `1px solid ${p.bd}`, borderRadius: 20, padding: "5px 14px" }}>{s}</span>;
              })}
            </div>
          )}
        </FullSection>
      )}

      {/* ── EXPERIENCE ──────────────────────────────────────────────────── */}
      {profile.experiences?.length > 0 && (
        <FullSection id="experience" bg="#fff">
          <Heading label="Experience" accent={t.labelExperience || ACCENTS.experience} />
          <div style={{ position: "relative", paddingLeft: 28 }}>
            {/* Timeline vertical line */}
            <div style={{ position: "absolute", left: 6, top: 8, bottom: 8, width: 2, background: "linear-gradient(to bottom,#6366f1,#10b981)", borderRadius: 1, opacity: .5 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              {profile.experiences.map((exp, i) => {
                const p = PAL[i % PAL.length];
                return (
                  <div key={i} style={{ position: "relative" }}>
                    {/* Dot */}
                    <div style={{ position: "absolute", left: -31, top: 22, width: 14, height: 14, borderRadius: "50%", background: p.fg, border: "3px solid #fff", boxShadow: `0 0 0 3px ${p.fg}40` }} />
                    <div style={{ background: "#fff", borderRadius: 16, padding: "20px 22px", border: "1px solid #d1fae5", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", transition: "all .25s" }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow="0 10px 30px rgba(5,150,105,.14)"; e.currentTarget.style.transform="translateX(6px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow="0 2px 10px rgba(0,0,0,0.05)"; e.currentTarget.style.transform=""; }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                        <div>
                          <p style={{ fontSize: 15, fontWeight: 600, color: "#064e3b" }}>{exp.role}</p>
                          <p style={{ fontSize: 13, color: "#059669", fontFamily: "'DM Mono',monospace", marginTop: 2 }}>{exp.company}</p>
                        </div>
                        <span style={{ fontSize: 11, color: "#6b7280", fontFamily: "'DM Mono',monospace", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "3px 10px", flexShrink: 0 }}>{exp.period}</span>
                      </div>
                      {exp.description && <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.75 }}>{exp.description}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </FullSection>
      )}

      {/* ── EDUCATION ───────────────────────────────────────────────────── */}
      {profile.educations?.length > 0 && (
        <FullSection id="education" bg="#fafaf8">
          <Heading label="Education" accent={t.labelEducation || ACCENTS.education} />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {profile.educations.map((edu, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "20px 22px", border: "1px solid #e9d5ff", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, transition: "all .25s" }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow="0 10px 28px rgba(124,58,237,.14)"; e.currentTarget.style.transform="translateY(-3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow="0 2px 10px rgba(0,0,0,0.05)"; e.currentTarget.style.transform=""; }}>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "#581c87" }}>{edu.school}</p>
                  <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>{edu.degree}</p>
                </div>
                <span style={{ fontSize: 11, color: "#7c3aed", fontFamily: "'DM Mono',monospace", background: "#fdf4ff", border: "1px solid #e9d5ff", borderRadius: 8, padding: "3px 10px", flexShrink: 0 }}>{edu.period}</span>
              </div>
            ))}
          </div>
        </FullSection>
      )}

      {/* ── PROJECTS ────────────────────────────────────────────────────── */}
      {profile.projects?.length > 0 && (
        <FullSection id="projects" bg="#fff">
          <Heading label="Projects" accent={t.labelProjects || ACCENTS.projects} />
          <div className="p-proj-grid">
            {profile.projects.map((p, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 18, padding: "22px 20px", border: "1px solid #bfdbfe", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", transition: "all .25s", display: "flex", flexDirection: "column" }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow="0 16px 40px rgba(37,99,235,.16)"; e.currentTarget.style.transform="translateY(-6px)"; e.currentTarget.style.borderColor="#93c5fd"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow="0 2px 10px rgba(0,0,0,0.05)"; e.currentTarget.style.transform=""; e.currentTarget.style.borderColor="#bfdbfe"; }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#1e3a8a", flex: 1, marginRight: 8 }}>{p.title}</p>
                  {p.tag && <span style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: "#2563eb", background: "#dbeafe", border: "1px solid #bfdbfe", borderRadius: 6, padding: "2px 8px", flexShrink: 0 }}>{p.tag}</span>}
                </div>
                <p style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.7, flex: 1 }}>{p.description}</p>
                {p.link && <a href={p.link} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#2563eb", marginTop: 14, display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none", fontWeight: 600 }}>View project →</a>}
              </div>
            ))}
          </div>
        </FullSection>
      )}

      {/* ── CERTIFICATIONS ──────────────────────────────────────────────── */}
      {profile.certifications?.length > 0 && (
        <FullSection id="certifications" bg="#fafaf8">
          <Heading label="Certifications" accent={t.labelCertifications || ACCENTS.certifications} />
          <CertList certifications={profile.certifications} t={t} />
        </FullSection>
      )}

      {/* ── GALLERY ─────────────────────────────────────────────────────── */}
      {sortedGallery.length > 0 && profile.galleryVisible !== false && (
        <FullSection id="gallery" bg="#fff">
          <Heading label="Gallery" accent={t.labelGallery || ACCENTS.gallery} />
          {galleryGroups.map(({ year, items }, gIdx) => (
            <div key={year ?? "noyear"} style={{ marginBottom: gIdx < galleryGroups.length - 1 ? 32 : 0 }}>
              {year && <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#9ca3af", letterSpacing: ".1em", marginBottom: 12 }}>{year}</p>}
              <div className="p-gal-grid">
                {items.map(item => {
                  const url = galleryUrl(item);
                  const cap = galleryCaption(item);
                  const fi  = sortedGallery.indexOf(item);
                  return (
                    <div key={fi} onClick={() => setLbIdx(fi)} style={{ cursor: "pointer" }}>
                      <div style={{ width: "100%", aspectRatio: "1", borderRadius: 12, overflow: "hidden", border: "1px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", transition: "all .25s" }}
                        onMouseEnter={e => { e.currentTarget.style.transform="scale(1.05)"; e.currentTarget.style.boxShadow="0 12px 28px rgba(0,0,0,0.16)"; }}
                        onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.07)"; }}>
                        <img src={url} alt={cap || `Gallery ${fi+1}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      </div>
                      <p style={{ fontSize: 10, color: "#9ca3af", marginTop: 5, textAlign: "center", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{cap}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </FullSection>
      )}

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer style={{ background: "#111", color: "#555", textAlign: "center", padding: "28px 24px", fontSize: 12, fontFamily: "'DM Mono',monospace" }}>
        {profile.name} · Built with ♥ using React &amp; FastAPI
      </footer>

      {/* ── Overlays ────────────────────────────────────────────────────── */}
      {resumeOpen  && <ResumePopup onClose={() => setResumeOpen(false)} />}
      {lbIdx !== null && <Lightbox images={sortedGallery} index={lbIdx} onClose={() => setLbIdx(null)} />}
      {chatOpen    && <ChatPopup onClose={() => setChatOpen(false)} />}
      <FloatingButton onClick={() => setChatOpen(p => !p)} isOpen={chatOpen} />
    </>
  );
}
