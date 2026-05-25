import { useState, useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import { authHeaders } from "./components/admin/shared";
import LoginPage from "./components/admin/LoginPage";
import BasicTab from "./components/admin/tabs/BasicTab";
import AboutTab from "./components/admin/tabs/AboutTab";
import SkillsTab from "./components/admin/tabs/SkillsTab";
import ExperienceTab from "./components/admin/tabs/ExperienceTab";
import EducationTab from "./components/admin/tabs/EducationTab";
import ListTab from "./components/admin/tabs/ListTab";
import CertificationTab from "./components/admin/tabs/CertificationTab";
import GalleryTab from "./components/admin/tabs/GalleryTab";
import ResumeTab from "./components/admin/tabs/ResumeTab";
import ThemeTab from "./components/admin/tabs/ThemeTab";
import FontsTab from "./components/admin/tabs/FontsTab";
import AnalyticsTab from "./components/admin/tabs/AnalyticsTab";
import AITab from "./components/admin/tabs/AITab";
import JobTrackerTab from "./components/admin/tabs/JobTrackerTab";
import SettingsTab from "./components/admin/tabs/SettingsTab";

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
    { id: "basic",          icon: "👤", label: "Basic Info" },
    { id: "about",          icon: "📝", label: "About" },
    { id: "skills",         icon: "⚡", label: "Skills" },
    { id: "experience",     icon: "💼", label: "Experience" },
    { id: "education",      icon: "🎓", label: "Education" },
    { id: "projects",       icon: "🗂️", label: "Projects" },
    { id: "certifications", icon: "🏅", label: "Certifications" },
    { id: "gallery",        icon: "🖼️", label: "Gallery" },
    { id: "resume",         icon: "📄", label: "Resume" },
    { id: "theme",          icon: "🎨", label: "Theme" },
    { id: "fonts",          icon: "✍️", label: "Fonts" },
    { id: "analytics",      icon: "📊", label: "Analytics" },
    { id: "ai",             icon: "🤖", label: "AI Models" },
    { id: "jobtracker",     icon: "📋", label: "Job Tracker" },
    { id: "settings",       icon: "⚙️", label: "Settings" },
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
          {activeTab === "basic"          && <BasicTab profile={profile} onSave={save} saving={saving} />}
          {activeTab === "about"          && <AboutTab profile={profile} onSave={save} saving={saving} />}
          {activeTab === "skills"         && <SkillsTab profile={profile} onSave={save} saving={saving} />}
          {activeTab === "experience"     && <ExperienceTab items={profile.experiences || []} onSave={save} saving={saving} />}
          {activeTab === "education"      && <EducationTab items={profile.educations || []} onSave={save} saving={saving} />}
          {activeTab === "projects"       && <ListTab title="Projects" field="projects" items={profile.projects || []} onSave={save} saving={saving} fields={["title", "tag", "description", "link"]} />}
          {activeTab === "certifications" && <CertificationTab items={profile.certifications || []} onSave={save} saving={saving} />}
          {activeTab === "gallery"        && <GalleryTab gallery={profile.gallery || []} experiences={profile.experiences || []} galleryVisible={profile.galleryVisible !== false} onSave={saveGallery} onSaveProfile={save} saving={saving} />}
          {activeTab === "resume"         && <ResumeTab token={token} resumeVisible={profile.resumeVisible !== false} onSave={save} saving={saving} />}
          {activeTab === "theme"          && <ThemeTab theme={profile.theme || {}} onSave={save} saving={saving} />}
          {activeTab === "fonts"          && <FontsTab fonts={profile.fonts || {}} onSave={save} saving={saving} />}
          {activeTab === "analytics"      && <AnalyticsTab token={token} />}
          {activeTab === "ai"             && <AITab token={token} />}
          {activeTab === "jobtracker"     && <JobTrackerTab token={token} />}
          {activeTab === "settings"       && <SettingsTab token={token} onLogout={onLogout} />}
        </div>
      </div>
    </div>
  );
}

export default function AdminApp() {
  const { token, login, logout } = useAuth();
  if (!token) return <LoginPage onLogin={login} />;
  return <Dashboard token={token} onLogout={logout} />;
}
