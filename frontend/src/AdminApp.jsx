import { useState, useEffect, useRef } from "react";

const API = "";

const DISPLAY_FONTS = [
  { name: "Syne", label: "Syne", desc: "Current — bold & geometric" },
  { name: "Inter", label: "Inter", desc: "Clean & modern, great readability" },
  { name: "Plus Jakarta Sans", label: "Plus Jakarta Sans", desc: "Friendly & professional" },
  { name: "DM Sans", label: "DM Sans", desc: "Minimal & elegant" },
  { name: "Outfit", label: "Outfit", desc: "Contemporary & versatile" },
  { name: "Raleway", label: "Raleway", desc: "Stylish with elegant thin weights" },
  { name: "Poppins", label: "Poppins", desc: "Rounded & approachable" },
  { name: "Space Grotesk", label: "Space Grotesk", desc: "Technical & distinctive" },
];

const MONO_FONTS = [
  { name: "DM Mono", label: "DM Mono", desc: "Current — clean monospace" },
  { name: "JetBrains Mono", label: "JetBrains Mono", desc: "Developer favorite" },
  { name: "Fira Code", label: "Fira Code", desc: "With ligatures" },
  { name: "IBM Plex Mono", label: "IBM Plex Mono", desc: "Classic & readable" },
  { name: "Space Mono", label: "Space Mono", desc: "Quirky & distinctive" },
  { name: "Roboto Mono", label: "Roboto Mono", desc: "Neutral & familiar" },
];

const PRESETS = [
  { name: "Midnight Green", dark: true, theme: { bg: "#0a0a0b", bgSurface: "#111114", bgCard: "#16161a", accent: "#5dcaa5", text: "#f0efe8", textMuted: "#6b6a65", headingName: "#f0efe8", labelAbout: "#3a3a38", labelSkills: "#3a3a38", labelExperience: "#3a3a38", labelEducation: "#3a3a38", labelProjects: "#3a3a38", labelGallery: "#3a3a38", lineColor: "rgba(255,255,255,0.07)", sectionAbout: "#6b6a65", sectionSkills: "#6b6a65", sectionExperience: "#f0efe8", sectionEducation: "#f0efe8", sectionProjects: "#f0efe8", sectionGallery: "#f0efe8" } },
  { name: "Deep Blue", dark: true, theme: { bg: "#070b14", bgSurface: "#0d1526", bgCard: "#111d35", accent: "#60a5fa", text: "#e8edf5", textMuted: "#64748b", headingName: "#e8edf5", labelAbout: "#1e3a5f", labelSkills: "#1e3a5f", labelExperience: "#1e3a5f", labelEducation: "#1e3a5f", labelProjects: "#1e3a5f", labelGallery: "#1e3a5f", lineColor: "rgba(96,165,250,0.15)", sectionAbout: "#64748b", sectionSkills: "#64748b", sectionExperience: "#e8edf5", sectionEducation: "#e8edf5", sectionProjects: "#e8edf5", sectionGallery: "#e8edf5" } },
  { name: "Obsidian Purple", dark: true, theme: { bg: "#0c0a14", bgSurface: "#13101f", bgCard: "#1a1528", accent: "#a78bfa", text: "#ede9f5", textMuted: "#6d6880", headingName: "#ede9f5", labelAbout: "#2d2545", labelSkills: "#2d2545", labelExperience: "#2d2545", labelEducation: "#2d2545", labelProjects: "#2d2545", labelGallery: "#2d2545", lineColor: "rgba(167,139,250,0.15)", sectionAbout: "#6d6880", sectionSkills: "#6d6880", sectionExperience: "#ede9f5", sectionEducation: "#ede9f5", sectionProjects: "#ede9f5", sectionGallery: "#ede9f5" } },
  { name: "Carbon Rose", dark: true, theme: { bg: "#100a0a", bgSurface: "#1a1010", bgCard: "#221515", accent: "#f472b6", text: "#f5eded", textMuted: "#7a6060", headingName: "#f5eded", labelAbout: "#3d2020", labelSkills: "#3d2020", labelExperience: "#3d2020", labelEducation: "#3d2020", labelProjects: "#3d2020", labelGallery: "#3d2020", lineColor: "rgba(244,114,182,0.15)", sectionAbout: "#7a6060", sectionSkills: "#7a6060", sectionExperience: "#f5eded", sectionEducation: "#f5eded", sectionProjects: "#f5eded", sectionGallery: "#f5eded" } },
  { name: "Forest Dark", dark: true, theme: { bg: "#080e0a", bgSurface: "#0f1a11", bgCard: "#152118", accent: "#86efac", text: "#eaf3eb", textMuted: "#567060", headingName: "#eaf3eb", labelAbout: "#1a3020", labelSkills: "#1a3020", labelExperience: "#1a3020", labelEducation: "#1a3020", labelProjects: "#1a3020", labelGallery: "#1a3020", lineColor: "rgba(134,239,172,0.15)", sectionAbout: "#567060", sectionSkills: "#567060", sectionExperience: "#eaf3eb", sectionEducation: "#eaf3eb", sectionProjects: "#eaf3eb", sectionGallery: "#eaf3eb" } },
  { name: "Clean Light", dark: false, theme: { bg: "#ffffff", bgSurface: "#f8f9fa", bgCard: "#f1f3f5", accent: "#0ea5e9", text: "#1a1a2e", textMuted: "#64748b", headingName: "#1a1a2e", labelAbout: "#94a3b8", labelSkills: "#94a3b8", labelExperience: "#94a3b8", labelEducation: "#94a3b8", labelProjects: "#94a3b8", labelGallery: "#94a3b8", lineColor: "rgba(0,0,0,0.08)", sectionAbout: "#64748b", sectionSkills: "#1a1a2e", sectionExperience: "#1a1a2e", sectionEducation: "#1a1a2e", sectionProjects: "#1a1a2e", sectionGallery: "#1a1a2e" } },
  { name: "Warm Paper", dark: false, theme: { bg: "#faf7f2", bgSurface: "#f3ede3", bgCard: "#ebe3d5", accent: "#b45309", text: "#2c1a0e", textMuted: "#78614a", headingName: "#2c1a0e", labelAbout: "#b8a090", labelSkills: "#b8a090", labelExperience: "#b8a090", labelEducation: "#b8a090", labelProjects: "#b8a090", labelGallery: "#b8a090", lineColor: "rgba(180,83,9,0.15)", sectionAbout: "#78614a", sectionSkills: "#2c1a0e", sectionExperience: "#2c1a0e", sectionEducation: "#2c1a0e", sectionProjects: "#2c1a0e", sectionGallery: "#2c1a0e" } },
  { name: "Soft Lavender", dark: false, theme: { bg: "#f5f3ff", bgSurface: "#ede9fe", bgCard: "#ddd6fe", accent: "#7c3aed", text: "#1e1b4b", textMuted: "#6d6a8a", headingName: "#1e1b4b", labelAbout: "#a5b4fc", labelSkills: "#a5b4fc", labelExperience: "#a5b4fc", labelEducation: "#a5b4fc", labelProjects: "#a5b4fc", labelGallery: "#a5b4fc", lineColor: "rgba(124,58,237,0.2)", sectionAbout: "#6d6a8a", sectionSkills: "#1e1b4b", sectionExperience: "#1e1b4b", sectionEducation: "#1e1b4b", sectionProjects: "#1e1b4b", sectionGallery: "#1e1b4b" } },
  { name: "Mint Fresh", dark: false, theme: { bg: "#f0fdf4", bgSurface: "#dcfce7", bgCard: "#bbf7d0", accent: "#16a34a", text: "#14532d", textMuted: "#4a7c59", headingName: "#14532d", labelAbout: "#86efac", labelSkills: "#86efac", labelExperience: "#86efac", labelEducation: "#86efac", labelProjects: "#86efac", labelGallery: "#86efac", lineColor: "rgba(22,163,74,0.2)", sectionAbout: "#4a7c59", sectionSkills: "#14532d", sectionExperience: "#14532d", sectionEducation: "#14532d", sectionProjects: "#14532d", sectionGallery: "#14532d" } },
  { name: "Rose Light", dark: false, theme: { bg: "#fff1f2", bgSurface: "#ffe4e6", bgCard: "#fecdd3", accent: "#e11d48", text: "#4c0519", textMuted: "#8a4a55", headingName: "#4c0519", labelAbout: "#fda4af", labelSkills: "#fda4af", labelExperience: "#fda4af", labelEducation: "#fda4af", labelProjects: "#fda4af", labelGallery: "#fda4af", lineColor: "rgba(225,29,72,0.2)", sectionAbout: "#8a4a55", sectionSkills: "#4c0519", sectionExperience: "#4c0519", sectionEducation: "#4c0519", sectionProjects: "#4c0519", sectionGallery: "#4c0519" } },
];

function getTokenExpiry(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000;
  } catch { return null; }
}

