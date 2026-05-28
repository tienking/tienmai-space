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
import AnalyticsTab from "./components/admin/tabs/AnalyticsTab";
import AITab from "./components/admin/tabs/AITab";
import JobTrackerTab from "./components/admin/tabs/JobTrackerTab";
import SettingsTab from "./components/admin/tabs/SettingsTab";

const ADMIN_CSS = `
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Fixed chrome ── */
  .admin-header {
    padding: 14px 24px; flex-shrink: 0;
    border-bottom: 1px solid var(--border);
    background: var(--bg-surface);
    display: flex; align-items: center; justify-content: space-between;
  }

  /* ── Split-pane body ── */
  .admin-body {
    display: flex; width: 100%; max-width: 1000px; margin: 0 auto;
    flex: 1; overflow: hidden; padding: 0 24px;
  }

  .admin-nav {
    width: 160px; flex-shrink: 0; margin-right: 24px;
    padding: 24px 0;
    overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none;
  }
  .admin-nav::-webkit-scrollbar { display: none; }

  .admin-nav-btn {
    display: flex; align-items: center; gap: 8px;
    width: 100%; text-align: left;
    padding: 9px 12px; border-radius: 10px; border: none;
    font-size: 13px; cursor: pointer;
    font-family: var(--font-display);
    margin-bottom: 4px; transition: all 0.15s;
  }

  /* content column — does NOT scroll; inner TabCard/scrollPane handles it */
  .admin-content {
    flex: 1; min-width: 0; min-height: 0;
    display: flex; flex-direction: column;
    overflow: hidden;
  }

  .admin-view-link { display: inline; }

  /* ── Mobile: stacked, horizontal tab strip ── */
  @media (max-width: 640px) {
    .admin-header { padding: 10px 16px; }

    .admin-body { flex-direction: column; padding: 0; overflow: hidden; }

    .admin-nav {
      width: 100%; margin-right: 0; padding: 8px 12px;
      display: flex; flex-direction: row;
      overflow-x: auto; overflow-y: hidden;
      border-bottom: 1px solid var(--border);
      scrollbar-width: none; -ms-overflow-style: none;
    }
    .admin-nav::-webkit-scrollbar { display: none; }

    .admin-nav-btn {
      width: auto; flex-shrink: 0;
      margin-bottom: 0; margin-right: 4px;
      white-space: nowrap; border-radius: 20px; padding: 7px 12px;
    }

    /* mobile horizontal padding lives here so TabCard header aligns with nav */
    .admin-content { padding: 0 16px; }

    .admin-view-link { display: none; }
  }
`;

// Scroll pane for tabs that don't use TabCard (no pinned header needed)
const SP = { flex: 1, minHeight: 0, overflowY: "auto", padding: "24px 10px 40px 0" };

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
    { id: "analytics",      icon: "📊", label: "Analytics" },
    { id: "ai",             icon: "🤖", label: "AI Models" },
    { id: "jobtracker",     icon: "📋", label: "Job Tracker" },
    { id: "settings",       icon: "⚙️", label: "Settings" },
  ];

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg)" }}>
      <style>{ADMIN_CSS}</style>

      <div className="admin-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)", letterSpacing: "0.1em" }}>ADMIN</p>
          <span style={{ color: "var(--border)" }}>·</span>
          <p style={{ fontSize: 14, fontWeight: 500 }}>tienmai.space</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {saved && <span style={{ fontSize: 12, color: "var(--accent)", fontFamily: "var(--font-mono)" }}>✓ Saved</span>}
          <a href="/" target="_blank" className="admin-view-link" style={{ fontSize: 12, color: "var(--text-muted)", textDecoration: "none" }}>View site →</a>
          <button onClick={onLogout} style={{ fontSize: 12, color: "var(--text-muted)", background: "none", border: "1px solid var(--border)", borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontFamily: "var(--font-display)" }}>Sign out</button>
        </div>
      </div>

      <div className="admin-body">
        <nav className="admin-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="admin-nav-btn"
              style={{
                background: activeTab === tab.id ? "var(--accent-dim)" : "none",
                color: activeTab === tab.id ? "var(--accent)" : "var(--text-muted)",
              }}
            >
              <span style={{ width: 18, flexShrink: 0, textAlign: "center", fontSize: 14 }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-content">
          {/* TabCard tabs — scroll is internal to TabCard */}
          {activeTab === "basic"          && <BasicTab profile={profile} onSave={save} saving={saving} />}
          {activeTab === "about"          && <AboutTab profile={profile} onSave={save} saving={saving} />}
          {activeTab === "skills"         && <SkillsTab profile={profile} onSave={save} saving={saving} />}
          {activeTab === "experience"     && <ExperienceTab items={profile.experiences || []} onSave={save} saving={saving} />}
          {activeTab === "education"      && <EducationTab items={profile.educations || []} onSave={save} saving={saving} />}
          {activeTab === "projects"       && <ListTab title="Projects" field="projects" items={profile.projects || []} onSave={save} saving={saving} fields={["title", "tag", "description", "link"]} />}
          {activeTab === "certifications" && <CertificationTab items={profile.certifications || []} onSave={save} saving={saving} />}
          {activeTab === "gallery"        && <GalleryTab gallery={profile.gallery || []} experiences={profile.experiences || []} galleryVisible={profile.galleryVisible !== false} onSave={saveGallery} onSaveProfile={save} saving={saving} />}
          {/* Non-TabCard tabs — wrapped in a scroll pane so scrollbar starts at top of content */}
          {activeTab === "resume"      && <div style={SP}><ResumeTab token={token} resumeVisible={profile.resumeVisible !== false} onSave={save} saving={saving} /></div>}
          {activeTab === "analytics"   && <div style={SP}><AnalyticsTab token={token} /></div>}
          {activeTab === "ai"          && <div style={SP}><AITab token={token} /></div>}
          {activeTab === "jobtracker"  && <div style={SP}><JobTrackerTab token={token} /></div>}
          {activeTab === "settings"    && <div style={SP}><SettingsTab token={token} onLogout={onLogout} /></div>}
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
