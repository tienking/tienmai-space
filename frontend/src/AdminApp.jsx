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

function useAuth() {
  const [token, setToken] = useState(localStorage.getItem("admin_token"));
  const login = async (username, password) => {
    const res = await fetch(`${API}/api/admin/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
    if (!res.ok) throw new Error("Invalid credentials");
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

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try { await onLogin(username, password); }
    catch { setError("Invalid username or password"); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div style={{ width: 360, background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 32 }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)", letterSpacing: "0.1em", marginBottom: 8 }}>ADMIN</p>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: 4 }}>Sign in</h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 28 }}>tienmai.space dashboard</p>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Username</label>
          <input value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} style={inputStyle} />
        </div>
        {error && <p style={{ fontSize: 13, color: "#f87171", marginBottom: 14 }}>{error}</p>}
        <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", padding: "11px", borderRadius: 10, border: "none", background: "var(--accent)", color: "#0a0a0b", fontSize: 14, fontWeight: 500, cursor: loading ? "default" : "pointer", fontFamily: "var(--font-display)", opacity: loading ? 0.7 : 1 }}>
          {loading ? "Signing in..." : "Sign in"}
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
      await fetch("/api/admin/gallery", { method: "PUT", headers: authHeaders(token), body: JSON.stringify(gallery) });
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
    { id: "basic", label: "Basic Info" },
    { id: "resume", label: "📄 Resume" },
    { id: "about", label: "About" },
    { id: "skills", label: "Skills" },
    { id: "experience", label: "Experience" },
    { id: "education", label: "Education" },
    { id: "projects", label: "Projects" },
    { id: "gallery", label: "Gallery" },
    { id: "theme", label: "🎨 Theme" },
    { id: "fonts", label: "✦ Fonts" },
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
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 12px", borderRadius: 10, border: "none", background: activeTab === tab.id ? "var(--accent-dim)" : "none", color: activeTab === tab.id ? "var(--accent)" : "var(--text-muted)", fontSize: 13, cursor: "pointer", fontFamily: "var(--font-display)", marginBottom: 4, transition: "all 0.15s" }}>{tab.label}</button>
          ))}
        </div>

        <div style={{ flex: 1 }}>
          {activeTab === "basic" && <BasicTab profile={profile} onSave={save} saving={saving} />}
          {activeTab === "about" && <AboutTab profile={profile} onSave={save} saving={saving} />}
          {activeTab === "skills" && <SkillsTab profile={profile} onSave={save} saving={saving} />}
          {activeTab === "experience" && <ListTab title="Experience" field="experiences" items={profile.experiences || []} onSave={save} saving={saving} fields={["company", "role", "period", "description"]} />}
          {activeTab === "education" && <ListTab title="Education" field="educations" items={profile.educations || []} onSave={save} saving={saving} fields={["school", "degree", "period"]} />}
          {activeTab === "projects" && <ListTab title="Projects" field="projects" items={profile.projects || []} onSave={save} saving={saving} fields={["title", "tag", "description", "link"]} />}
          {activeTab === "gallery" && <GalleryTab gallery={profile.gallery || []} onSave={saveGallery} saving={saving} />}
          {activeTab === "resume" && <ResumeTab token={token} />}
          {activeTab === "theme" && <ThemeTab theme={profile.theme || {}} onSave={save} saving={saving} />}
          {activeTab === "fonts" && <FontsTab fonts={profile.fonts || {}} onSave={save} saving={saving} />}
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
    { key: "labelGallery", label: "GALLERY label" },
  ];
  const sectionContentColors = [
    { key: "sectionAbout", label: "About content" },
    { key: "sectionSkills", label: "Skills content" },
    { key: "sectionExperience", label: "Experience content" },
    { key: "sectionEducation", label: "Education content" },
    { key: "sectionProjects", label: "Projects content" },
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
  const [form, setForm] = useState({ name: profile.name || "", title: profile.title || "", location: profile.location || "", email: profile.email || "", github: profile.github || "", gitlab: profile.gitlab || "", linkedin: profile.linkedin || "", avatar: profile.avatar || "", openToWork: profile.openToWork || false });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <TabCard title="Basic Info" onSave={() => onSave(form)} saving={saving}>
      {[["name", "Name"], ["title", "Title / Headline"], ["location", "Location"], ["email", "Email"], ["github", "GitHub URL"], ["gitlab", "GitLab URL"], ["linkedin", "LinkedIn URL"], ["avatar", "Avatar URL (Cloudinary)"]].map(([key, label]) => (
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
  const [skills, setSkills] = useState((profile.skills || []).join(", "));
  return (
    <TabCard title="Skills" onSave={() => onSave({ skills: skills.split(",").map(s => s.trim()).filter(Boolean) })} saving={saving}>
      <Field label="Skills (comma separated)"><textarea value={skills} onChange={e => setSkills(e.target.value)} rows={4} style={{ ...inputStyle, resize: "vertical" }} /></Field>
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>Example: Python, SQL, Power BI, React</p>
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

function GalleryTab({ gallery, onSave, saving }) {
  const [images, setImages] = useState(gallery);
  const [newUrl, setNewUrl] = useState("");
  const add = () => { if (!newUrl.trim()) return; setImages(p => [...p, newUrl.trim()]); setNewUrl(""); };
  const remove = i => setImages(p => p.filter((_, idx) => idx !== i));
  const moveUp = i => { if (i === 0) return; const l = [...images];[l[i - 1], l[i]] = [l[i], l[i - 1]]; setImages(l); };
  const moveDown = i => { if (i === images.length - 1) return; const l = [...images];[l[i], l[i + 1]] = [l[i + 1], l[i]]; setImages(l); };

  return (
    <TabCard title="Gallery" onSave={() => onSave(images)} saving={saving}>
      <Field label="Add image URL (Cloudinary)">
        <div style={{ display: "flex", gap: 8 }}>
          <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://res.cloudinary.com/..." style={{ ...inputStyle, flex: 1 }} onKeyDown={e => e.key === "Enter" && add()} />
          <button onClick={add} style={{ padding: "8px 16px", borderRadius: 9, border: "none", background: "var(--accent)", color: "#0a0a0b", fontSize: 13, cursor: "pointer", fontFamily: "var(--font-display)", flexShrink: 0 }}>Add</button>
        </div>
      </Field>
      <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
        {images.map((url, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px" }}>
            <img src={url} alt="" style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
            <p style={{ flex: 1, fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{url}</p>
            <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
              <SmallBtn onClick={() => moveUp(i)} disabled={i === 0}>↑</SmallBtn>
              <SmallBtn onClick={() => moveDown(i)} disabled={i === images.length - 1}>↓</SmallBtn>
              <SmallBtn onClick={() => remove(i)} danger>✕</SmallBtn>
            </div>
          </div>
        ))}
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

function ResumeTab({ token }) {
  const [hasResume, setHasResume] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
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

export default function AdminApp() {
  const { token, login, logout } = useAuth();
  if (!token) return <LoginPage onLogin={login} />;
  return <Dashboard token={token} onLogout={logout} />;
}