function useAuth() {
  const [token, setToken] = useState(() => {
    const t = localStorage.getItem("admin_token");
    if (!t) return null;
    const exp = getTokenExpiry(t);
    if (exp && Date.now() > exp) {
      localStorage.removeItem("admin_token");
      return null;
    }
    return t;
  });
  const login = async (username, password) => {
    const res = await fetch(`${API}/api/admin/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const err = new Error(typeof data.detail === "object" ? data.detail.message : (data.detail || "Invalid credentials"));
      if (res.status === 429 && data.detail?.locked_until) err.lockedUntil = data.detail.locked_until * 1000;
      throw err;
    }
    const data = await res.json();
    localStorage.setItem("admin_token", data.access_token);
    setToken(data.access_token);
  };
  const logout = () => { localStorage.removeItem("admin_token"); setToken(null); };
  return { token, login, logout };
}

function authHeaders(token) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

// ─── Load Google Font for preview ─────────────────────────────────────────────

function loadGoogleFont(fontName) {
  const id = `gf-${fontName.replace(/ /g, "-")}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, "+")}:wght@400;500;700&display=swap`;
  document.head.appendChild(link);
}

// ─── Login ─────────────────────────────────────────────────────────────────────

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lockedUntil, setLockedUntil] = useState(null); // ms timestamp
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!lockedUntil) return;
    const tick = () => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (remaining <= 0) { setLockedUntil(null); setCountdown(0); setError(""); }
      else setCountdown(remaining);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lockedUntil]);

  const isLocked = lockedUntil && Date.now() < lockedUntil;

  const handleSubmit = async () => {
    if (isLocked || loading) return;
    setLoading(true); setError("");
    try { await onLogin(username, password); }
    catch (e) {
      if (e.lockedUntil) setLockedUntil(e.lockedUntil);
      setError(e.message || "Invalid username or password");
    }
    setLoading(false);
  };

  const mins = Math.floor(countdown / 60);
  const secs = String(countdown % 60).padStart(2, "0");

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div style={{ width: 360, background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 32 }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)", letterSpacing: "0.1em", marginBottom: 8 }}>ADMIN</p>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: 4 }}>Sign in</h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 28 }}>tienmai.space dashboard</p>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Username</label>
          <input value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} disabled={isLocked} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} disabled={isLocked} style={inputStyle} />
        </div>
        {error && (
          <div style={{ fontSize: 13, color: "#f87171", marginBottom: 14 }}>
            <p>{error}</p>
            {isLocked && <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, marginTop: 4 }}>Try again in: {mins}:{secs}</p>}
          </div>
        )}
        <button onClick={handleSubmit} disabled={loading || isLocked}
          style={{ width: "100%", padding: "11px", borderRadius: 10, border: "none", background: isLocked ? "var(--border)" : "var(--accent)", color: "#0a0a0b", fontSize: 14, fontWeight: 500, cursor: (loading || isLocked) ? "default" : "pointer", fontFamily: "var(--font-display)", opacity: loading ? 0.7 : 1 }}>
          {loading ? "Signing in..." : isLocked ? `Locked (${mins}:${secs})` : "Sign in"}
        </button>
      </div>
    </div>
  );
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────

function Dashboard({ token, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { fetch("/api/profile").then(r => r.json()).then(setProfile); }, []);

  const save = async (updates) => {
    setSaving(true);
    try {
      await fetch("/api/admin/profile", { method: "PUT", headers: authHeaders(token), body: JSON.stringify(updates) });
      setProfile(prev => ({ ...prev, ...updates }));
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch (e) { alert("Save failed: " + e.message); }
    setSaving(false);
  };

  const saveGallery = async (gallery) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/gallery", { method: "PUT", headers: authHeaders(token), body: JSON.stringify(gallery) });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        const detail = d.detail;
        const msg = typeof detail === "string" ? detail
          : Array.isArray(detail) ? detail.map(e => e.msg || JSON.stringify(e)).join("; ")
          : `HTTP ${res.status}`;
        throw new Error(msg);
      }
      setProfile(prev => ({ ...prev, gallery }));
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch (e) { alert("Save failed: " + e.message); }
    setSaving(false);
  };

  if (!profile) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid var(--accent)", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const tabs = [
    { id: "basic",         icon: "👤", label: "Basic Info" },
    { id: "about",         icon: "📝", label: "About" },
    { id: "skills",        icon: "⚡", label: "Skills" },
    { id: "experience",    icon: "💼", label: "Experience" },
    { id: "education",     icon: "🎓", label: "Education" },
    { id: "projects",      icon: "🗂️", label: "Projects" },
    { id: "certifications",icon: "🏅", label: "Certifications" },
    { id: "gallery",       icon: "🖼️", label: "Gallery" },
    { id: "resume",        icon: "📄", label: "Resume" },
    { id: "theme",         icon: "🎨", label: "Theme" },
    { id: "fonts",         icon: "✍️", label: "Fonts" },
    { id: "analytics",     icon: "📊", label: "Analytics" },
    { id: "ai",            icon: "🤖", label: "AI Models" },
    { id: "jobtracker",   icon: "📋", label: "Job Tracker" },
    { id: "settings",     icon: "⚙️", label: "Settings" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ padding: "14px 24px", borderBottom: "1px solid var(--border)", background: "var(--bg-surface)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)", letterSpacing: "0.1em" }}>ADMIN</p>
          <span style={{ color: "var(--border)" }}>·</span>
          <p style={{ fontSize: 14, fontWeight: 500 }}>tienmai.space</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {saved && <span style={{ fontSize: 12, color: "var(--accent)", fontFamily: "var(--font-mono)" }}>✓ Saved</span>}
          <a href="/" target="_blank" style={{ fontSize: 12, color: "var(--text-muted)", textDecoration: "none" }}>View site →</a>
          <button onClick={onLogout} style={{ fontSize: 12, color: "var(--text-muted)", background: "none", border: "1px solid var(--border)", borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontFamily: "var(--font-display)" }}>Sign out</button>
        </div>
      </div>

      <div style={{ display: "flex", maxWidth: 1000, margin: "0 auto", padding: "24px" }}>
        <div style={{ width: 160, flexShrink: 0, marginRight: 24 }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", padding: "9px 12px", borderRadius: 10, border: "none", background: activeTab === tab.id ? "var(--accent-dim)" : "none", color: activeTab === tab.id ? "var(--accent)" : "var(--text-muted)", fontSize: 13, cursor: "pointer", fontFamily: "var(--font-display)", marginBottom: 4, transition: "all 0.15s" }}>
              <span style={{ width: 18, flexShrink: 0, textAlign: "center", fontSize: 14 }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }}>
          {activeTab === "basic" && <BasicTab profile={profile} onSave={save} saving={saving} />}
          {activeTab === "about" && <AboutTab profile={profile} onSave={save} saving={saving} />}
          {activeTab === "skills" && <SkillsTab profile={profile} onSave={save} saving={saving} />}
          {activeTab === "experience" && <ExperienceTab items={profile.experiences || []} onSave={save} saving={saving} />}
          {activeTab === "education" && <EducationTab items={profile.educations || []} onSave={save} saving={saving} />}
          {activeTab === "projects" && <ListTab title="Projects" field="projects" items={profile.projects || []} onSave={save} saving={saving} fields={["title", "tag", "description", "link"]} />}
          {activeTab === "certifications" && <CertificationTab items={profile.certifications || []} onSave={save} saving={saving} />}
          {activeTab === "gallery" && <GalleryTab gallery={profile.gallery || []} experiences={profile.experiences || []} onSave={saveGallery} saving={saving} />}
          {activeTab === "resume" && <ResumeTab token={token} resumeVisible={profile.resumeVisible !== false} onSave={save} saving={saving} />}
          {activeTab === "theme" && <ThemeTab theme={profile.theme || {}} onSave={save} saving={saving} />}
          {activeTab === "fonts" && <FontsTab fonts={profile.fonts || {}} onSave={save} saving={saving} />}
          {activeTab === "analytics" && <AnalyticsTab token={token} />}
          {activeTab === "ai" && <AITab token={token} />}
          {activeTab === "jobtracker" && <JobTrackerTab token={token} />}
          {activeTab === "settings" && <SettingsTab token={token} onLogout={onLogout} />}
        </div>
      </div>
    </div>
  );
}

// ─── Fonts Tab ─────────────────────────────────────────────────────────────────

function FontsTab({ fonts, onSave, saving }) {
  const [selectedDisplay, setSelectedDisplay] = useState(fonts.display || "Syne");
  const [selectedMono, setSelectedMono] = useState(fonts.mono || "DM Mono");

  // Load all fonts for preview
  useEffect(() => {
    [...DISPLAY_FONTS, ...MONO_FONTS].forEach(f => loadGoogleFont(f.name));
  }, []);

  return (
    <TabCard title="Fonts" onSave={() => onSave({ fonts: { display: selectedDisplay, mono: selectedMono } })} saving={saving}>

      {/* Display Font */}
      <div style={{ marginBottom: 32 }}>
        <GroupLabel>Display Font — headings & body text</GroupLabel>
        <div style={{ display: "grid", gap: 8 }}>
          {DISPLAY_FONTS.map(font => (
            <button key={font.name} onClick={() => setSelectedDisplay(font.name)} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 16px", borderRadius: 12, cursor: "pointer", textAlign: "left",
              border: `1px solid ${selectedDisplay === font.name ? "var(--accent-border)" : "var(--border)"}`,
              background: selectedDisplay === font.name ? "var(--accent-dim)" : "var(--bg-card)",
              transition: "all 0.15s",
            }}>
              <div>
                <p style={{ fontSize: 20, fontFamily: `'${font.name}', sans-serif`, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>
                  Tien Mai Duc
                </p>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{font.name} — {font.desc}</p>
              </div>
              {selectedDisplay === font.name && (
                <span style={{ fontSize: 12, color: "var(--accent)", fontFamily: "var(--font-mono)", flexShrink: 0, marginLeft: 12 }}>✓ Selected</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <Divider />

      {/* Mono Font */}
      <div>
        <GroupLabel>Mono Font — labels, tags & code</GroupLabel>
        <div style={{ display: "grid", gap: 8 }}>
          {MONO_FONTS.map(font => (
            <button key={font.name} onClick={() => setSelectedMono(font.name)} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 16px", borderRadius: 12, cursor: "pointer", textAlign: "left",
              border: `1px solid ${selectedMono === font.name ? "var(--accent-border)" : "var(--border)"}`,
              background: selectedMono === font.name ? "var(--accent-dim)" : "var(--bg-card)",
              transition: "all 0.15s",
            }}>
              <div>
                <p style={{ fontSize: 16, fontFamily: `'${font.name}', monospace`, fontWeight: 500, color: "var(--accent)", marginBottom: 2 }}>
                  ABOUT · SKILLS · EXPERIENCE
                </p>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{font.name} — {font.desc}</p>
              </div>
              {selectedMono === font.name && (
                <span style={{ fontSize: 12, color: "var(--accent)", fontFamily: "var(--font-mono)", flexShrink: 0, marginLeft: 12 }}>✓ Selected</span>
              )}
            </button>
          ))}
        </div>
      </div>

    </TabCard>
  );
}

// ─── Theme Tab ─────────────────────────────────────────────────────────────────

const DEFAULT_THEME = {
  bg: "#0a0a0b", bgSurface: "#111114", bgCard: "#16161a",
  accent: "#5dcaa5", text: "#f0efe8", textMuted: "#6b6a65",
  headingName: "#f0efe8", lineColor: "rgba(255,255,255,0.07)",
  labelAbout: "#3a3a38", labelSkills: "#3a3a38", labelExperience: "#3a3a38",
  labelEducation: "#3a3a38", labelProjects: "#3a3a38", labelGallery: "#3a3a38",
  sectionAbout: "#6b6a65", sectionSkills: "#6b6a65",
  sectionExperience: "#f0efe8", sectionEducation: "#f0efe8",
  sectionProjects: "#f0efe8", sectionGallery: "#f0efe8",
};

function ThemeTab({ theme, onSave, saving }) {
  const [t, setT] = useState({ ...DEFAULT_THEME, ...theme });
  const set = (k, v) => setT(p => ({ ...p, [k]: v }));
  const applyPreset = (preset) => setT({ ...DEFAULT_THEME, ...preset.theme });

  const bgColors = [
    { key: "bg", label: "Page Background" },
    { key: "bgSurface", label: "Surface Background" },
    { key: "bgCard", label: "Card Background" },
    { key: "accent", label: "Accent Color" },
    { key: "lineColor", label: "Section Line Color" },
  ];
  const textColors = [
    { key: "headingName", label: "Name Heading" },
    { key: "text", label: "Body Text" },
    { key: "textMuted", label: "Muted Text" },
  ];
  const sectionLabelColors = [
    { key: "labelAbout", label: "ABOUT label" },
    { key: "labelSkills", label: "SKILLS label" },
    { key: "labelExperience", label: "EXPERIENCE label" },
    { key: "labelEducation", label: "EDUCATION label" },
    { key: "labelProjects", label: "PROJECTS label" },
    { key: "labelCertifications", label: "CERTIFICATIONS label" },
    { key: "labelGallery", label: "GALLERY label" },
  ];
  const sectionContentColors = [
    { key: "sectionAbout", label: "About content" },
    { key: "sectionSkills", label: "Skills content" },
    { key: "sectionExperience", label: "Experience content" },
    { key: "sectionEducation", label: "Education content" },
    { key: "sectionProjects", label: "Projects content" },
    { key: "sectionCertifications", label: "Certifications content" },
    { key: "sectionGallery", label: "Gallery content" },
  ];

  return (
    <TabCard title="Theme" onSave={() => onSave({ theme: t })} saving={saving}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>Presets</p>
        <p style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em", marginBottom: 8 }}>DARK</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {PRESETS.filter(p => p.dark).map(preset => (
            <button key={preset.name} onClick={() => applyPreset(preset)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", borderRadius: 9, border: "1px solid var(--border)", background: preset.theme.bgCard, cursor: "pointer", transition: "border-color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = preset.theme.accent}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
            >
              <div style={{ display: "flex", gap: 3 }}>{[preset.theme.bg, preset.theme.accent, preset.theme.text].map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}</div>
              <span style={{ fontSize: 12, color: preset.theme.text, fontFamily: "var(--font-display)" }}>{preset.name}</span>
            </button>
          ))}
        </div>
        <p style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em", marginBottom: 8 }}>LIGHT</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {PRESETS.filter(p => !p.dark).map(preset => (
            <button key={preset.name} onClick={() => applyPreset(preset)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", borderRadius: 9, border: "1px solid #e2e8f0", background: preset.theme.bgCard, cursor: "pointer", transition: "border-color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = preset.theme.accent}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}
            >
              <div style={{ display: "flex", gap: 3 }}>{[preset.theme.bg, preset.theme.accent, preset.theme.text].map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c, border: "1px solid rgba(0,0,0,0.1)" }} />)}</div>
              <span style={{ fontSize: 12, color: preset.theme.text }}>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>
      <Divider />
      <GroupLabel>Background & Accent</GroupLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
        {bgColors.map(({ key, label }) => <ColorPicker key={key} label={label} value={t[key] || "#000000"} onChange={v => set(key, v)} />)}
      </div>
      <Divider />
      <GroupLabel>Text Colors</GroupLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
        {textColors.map(({ key, label }) => <ColorPicker key={key} label={label} value={t[key] || "#ffffff"} onChange={v => set(key, v)} />)}
      </div>
      <Divider />
      <GroupLabel>Section Label Colors (ABOUT, SKILLS...)</GroupLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
        {sectionLabelColors.map(({ key, label }) => <ColorPicker key={key} label={label} value={t[key] || "#3a3a38"} onChange={v => set(key, v)} />)}
      </div>
      <Divider />
      <GroupLabel>Section Content Colors</GroupLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {sectionContentColors.map(({ key, label }) => <ColorPicker key={key} label={label} value={t[key] || "#f0efe8"} onChange={v => set(key, v)} />)}
      </div>

      <Divider />
      <GroupLabel>Open to Work Badge</GroupLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <ColorPicker label="Badge background" value={t.openToWorkBg || "#16a34a"} onChange={v => set("openToWorkBg", v)} />
        <ColorPicker label="Badge text" value={t.openToWorkText || "#ffffff"} onChange={v => set("openToWorkText", v)} />
        <ColorPicker label="Badge border" value={t.openToWorkBorder || "rgba(255,255,255,0.2)"} onChange={v => set("openToWorkBorder", v)} />
      </div>

      <Divider />
      <GroupLabel>Expired Certifications</GroupLabel>
      <ColorPicker label="Expired cert background" value={t.expiredCertBg || "#2d1515"} onChange={v => set("expiredCertBg", v)} />

      <Divider />
      <GroupLabel>JD Match Banner (For Recruiters)</GroupLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <ColorPicker label="Banner background" value={t.bannerBg || t.bgCard || "#16161a"} onChange={v => set("bannerBg", v)} />
        <ColorPicker label="Banner border" value={t.bannerBorder || t.accent + "4d" || "#5dcaa54d"} onChange={v => set("bannerBorder", v)} />
        <ColorPicker label='"FOR RECRUITERS" label' value={t.bannerLabel || t.accent || "#5dcaa5"} onChange={v => set("bannerLabel", v)} />
        <ColorPicker label="Title color" value={t.bannerTitle || t.text || "#f0efe8"} onChange={v => set("bannerTitle", v)} />
        <ColorPicker label="Body text color" value={t.bannerText || t.textMuted || "#6b6a65"} onChange={v => set("bannerText", v)} />
        <ColorPicker label="Button text color" value={t.bannerBtnText || t.accent || "#5dcaa5"} onChange={v => set("bannerBtnText", v)} />
        <ColorPicker label="Match color ≥50% (% & skills)" value={t.bannerMatchColor || "#16a34a"} onChange={v => set("bannerMatchColor", v)} />
        <ColorPicker label="Low match color <50% (% & skills)" value={t.bannerMissingColor || "#dc2626"} onChange={v => set("bannerMissingColor", v)} />
      </div>
    </TabCard>
  );
}

function Divider() { return <div style={{ height: "1px", background: "var(--border)", marginBottom: 20 }} />; }
function GroupLabel({ children }) { return <p style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em", marginBottom: 12, textTransform: "uppercase" }}>{children}</p>; }

function ColorPicker({ label, value, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px" }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: value, border: "2px solid rgba(255,255,255,0.1)", cursor: "pointer" }} />
        <input type="color" value={value.startsWith("rgba") ? "#888888" : value} onChange={e => onChange(e.target.value)} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 3 }}>{label}</p>
        <input value={value} onChange={e => onChange(e.target.value)} style={{ ...inputStyle, padding: "4px 8px", fontSize: 11, fontFamily: "var(--font-mono)", width: "100%" }} />
      </div>
    </div>
  );
}

// ─── Other Tabs ────────────────────────────────────────────────────────────────

function BasicTab({ profile, onSave, saving }) {
  const [form, setForm] = useState({ name: profile.name || "", title: profile.title || "", location: profile.location || "", email: profile.email || "", phone: profile.phone || "", github: profile.github || "", gitlab: profile.gitlab || "", linkedin: profile.linkedin || "", avatar: profile.avatar || "", openToWork: profile.openToWork || false });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <TabCard title="Basic Info" onSave={() => onSave(form)} saving={saving}>
      {[["name", "Name"], ["title", "Title / Headline"], ["location", "Location"], ["email", "Email"], ["phone", "Phone Number"], ["github", "GitHub URL"], ["gitlab", "GitLab URL"], ["linkedin", "LinkedIn URL"], ["avatar", "Avatar URL (Cloudinary)"]].map(([key, label]) => (
        <Field key={key} label={label}><input value={form[key]} onChange={e => set(key, e.target.value)} style={inputStyle} /></Field>
      ))}

      {/* Open to Work toggle */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px", marginTop: 8 }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 500 }}>Open to Work</p>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Show badge below your avatar</p>
        </div>
        <button onClick={() => set("openToWork", !form.openToWork)} style={{
          width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
          background: form.openToWork ? "var(--accent)" : "var(--border)",
          position: "relative", transition: "background 0.2s", flexShrink: 0,
        }}>
          <div style={{
            width: 18, height: 18, borderRadius: "50%", background: "#fff",
            position: "absolute", top: 3,
            left: form.openToWork ? 23 : 3,
            transition: "left 0.2s",
          }} />
        </button>
      </div>
    </TabCard>
  );
}

function AboutTab({ profile, onSave, saving }) {
  const [about, setAbout] = useState(profile.about || "");
  return (
    <TabCard title="About" onSave={() => onSave({ about })} saving={saving}>
      <Field label="About / Bio"><textarea value={about} onChange={e => setAbout(e.target.value)} rows={8} style={{ ...inputStyle, resize: "vertical" }} /></Field>
    </TabCard>
  );
}

function SkillsTab({ profile, onSave, saving }) {
  const rawSkills = profile.skills || [];
  const isGrouped = rawSkills.length > 0 && typeof rawSkills[0] === "object";

  const initGroups = () => {
    if (isGrouped) return rawSkills.map(g => ({ group: g.group || "", items: (g.items || []).join(", ") }));
    return rawSkills.length > 0 ? [{ group: "General", items: rawSkills.join(", ") }] : [{ group: "", items: "" }];
  };

  const [groups, setGroups] = useState(initGroups);

  const addGroup = () => setGroups(p => [...p, { group: "", items: "" }]);
  const removeGroup = i => setGroups(p => p.filter((_, idx) => idx !== i));
  const updateGroup = (i, k, v) => setGroups(p => p.map((g, idx) => idx === i ? { ...g, [k]: v } : g));
  const moveUp = i => { if (i === 0) return; const l = [...groups]; [l[i-1], l[i]] = [l[i], l[i-1]]; setGroups(l); };
  const moveDown = i => { if (i === groups.length - 1) return; const l = [...groups]; [l[i], l[i+1]] = [l[i+1], l[i]]; setGroups(l); };

  const handleSave = async () => {
    const skills = groups.map(g => ({
      group: g.group.trim(),
      items: g.items.split(",").map(s => s.trim()).filter(Boolean),
    })).filter(g => g.items.length > 0);
    await onSave({ skills });
    // Sync local state after save
    setGroups(skills.map(g => ({ group: g.group, items: g.items.join(", ") })));
  };

  return (
    <TabCard title="Skills" onSave={handleSave} saving={saving}>
      {groups.map((g, i) => (
        <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Group #{i + 1}</span>
            <div style={{ display: "flex", gap: 6 }}>
              <SmallBtn onClick={() => moveUp(i)} disabled={i === 0}>↑</SmallBtn>
              <SmallBtn onClick={() => moveDown(i)} disabled={i === groups.length - 1}>↓</SmallBtn>
              <SmallBtn onClick={() => removeGroup(i)} danger>✕</SmallBtn>
            </div>
          </div>
          <Field label="Group Name (e.g. Languages, Frameworks, Tools)">
            <input value={g.group} onChange={e => updateGroup(i, "group", e.target.value)} placeholder="e.g. Languages" style={inputStyle} />
          </Field>
          <Field label="Skills (comma separated)">
            <textarea value={g.items} onChange={e => updateGroup(i, "items", e.target.value)} rows={2} placeholder="e.g. Python, SQL, JavaScript" style={{ ...inputStyle, resize: "vertical" }} />
          </Field>
        </div>
      ))}
      <button onClick={addGroup} style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px dashed var(--border)", background: "none", color: "var(--text-muted)", fontSize: 13, cursor: "pointer", fontFamily: "var(--font-display)" }}>
        + Add Group
      </button>
    </TabCard>
  );
}

function ExperienceTab({ items, onSave, saving }) {
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 40 }, (_, i) => currentYear - i);

  const parsePeriod = (period) => {
    if (!period) return { startMonth: "", startYear: "", endMonth: "", endYear: "", current: false };
    const current = period.includes("Present");
    const parts = period.split("·").map(s => s.trim());
    const start = parts[0] || "";
    const end = current ? "" : (parts[1] || "");
    const parseDate = (s) => {
      const m = s.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/);
      const y = s.match(/\d{4}/);
      return { month: m?.[0] || "", year: y?.[0] || "" };
    };
    const s = parseDate(start);
    const e = parseDate(end);
    return { startMonth: s.month, startYear: s.year, endMonth: e.month, endYear: e.year, current };
  };

  const buildPeriod = (startMonth, startYear, endMonth, endYear, current) => {
    const start = [startMonth, startYear].filter(Boolean).join(" ");
    if (current) return `${start} · Present`;
    const end = [endMonth, endYear].filter(Boolean).join(" ");
    return end ? `${start} · ${end}` : start;
  };

  const [list, setList] = useState(items.map(item => {
    const parsed = parsePeriod(item.period);
    return { ...item, ...parsed };
  }));

  const add = () => setList(p => [...p, { company: "", role: "", description: "", period: "", startMonth: "", startYear: "", endMonth: "", endYear: "", current: false }]);
  const remove = i => setList(p => p.filter((_, idx) => idx !== i));
  const update = (i, k, v) => setList(p => p.map((item, idx) => idx === i ? { ...item, [k]: v } : item));
  const moveUp = i => { if (i === 0) return; const l = [...list];[l[i - 1], l[i]] = [l[i], l[i - 1]]; setList(l); };
  const moveDown = i => { if (i === list.length - 1) return; const l = [...list];[l[i], l[i + 1]] = [l[i + 1], l[i]]; setList(l); };

  const handleSave = () => {
    const experiences = list.map(({ startMonth, startYear, endMonth, endYear, current, ...rest }) => ({
      ...rest,
      period: buildPeriod(startMonth, startYear, endMonth, endYear, current),
    }));
    onSave({ experiences });
  };

  const MonthYearPicker = ({ monthKey, yearKey, item, idx }) => (
    <div style={{ display: "flex", gap: 8 }}>
      <select value={item[monthKey]} onChange={e => update(idx, monthKey, e.target.value)}
        style={{ ...inputStyle, flex: 1 }}>
        <option value="">Month</option>
        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
      </select>
      <select value={item[yearKey]} onChange={e => update(idx, yearKey, e.target.value)}
        style={{ ...inputStyle, flex: 1 }}>
        <option value="">Year</option>
        {years.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
    </div>
  );

  return (
    <TabCard title="Experience" onSave={handleSave} saving={saving}>
      {list.map((item, i) => (
        <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>#{i + 1}</span>
            <div style={{ display: "flex", gap: 6 }}>
              <SmallBtn onClick={() => moveUp(i)} disabled={i === 0}>↑</SmallBtn>
              <SmallBtn onClick={() => moveDown(i)} disabled={i === list.length - 1}>↓</SmallBtn>
              <SmallBtn onClick={() => remove(i)} danger>✕</SmallBtn>
            </div>
          </div>

          <Field label="Company"><input value={item.company || ""} onChange={e => update(i, "company", e.target.value)} style={inputStyle} /></Field>
          <Field label="Role"><input value={item.role || ""} onChange={e => update(i, "role", e.target.value)} style={inputStyle} /></Field>

          <Field label="Start Date"><MonthYearPicker monthKey="startMonth" yearKey="startYear" item={item} idx={i} /></Field>

          {/* Currently working checkbox */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <input type="checkbox" id={`current-${i}`} checked={item.current || false}
              onChange={e => update(i, "current", e.target.checked)}
              style={{ width: 16, height: 16, cursor: "pointer", accentColor: "var(--accent)" }}
            />
            <label htmlFor={`current-${i}`} style={{ fontSize: 13, color: "var(--text-muted)", cursor: "pointer" }}>
              I am currently working in this role
            </label>
          </div>

          {!item.current && (
            <Field label="End Date"><MonthYearPicker monthKey="endMonth" yearKey="endYear" item={item} idx={i} /></Field>
          )}

          <Field label="Description">
            <textarea value={item.description || ""} onChange={e => update(i, "description", e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
          </Field>
        </div>
      ))}
      <button onClick={add} style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px dashed var(--border)", background: "none", color: "var(--text-muted)", fontSize: 13, cursor: "pointer", fontFamily: "var(--font-display)" }}>
        + Add Experience
      </button>
    </TabCard>
  );
}

function EducationTab({ items, onSave, saving }) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 46 }, (_, i) => currentYear + 5 - i);

  const parsePeriod = (period) => {
    if (!period) return { startYear: "", endYear: "", current: false };
    const current = period.includes("Present");
    const parts = period.split("–").map(s => s.trim());
    const startYear = parts[0]?.match(/\d{4}/)?.[0] || "";
    const endYear = current ? "" : (parts[1]?.match(/\d{4}/)?.[0] || "");
    return { startYear, endYear, current };
  };

  const buildPeriod = (startYear, endYear, current) => {
    if (current) return `${startYear} – Present`;
    return endYear ? `${startYear} – ${endYear}` : startYear;
  };

  const [list, setList] = useState(items.map(item => {
    const parsed = parsePeriod(item.period);
    return { ...item, ...parsed };
  }));

  const add = () => setList(p => [...p, { school: "", degree: "", period: "", startYear: "", endYear: "", current: false }]);
  const remove = i => setList(p => p.filter((_, idx) => idx !== i));
  const update = (i, k, v) => setList(p => p.map((item, idx) => idx === i ? { ...item, [k]: v } : item));
  const moveUp = i => { if (i === 0) return; const l = [...list]; [l[i-1], l[i]] = [l[i], l[i-1]]; setList(l); };
  const moveDown = i => { if (i === list.length - 1) return; const l = [...list]; [l[i], l[i+1]] = [l[i+1], l[i]]; setList(l); };

  const handleSave = () => {
    const educations = list.map(({ startYear, endYear, current, ...rest }) => ({
      ...rest,
      period: buildPeriod(startYear, endYear, current),
    }));
    onSave({ educations });
  };

  const YearPicker = ({ yearKey, item, idx, placeholder }) => (
    <select value={item[yearKey]} onChange={e => update(idx, yearKey, e.target.value)} style={inputStyle}>
      <option value="">{placeholder}</option>
      {years.map(y => <option key={y} value={y}>{y}</option>)}
    </select>
  );

  return (
    <TabCard title="Education" onSave={handleSave} saving={saving}>
      {list.map((item, i) => (
        <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>#{i + 1}</span>
            <div style={{ display: "flex", gap: 6 }}>
              <SmallBtn onClick={() => moveUp(i)} disabled={i === 0}>↑</SmallBtn>
              <SmallBtn onClick={() => moveDown(i)} disabled={i === list.length - 1}>↓</SmallBtn>
              <SmallBtn onClick={() => remove(i)} danger>✕</SmallBtn>
            </div>
          </div>

          <Field label="School / University"><input value={item.school || ""} onChange={e => update(i, "school", e.target.value)} style={inputStyle} /></Field>
          <Field label="Degree"><input value={item.degree || ""} onChange={e => update(i, "degree", e.target.value)} style={inputStyle} /></Field>
          <Field label="Start Year"><YearPicker yearKey="startYear" item={item} idx={i} placeholder="Start Year" /></Field>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <input type="checkbox" id={`edu-current-${i}`} checked={item.current || false}
              onChange={e => update(i, "current", e.target.checked)}
              style={{ width: 16, height: 16, cursor: "pointer", accentColor: "var(--accent)" }}
            />
            <label htmlFor={`edu-current-${i}`} style={{ fontSize: 13, color: "var(--text-muted)", cursor: "pointer" }}>
              I am currently studying here
            </label>
          </div>

          {!item.current && (
            <Field label="End Year"><YearPicker yearKey="endYear" item={item} idx={i} placeholder="End Year" /></Field>
          )}
        </div>
      ))}
      <button onClick={add} style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px dashed var(--border)", background: "none", color: "var(--text-muted)", fontSize: 13, cursor: "pointer", fontFamily: "var(--font-display)" }}>
        + Add Education
      </button>
    </TabCard>
  );
}

function CertificationTab({ items, onSave, saving }) {
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 46 }, (_, i) => currentYear + 5 - i);

  const parseCertDate = (dateStr) => {
    if (!dateStr) return { issueMonth: "", issueYear: "", expMonth: "", expYear: "", noExpiry: false };
    const noExpiry = !dateStr.includes("·") || dateStr.includes("No Expiry") || !dateStr.match(/Expires?/i);
    const parts = dateStr.split("·").map(s => s.trim());
    const parseDate = (s) => {
      const m = s?.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/);
      const y = s?.match(/\d{4}/);
      return { month: m?.[0] || "", year: y?.[0] || "" };
    };
    const issue = parseDate(parts[0]);
    const exp = noExpiry ? { month: "", year: "" } : parseDate(parts[1]);
    return { issueMonth: issue.month, issueYear: issue.year, expMonth: exp.month, expYear: exp.year, noExpiry };
  };

  const buildDate = (issueMonth, issueYear, expMonth, expYear, noExpiry) => {
    const issue = [issueMonth, issueYear].filter(Boolean).join(" ");
    if (noExpiry) return issue;
    const exp = [expMonth, expYear].filter(Boolean).join(" ");
    return exp ? `${issue} · Expires ${exp}` : issue;
  };

  const [list, setList] = useState(items.map(item => {
    const parsed = parseCertDate(item.date);
    return { ...item, ...parsed };
  }));

  const add = () => setList(p => [...p, { name: "", issuer: "", credentialId: "", link: "", date: "", issueMonth: "", issueYear: "", expMonth: "", expYear: "", noExpiry: false }]);
  const remove = i => setList(p => p.filter((_, idx) => idx !== i));
  const update = (i, k, v) => setList(p => p.map((item, idx) => idx === i ? { ...item, [k]: v } : item));
  const moveUp = i => { if (i === 0) return; const l = [...list];[l[i - 1], l[i]] = [l[i], l[i - 1]]; setList(l); };
  const moveDown = i => { if (i === list.length - 1) return; const l = [...list];[l[i], l[i + 1]] = [l[i + 1], l[i]]; setList(l); };

  const handleSave = () => {
    const certifications = list.map(({ issueMonth, issueYear, expMonth, expYear, noExpiry, ...rest }) => ({
      ...rest,
      date: buildDate(issueMonth, issueYear, expMonth, expYear, noExpiry),
    }));
    onSave({ certifications });
  };

  const MonthYearPicker = ({ monthKey, yearKey, item, idx }) => (
    <div style={{ display: "flex", gap: 8 }}>
      <select value={item[monthKey]} onChange={e => update(idx, monthKey, e.target.value)} style={{ ...inputStyle, flex: 1 }}>
        <option value="">Month</option>
        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
      </select>
      <select value={item[yearKey]} onChange={e => update(idx, yearKey, e.target.value)} style={{ ...inputStyle, flex: 1 }}>
        <option value="">Year</option>
        {years.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
    </div>
  );

  return (
    <TabCard title="Certifications" onSave={handleSave} saving={saving}>
      {list.map((item, i) => (
        <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>#{i + 1}</span>
            <div style={{ display: "flex", gap: 6 }}>
              <SmallBtn onClick={() => moveUp(i)} disabled={i === 0}>↑</SmallBtn>
              <SmallBtn onClick={() => moveDown(i)} disabled={i === list.length - 1}>↓</SmallBtn>
              <SmallBtn onClick={() => remove(i)} danger>✕</SmallBtn>
            </div>
          </div>

          <Field label="Certification Name"><input value={item.name || ""} onChange={e => update(i, "name", e.target.value)} style={inputStyle} /></Field>
          <Field label="Issuing Organization"><input value={item.issuer || ""} onChange={e => update(i, "issuer", e.target.value)} style={inputStyle} /></Field>
          <Field label="Issue Date"><MonthYearPicker monthKey="issueMonth" yearKey="issueYear" item={item} idx={i} /></Field>

          {/* No expiry checkbox */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <input type="checkbox" id={`noexpiry-${i}`} checked={item.noExpiry || false}
              onChange={e => update(i, "noExpiry", e.target.checked)}
              style={{ width: 16, height: 16, cursor: "pointer", accentColor: "var(--accent)" }}
            />
            <label htmlFor={`noexpiry-${i}`} style={{ fontSize: 13, color: "var(--text-muted)", cursor: "pointer" }}>
              This credential does not expire
            </label>
          </div>

          {!item.noExpiry && (
            <Field label="Expiration Date"><MonthYearPicker monthKey="expMonth" yearKey="expYear" item={item} idx={i} /></Field>
          )}

          <Field label="Credential ID"><input value={item.credentialId || ""} onChange={e => update(i, "credentialId", e.target.value)} style={inputStyle} /></Field>
          <Field label="Credential URL"><input value={item.link || ""} onChange={e => update(i, "link", e.target.value)} placeholder="https://..." style={inputStyle} /></Field>
        </div>
      ))}
      <button onClick={add} style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px dashed var(--border)", background: "none", color: "var(--text-muted)", fontSize: 13, cursor: "pointer", fontFamily: "var(--font-display)" }}>
        + Add Certification
      </button>
    </TabCard>
  );
}

function ListTab({ title, field, items, onSave, saving, fields }) {
  const [list, setList] = useState(items.map(i => ({ ...i })));
  const add = () => setList(p => [...p, Object.fromEntries(fields.map(f => [f, ""]))]);
  const remove = i => setList(p => p.filter((_, idx) => idx !== i));
  const update = (i, k, v) => setList(p => p.map((item, idx) => idx === i ? { ...item, [k]: v } : item));
  const moveUp = i => { if (i === 0) return; const l = [...list];[l[i - 1], l[i]] = [l[i], l[i - 1]]; setList(l); };
  const moveDown = i => { if (i === list.length - 1) return; const l = [...list];[l[i], l[i + 1]] = [l[i + 1], l[i]]; setList(l); };

  return (
    <TabCard title={title} onSave={() => onSave({ [field]: list })} saving={saving}>
      {list.map((item, i) => (
        <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>#{i + 1}</span>
            <div style={{ display: "flex", gap: 6 }}>
              <SmallBtn onClick={() => moveUp(i)} disabled={i === 0}>↑</SmallBtn>
              <SmallBtn onClick={() => moveDown(i)} disabled={i === list.length - 1}>↓</SmallBtn>
              <SmallBtn onClick={() => remove(i)} danger>✕</SmallBtn>
            </div>
          </div>
          {fields.map(f => (
            <Field key={f} label={f.charAt(0).toUpperCase() + f.slice(1)}>
              {f === "description"
                ? <textarea value={item[f] || ""} onChange={e => update(i, f, e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
                : <input value={item[f] || ""} onChange={e => update(i, f, e.target.value)} style={inputStyle} />
              }
            </Field>
          ))}
        </div>
      ))}
      <button onClick={add} style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px dashed var(--border)", background: "none", color: "var(--text-muted)", fontSize: 13, cursor: "pointer", fontFamily: "var(--font-display)" }}>
        + Add {title.endsWith("s") ? title.slice(0, -1) : title}
      </button>
    </TabCard>
  );
}

function GalleryTab({ gallery, experiences, onSave, saving }) {
  // Normalize incoming items: legacy strings → {url, caption, year} objects
  const normalize = (items) =>
    (items || []).map(item =>
      typeof item === "string"
        ? { url: item, caption: "", year: null }
        : { url: item.url || "", caption: item.caption || "", year: item.year || null }
    );

  const [images, setImages] = useState(() => normalize(gallery));
  const [newUrl, setNewUrl] = useState("");

  // Drag-and-drop state
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Build year options: currentYear down to earliest year from Experiences
  const currentYear = new Date().getFullYear();
  const earliestYear = (() => {
    const years = (experiences || []).flatMap(exp => {
      const matches = (exp.period || "").match(/\d{4}/g) || [];
      return matches.map(Number);
    });
    return years.length > 0 ? Math.min(...years) : currentYear - 10;
  })();
  const yearOptions = Array.from({ length: currentYear - earliestYear + 1 }, (_, i) => currentYear - i);

  const add = () => {
    if (!newUrl.trim()) return;
    setImages(p => [...p, { url: newUrl.trim(), caption: "", year: null }]);
    setNewUrl("");
  };
  const remove = i => setImages(p => p.filter((_, idx) => idx !== i));
  const updateCaption = (i, v) => setImages(p => p.map((item, idx) => idx === i ? { ...item, caption: v } : item));
  const updateYear = (i, v) => setImages(p => p.map((item, idx) => idx === i ? { ...item, year: v } : item));

  // Drag handlers — skip drag when the user clicks inside a form control
  const handleDragStart = (e, i) => {
    if (["INPUT", "SELECT", "TEXTAREA"].includes(e.target.tagName)) { e.preventDefault(); return; }
    setDragIndex(i);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = (e, i) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== i) setDragOverIndex(i);
  };
  const handleDrop = (e, i) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === i) { setDragIndex(null); setDragOverIndex(null); return; }
    const next = [...images];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(i, 0, moved);
    setImages(next);
    setDragIndex(null);
    setDragOverIndex(null);
  };
  const handleDragEnd = () => { setDragIndex(null); setDragOverIndex(null); };

  return (
    <TabCard title="Gallery" onSave={() => onSave(images)} saving={saving}>
      <Field label="Add image URL (Cloudinary)">
        <div style={{ display: "flex", gap: 8 }}>
          <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://res.cloudinary.com/..." style={{ ...inputStyle, flex: 1 }} onKeyDown={e => e.key === "Enter" && add()} />
          <button onClick={add} style={{ padding: "8px 16px", borderRadius: 9, border: "none", background: "var(--accent)", color: "#0a0a0b", fontSize: 13, cursor: "pointer", fontFamily: "var(--font-display)", flexShrink: 0 }}>Add</button>
        </div>
      </Field>
      <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
        {images.map((item, i) => {
          const isDragging = dragIndex === i;
          const isOver = dragOverIndex === i && dragIndex !== i;
          return (
            <div
              key={i}
              draggable
              onDragStart={e => handleDragStart(e, i)}
              onDragOver={e => handleDragOver(e, i)}
              onDrop={e => handleDrop(e, i)}
              onDragEnd={handleDragEnd}
              style={{
                background: "var(--bg-card)",
                border: `1px solid ${isOver ? "var(--accent)" : "var(--border)"}`,
                borderRadius: 10,
                padding: "10px 12px",
                opacity: isDragging ? 0.4 : 1,
                transition: "border-color 0.15s, opacity 0.15s",
                boxShadow: isOver ? "0 0 0 2px var(--accent-border)" : "none",
              }}
            >
              {/* Row 1: grip handle + thumbnail + URL + remove */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                {/* Drag handle — ⠿ is a 2×3 dot grid, classic "grip" icon */}
                <div
                  title="Drag to reorder"
                  style={{ color: "var(--text-muted)", fontSize: 18, cursor: isDragging ? "grabbing" : "grab", flexShrink: 0, userSelect: "none", lineHeight: 1, padding: "0 2px" }}
                >⠿</div>
                <img src={item.url} alt="" draggable={false} style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
                <p style={{ flex: 1, fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.url}</p>
                <SmallBtn onClick={() => remove(i)} danger>✕</SmallBtn>
              </div>
              {/* Row 2: year dropdown + caption input */}
              <div style={{ display: "flex", gap: 8 }}>
                <select
                  value={item.year ?? ""}
                  onChange={e => updateYear(i, e.target.value ? parseInt(e.target.value) : null)}
                  style={{ ...inputStyle, width: 110, flexShrink: 0, fontSize: 12, padding: "7px 10px" }}
                >
                  <option value="">No year</option>
                  {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <input
                  value={item.caption}
                  onChange={e => updateCaption(i, e.target.value)}
                  placeholder="Caption (optional)"
                  style={{ ...inputStyle, flex: 1, fontSize: 12, padding: "7px 10px" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </TabCard>
  );
}

// ─── Shared UI ─────────────────────────────────────────────────────────────────

function TabCard({ title, children, onSave, saving }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }}>{title}</h2>
        <button onClick={onSave} disabled={saving} style={{ padding: "8px 20px", borderRadius: 9, border: "none", background: "var(--accent)", color: "#0a0a0b", fontSize: 13, fontWeight: 500, cursor: saving ? "default" : "pointer", fontFamily: "var(--font-display)", opacity: saving ? 0.7 : 1 }}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

function SmallBtn({ onClick, children, disabled, danger }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid var(--border)", background: "none", color: danger ? "#f87171" : "var(--text-muted)", cursor: disabled ? "default" : "pointer", fontSize: 12, opacity: disabled ? 0.3 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {children}
    </button>
  );
}

const inputStyle = {
  width: "100%", background: "var(--bg-card)", border: "1px solid var(--border)",
  borderRadius: 9, padding: "9px 12px", color: "var(--text)",
  fontSize: 13, fontFamily: "var(--font-display)", outline: "none",
  transition: "border-color 0.2s", boxSizing: "border-box",
};

// ─── Resume Tab ────────────────────────────────────────────────────────────────

function ResumeTab({ token, resumeVisible, onSave, saving }) {
  const [hasResume, setHasResume] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(resumeVisible);
  const fileRef = useRef(null);

  useEffect(() => {
    fetch("/api/resume/exists")
      .then(r => r.json())
      .then(data => setHasResume(data.exists));
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".pdf")) { setMessage("Only PDF files are allowed."); return; }
    setUploading(true); setMessage("");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/admin/resume", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) { setHasResume(true); setMessage("Resume uploaded successfully!"); }
      else { setMessage("Upload failed. Please try again."); }
    } catch { setMessage("Upload failed. Please try again."); }
    setUploading(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete the resume?")) return;
    await fetch("/api/admin/resume", { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    setHasResume(false);
    setMessage("Resume deleted.");
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Resume</h2>
      </div>

      {/* Visibility toggle */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-card)", border: `1px solid ${visible ? "var(--accent-border)" : "var(--border)"}`, borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 500 }}>Show resume on profile</p>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
            {visible ? "Visible to visitors" : "Hidden from visitors — file still saved"}
          </p>
        </div>
        <button onClick={() => { const v = !visible; setVisible(v); onSave({ resumeVisible: v }); }} disabled={saving} style={{ width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", background: visible ? "var(--accent)" : "var(--border)", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
          <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: visible ? 23 : 3, transition: "left 0.2s" }} />
        </button>
      </div>

      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: hasResume ? "var(--accent-dim)" : "var(--bg-surface)", border: `1px solid ${hasResume ? "var(--accent-border)" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📄</div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 500 }}>{hasResume ? "Resume uploaded" : "No resume uploaded"}</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{hasResume ? "Tien_Mai_Resume.pdf — visible on profile" : "Upload a PDF to show on your profile"}</p>
          </div>
          {hasResume && <a href="/api/resume/file" target="_blank" style={{ marginLeft: "auto", fontSize: 12, color: "var(--accent)", textDecoration: "none", fontFamily: "var(--font-mono)" }}>Preview →</a>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ padding: "8px 18px", borderRadius: 9, border: "none", background: "var(--accent)", color: "#0a0a0b", fontSize: 13, fontWeight: 500, cursor: uploading ? "default" : "pointer", fontFamily: "var(--font-display)", opacity: uploading ? 0.7 : 1 }}>
            {uploading ? "Uploading..." : hasResume ? "Replace PDF" : "Upload PDF"}
          </button>
          {hasResume && (
            <button onClick={handleDelete} style={{ padding: "8px 18px", borderRadius: 9, border: "1px solid var(--border)", background: "none", color: "#f87171", fontSize: 13, cursor: "pointer", fontFamily: "var(--font-display)" }}>Delete</button>
          )}
        </div>
        <input ref={fileRef} type="file" accept=".pdf" onChange={handleUpload} style={{ display: "none" }} />
      </div>
      {message && <p style={{ fontSize: 13, color: message.includes("success") ? "var(--accent)" : "#f87171" }}>{message}</p>}
    </div>
  );
}

