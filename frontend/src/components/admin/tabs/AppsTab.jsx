import { useState, useEffect } from "react";

// Web apps deployed under tienmai.space (one repo + backend each, see STRUCTURE.md).
// statusUrl: any API route of that backend — 2xx/401/403 means the backend answered.
const APPS = [
  {
    id: "portfolio", icon: "🔥", name: "Portfolio",
    description: "Personal portfolio + AI chatbot + this admin CMS.",
    url: "/", statusUrl: "/api/profile",
  },
  {
    id: "jobtracker", icon: "💼", name: "Job Tracker",
    description: "Multi-user job application tracker with AI assistant (Vietnamese UI).",
    url: "/jobtracker/", adminUrl: "/jobtracker/admin", statusUrl: "/api/jtadmin/users",
  },
  {
    id: "ai-dashboard", icon: "📈", name: "AI Dashboard",
    description: "Upload Excel/CSV → AI-generated dashboard + data chatbot.",
    url: "/projects/ai-dashboard/", statusUrl: "/api/ai-dashboard/health",
  },
  {
    id: "crypto-news", icon: "🪙", name: "Crypto News",
    description: "Crypto news aggregated from RSS feeds, with market chart + AI chat.",
    url: "/projects/crypto-news/", adminUrl: "/projects/crypto-news/admin", statusUrl: "/api/crypto-news/health",
  },
];

const STATUS_STYLE = {
  checking: { color: "var(--text-muted)", label: "Checking…" },
  online:   { color: "#4ade80",           label: "Online" },
  offline:  { color: "#f87171",           label: "Offline" },
};

async function checkStatus(url) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    return res.ok || res.status === 401 || res.status === 403 ? "online" : "offline";
  } catch { return "offline"; }
}

const btn = (primary) => ({
  padding: "7px 14px", borderRadius: 9, fontSize: 12, fontWeight: 500, textDecoration: "none",
  fontFamily: "var(--font-display)", display: "inline-flex", alignItems: "center", gap: 4,
  border: primary ? "none" : "1px solid var(--border)",
  background: primary ? "var(--accent)" : "none",
  color: primary ? "#fff" : "var(--text-muted)",
});

export default function AppsTab() {
  const [status, setStatus] = useState(() => Object.fromEntries(APPS.map(a => [a.id, "checking"])));

  const refresh = () => {
    setStatus(Object.fromEntries(APPS.map(a => [a.id, "checking"])));
    APPS.forEach(a => checkStatus(a.statusUrl).then(s => setStatus(prev => ({ ...prev, [a.id]: s }))));
  };

  useEffect(refresh, []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Live Apps</h2>
        <button onClick={refresh} style={{ fontSize: 12, color: "var(--text-muted)", background: "none", border: "1px solid var(--border)", borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontFamily: "var(--font-display)" }}>↻ Refresh</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
        {APPS.map(app => {
          const st = STATUS_STYLE[status[app.id]];
          return (
            <div key={app.id} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <p style={{ fontSize: 15, fontWeight: 600 }}><span style={{ marginRight: 8 }}>{app.icon}</span>{app.name}</p>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: st.color, fontFamily: "var(--font-mono)" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: st.color }} />{st.label}
                </span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 10, flex: 1 }}>{app.description}</p>
              <p style={{ fontSize: 11, color: "var(--text-muted)", opacity: 0.7, fontFamily: "var(--font-mono)", marginBottom: 14, wordBreak: "break-all" }}>tienmai.space{app.url}</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <a href={app.url} target="_blank" rel="noreferrer" style={btn(true)}>Open ↗</a>
                {app.adminUrl && <a href={app.adminUrl} target="_blank" rel="noreferrer" style={btn(false)}>Admin ↗</a>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