// ─── Analytics Tab ─────────────────────────────────────────────────────────────

function AnalyticsTab({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid var(--accent)", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
    </div>
  );
  if (!data) return <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Failed to load analytics.</p>;

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const found = data.visitors_by_day.find(v => v.date === key);
    return { date: key, count: found?.count ?? 0, label: d.toLocaleDateString("en", { weekday: "short" }) };
  });
  const maxCount = Math.max(...last7.map(d => d.count), 1);
  const thisWeek = last7.reduce((a, b) => a + b.count, 0);

  return (
    <div>
      <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 20 }}>Analytics</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Visitors", value: data.total_visitors },
          { label: "Total Questions", value: data.total_messages },
          { label: "This Week", value: thisWeek },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px" }}>
            <p style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em", marginBottom: 8, textTransform: "uppercase" }}>{label}</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--font-display)" }}>{value}</p>
          </div>
        ))}
      </div>

      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px", marginBottom: 20 }}>
        <p style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em", marginBottom: 16, textTransform: "uppercase" }}>Visitors — Last 7 Days</p>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 88 }}>
          {last7.map(({ date, count, label }) => (
            <div key={date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 11, color: "var(--accent)", fontFamily: "var(--font-mono)", minHeight: 16 }}>{count > 0 ? count : ""}</span>
              <div style={{ width: "100%", height: `${Math.max((count / maxCount) * 52, count > 0 ? 4 : 2)}px`, background: count > 0 ? "var(--accent)" : "var(--border)", borderRadius: 4, transition: "height 0.3s" }} />
              <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px" }}>
        <p style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em", marginBottom: 16, textTransform: "uppercase" }}>Recent Questions</p>
        {data.recent_questions.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No questions yet.</p>
        ) : data.recent_questions.map((q, i) => (
          <div key={i} style={{ padding: "10px 0", borderBottom: i < data.recent_questions.length - 1 ? "1px solid var(--border)" : "none", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
            <p style={{ fontSize: 13, color: "var(--text)", flex: 1, lineHeight: 1.5 }}>{q.content}</p>
            <div style={{ flexShrink: 0, textAlign: "right" }}>
              <span style={{ fontSize: 10, color: "var(--accent)", fontFamily: "var(--font-mono)", display: "block", marginBottom: 2 }}>{q.source}</span>
              <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                {q.created_at ? new Date(q.created_at).toLocaleDateString("en", { month: "short", day: "numeric" }) : ""}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── AI Models Tab ─────────────────────────────────────────────────────────────

function AITab({ token }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newModel, setNewModel] = useState("");

  useEffect(() => {
    fetch("/api/admin/ai-settings", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setSettings(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  const persist = async (updates) => {
    setSaving(true);
    try {
      await fetch("/api/admin/ai-settings", { method: "PUT", headers: authHeaders(token), body: JSON.stringify(updates) });
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch (e) { alert("Save failed: " + e.message); }
    setSaving(false);
  };

  const selectModel = (model) => {
    const updated = { ...settings, active_model: model };
    setSettings(updated);
    persist({ active_model: model });
  };

  const removeModel = (model) => {
    if (settings.available_models.length <= 1) return;
    const models = settings.available_models.filter(m => m !== model);
    const active = model === settings.active_model ? models[0] : settings.active_model;
    const updated = { ...settings, available_models: models, active_model: active };
    setSettings(updated);
    persist({ available_models: models, active_model: active });
  };

  const addModel = () => {
    const m = newModel.trim();
    if (!m || settings.available_models.includes(m)) return;
    const models = [...settings.available_models, m];
    setSettings(prev => ({ ...prev, available_models: models }));
    persist({ available_models: models });
    setNewModel("");
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid var(--accent)", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
    </div>
  );
  if (!settings) return <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Failed to load AI settings.</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }}>AI Models</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {saving && <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Saving...</span>}
          {saved && <span style={{ fontSize: 12, color: "var(--accent)", fontFamily: "var(--font-mono)" }}>✓ Saved</span>}
        </div>
      </div>

      {/* Active model display */}
      <div style={{ background: "var(--accent-dim)", border: "1px solid var(--accent-border)", borderRadius: 14, padding: "16px 20px", marginBottom: 24 }}>
        <p style={{ fontSize: 10, color: "var(--accent)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em", marginBottom: 6 }}>ACTIVE MODEL</p>
        <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", fontFamily: "var(--font-mono)" }}>{settings.active_model}</p>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Used for chatbot replies and JD analysis</p>
      </div>

      {/* Model list */}
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>Click a model to set it as active:</p>
      <div style={{ display: "grid", gap: 8, marginBottom: 24 }}>
        {settings.available_models.map(model => (
          <div key={model}
            onClick={() => selectModel(model)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "13px 16px", borderRadius: 12, cursor: "pointer",
              border: `1px solid ${settings.active_model === model ? "var(--accent-border)" : "var(--border)"}`,
              background: settings.active_model === model ? "var(--accent-dim)" : "var(--bg-card)",
              transition: "all 0.15s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                border: `2px solid ${settings.active_model === model ? "var(--accent)" : "var(--border)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {settings.active_model === model && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)" }} />}
              </div>
              <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: settings.active_model === model ? "var(--accent)" : "var(--text)" }}>{model}</span>
            </div>
            {settings.available_models.length > 1 && (
              <button
                onClick={e => { e.stopPropagation(); removeModel(model); }}
                style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid var(--border)", background: "none", color: "#f87171", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                title="Remove model"
              >✕</button>
            )}
          </div>
        ))}
      </div>

      <Divider />
      <GroupLabel>Add New Model</GroupLabel>
      <Field label="Model ID (e.g. gemini-2.5-pro-exp)">
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={newModel}
            onChange={e => setNewModel(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addModel()}
            placeholder="gemini-..."
            style={{ ...inputStyle, flex: 1, fontFamily: "var(--font-mono)" }}
          />
          <button onClick={addModel} style={{ padding: "8px 16px", borderRadius: 9, border: "none", background: "var(--accent)", color: "#0a0a0b", fontSize: 13, cursor: "pointer", fontFamily: "var(--font-display)", flexShrink: 0 }}>Add</button>
        </div>
      </Field>
    </div>
  );
}

// ─── Job Tracker Tab ───────────────────────────────────────────────────────────

function JobTrackerTab({ token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingPw, setEditingPw] = useState({}); // {username: newPw}
  const [expandedJobs, setExpandedJobs] = useState(null);
  const [jobsJson, setJobsJson] = useState("");
  const [jobsSaving, setJobsSaving] = useState(false);
  const [jobsSaved, setJobsSaved] = useState(false);
  const [msg, setMsg] = useState("");

  const authH = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const loadUsers = () => {
    setLoading(true);
    fetch("/api/admin/jobtracker/users", { headers: authH })
      .then(r => r.json()).then(data => { setUsers(data); setLoading(false); });
  };

  useEffect(() => { loadUsers(); }, []);

  const addUser = async () => {
    if (!newUsername.trim() || !newPassword.trim()) return;
    setAdding(true);
    const res = await fetch("/api/admin/jobtracker/users", { method: "POST", headers: authH, body: JSON.stringify({ username: newUsername.trim(), password: newPassword }) });
    setAdding(false);
    if (res.ok) { setNewUsername(""); setNewPassword(""); loadUsers(); }
    else { const d = await res.json(); setMsg(d.detail || "Error"); }
  };

  const deleteUser = async (uname) => {
    if (!confirm(`Delete user "${uname}"?`)) return;
    await fetch(`/api/admin/jobtracker/users/${uname}`, { method: "DELETE", headers: authH });
    loadUsers();
  };

  const updatePw = async (uname) => {
    const pw = editingPw[uname];
    if (!pw) return;
    await fetch(`/api/admin/jobtracker/users/${uname}`, { method: "PUT", headers: authH, body: JSON.stringify({ password: pw }) });
    setEditingPw(p => ({ ...p, [uname]: "" }));
    setMsg(`Password updated for ${uname}`);
    setTimeout(() => setMsg(""), 2000);
  };

  const saveJobs = async (uname) => {
    setJobsSaving(true);
    try {
      const jobs = JSON.parse(jobsJson);
      if (!Array.isArray(jobs)) throw new Error("Must be a JSON array");
      await fetch(`/api/admin/jobtracker/jobs/${uname}`, { method: "PUT", headers: authH, body: JSON.stringify(jobs) });
      setJobsSaved(true); setTimeout(() => setJobsSaved(false), 2000);
    } catch (e) { setMsg("Invalid JSON: " + e.message); }
    setJobsSaving(false);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Job Tracker Users</h2>
        {msg && <span style={{ fontSize: 12, color: "var(--accent)", fontFamily: "var(--font-mono)" }}>{msg}</span>}
      </div>

      {/* Add user */}
      <GroupLabel>Add New User</GroupLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, marginBottom: 20 }}>
        <input placeholder="Username" value={newUsername} onChange={e => setNewUsername(e.target.value)}
          style={{ ...inputStyle, fontFamily: "var(--font-mono)" }} />
        <input placeholder="Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
          style={inputStyle} onKeyDown={e => e.key === "Enter" && addUser()} />
        <button onClick={addUser} disabled={adding} style={{ padding: "8px 16px", borderRadius: 9, border: "none", background: "var(--accent)", color: "#0a0a0b", fontSize: 13, cursor: "pointer", fontFamily: "var(--font-display)" }}>
          {adding ? "..." : "Add"}
        </button>
      </div>

      {/* User list */}
      <GroupLabel>Users</GroupLabel>
      {loading ? <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading...</p>
        : users.length === 0 ? <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No users yet.</p>
        : users.map(u => (
          <div key={u.username} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", marginBottom: 10, background: "var(--bg-card)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--accent)" }}>{u.username}</span>
                <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 8 }}>
                  {u.created_at ? new Date(u.created_at).toLocaleDateString("en") : ""}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setExpandedJobs(expandedJobs === u.username ? null : u.username); setJobsJson(""); setJobsSaved(false); }}
                  style={{ fontSize: 12, padding: "4px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                  {expandedJobs === u.username ? "Close" : "Jobs"}
                </button>
                <button onClick={() => deleteUser(u.username)}
                  style={{ fontSize: 12, padding: "4px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "none", color: "#ef4444", cursor: "pointer" }}>
                  Delete
                </button>
              </div>
            </div>

            {/* Change password */}
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <input placeholder="New password" type="password" value={editingPw[u.username] || ""}
                onChange={e => setEditingPw(p => ({ ...p, [u.username]: e.target.value }))}
                style={{ ...inputStyle, flex: 1, fontSize: 12 }} />
              <button onClick={() => updatePw(u.username)}
                style={{ fontSize: 12, padding: "6px 12px", borderRadius: 6, border: "none", background: "var(--accent)", color: "#0a0a0b", cursor: "pointer" }}>
                Change password
              </button>
            </div>

            {/* Jobs upload */}
            {expandedJobs === u.username && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>
                  Paste a JSON array of jobs (format: {`[{"title","url","company","loc","mode","month","year","status"}]`})
                </p>
                <textarea value={jobsJson} onChange={e => setJobsJson(e.target.value)} rows={6}
                  placeholder='[{"title":"...", "url":"...", "company":"...", "loc":"HCM", "mode":"On-site", "month":5, "year":2026, "status":"applied"}]'
                  style={{ ...inputStyle, width: "100%", resize: "vertical", fontFamily: "var(--font-mono)", fontSize: 11 }} />
                <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                  <button onClick={() => saveJobs(u.username)} disabled={jobsSaving}
                    style={{ fontSize: 12, padding: "6px 14px", borderRadius: 6, border: "none", background: "var(--accent)", color: "#0a0a0b", cursor: "pointer" }}>
                    {jobsSaving ? "Saving..." : "Save jobs"}
                  </button>
                  {jobsSaved && <span style={{ fontSize: 12, color: "var(--accent)", alignSelf: "center" }}>✓ Saved</span>}
                </div>
              </div>
            )}
          </div>
        ))}

      <Divider />
      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
        Each user accesses at: <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>tienmai.space/jobtracker/username</span>
      </p>
    </div>
  );
}

// ─── Settings Tab ──────────────────────────────────────────────────────────────

function parseUA(ua) {
  if (!ua) return "Unknown";
  let os = "Unknown";
  if (/Windows/.test(ua))     os = "Windows";
  else if (/iPhone/.test(ua)) os = "iPhone";
  else if (/iPad/.test(ua))   os = "iPad";
  else if (/Android/.test(ua)) os = "Android";
  else if (/Mac/.test(ua))    os = "macOS";
  else if (/Linux/.test(ua))  os = "Linux";
  let browser = "";
  if (/Edg\//.test(ua))        browser = "Edge";
  else if (/OPR\//.test(ua))   browser = "Opera";
  else if (/Chrome\//.test(ua)) browser = "Chrome";
  else if (/Firefox\//.test(ua)) browser = "Firefox";
  else if (/Safari\//.test(ua))  browser = "Safari";
  return [browser, os].filter(Boolean).join(" / ");
}

function SettingsTab({ token, onLogout }) {
  const [username, setUsername] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null); // { text, error }
  const [sessions, setSessions] = useState(null);

  const inputStyle = { fontSize: 13, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)", fontFamily: "var(--font-display)", outline: "none", width: "100%", boxSizing: "border-box" };

  useEffect(() => {
    fetch("/api/admin/sessions", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setSessions).catch(() => setSessions([]));
  }, [token]);

  const handleSave = async () => {
    if (!currentPw) { setMsg({ text: "Enter your current password.", error: true }); return; }
    if (!newPw) { setMsg({ text: "Enter a new password.", error: true }); return; }
    if (newPw !== confirmPw) { setMsg({ text: "New passwords do not match.", error: true }); return; }

    // Verify current password via dedicated endpoint (avoids triggering the login rate-limiter)
    setSaving(true); setMsg(null);
    try {
      const verifyRes = await fetch("/api/admin/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password: currentPw })
      });
      if (!verifyRes.ok) { setMsg({ text: "Current password is incorrect.", error: true }); setSaving(false); return; }

      const body = { new_password: newPw };
      if (username) body.new_username = username;
      const res = await fetch("/api/admin/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error();
      setMsg({ text: "Updated. Signing you out...", error: false });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setTimeout(() => onLogout(), 2000);
    } catch {
      setMsg({ text: "Something went wrong.", error: true });
    }
    setSaving(false);
  };

  return (
    <div style={{ maxWidth: 440 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Settings</h2>

      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 22px", marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 16 }}>Change credentials</p>

        <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 5 }}>New username <span style={{ color: "var(--text-muted)" }}>(leave blank to keep current)</span></label>
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Keep current username" style={{ ...inputStyle, marginBottom: 14 }} />

        <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 5 }}>Current password <span style={{ color: "#f87171" }}>*</span></label>
        <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} style={{ ...inputStyle, marginBottom: 14 }} />

        <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 5 }}>New password <span style={{ color: "#f87171" }}>*</span></label>
        <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} style={{ ...inputStyle, marginBottom: 14 }} />

        <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 5 }}>Confirm new password <span style={{ color: "#f87171" }}>*</span></label>
        <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSave()}
          style={{ ...inputStyle, marginBottom: 16 }} />

        {msg && <p style={{ fontSize: 12, color: msg.error ? "#f87171" : "var(--accent)", marginBottom: 12 }}>{msg.text}</p>}

        <button onClick={handleSave} disabled={saving}
          style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "var(--accent)", color: "#0a0a0b", fontSize: 13, cursor: saving ? "default" : "pointer", opacity: saving ? 0.6 : 1, fontFamily: "var(--font-display)" }}>
          {saving ? "Saving..." : "Update"}
        </button>
      </div>

      {/* Login history */}
      <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: "var(--text)" }}>Login history</h3>
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        {sessions === null
          ? <p style={{ fontSize: 13, color: "var(--text-muted)", padding: "16px 18px" }}>Loading...</p>
          : sessions.length === 0
          ? <p style={{ fontSize: 13, color: "var(--text-muted)", padding: "16px 18px" }}>No login records yet.</p>
          : sessions.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderBottom: i < sessions.length - 1 ? "1px solid var(--border)" : "none" }}>
              <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 5, background: s.success ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", color: s.success ? "#4ade80" : "#f87171", flexShrink: 0 }}>
                {s.success ? "OK" : "FAIL"}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text)" }}>{s.ip}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{parseUA(s.user_agent)}</div>
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0, textAlign: "right" }}>
                {s.created_at ? new Date(s.created_at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default function AdminApp() {
  const { token, login, logout } = useAuth();
  if (!token) return <LoginPage onLogin={login} />;
  return <Dashboard token={token} onLogout={logout} />;
}
