import { useState, useEffect } from "react";

function parseUA(ua) {
  if (!ua) return "Unknown";
  let os = "Unknown";
  if (/Windows/.test(ua))      os = "Windows";
  else if (/iPhone/.test(ua))  os = "iPhone";
  else if (/iPad/.test(ua))    os = "iPad";
  else if (/Android/.test(ua)) os = "Android";
  else if (/Mac/.test(ua))     os = "macOS";
  else if (/Linux/.test(ua))   os = "Linux";
  let browser = "";
  if (/Edg\//.test(ua))         browser = "Edge";
  else if (/OPR\//.test(ua))    browser = "Opera";
  else if (/Chrome\//.test(ua)) browser = "Chrome";
  else if (/Firefox\//.test(ua)) browser = "Firefox";
  else if (/Safari\//.test(ua)) browser = "Safari";
  return [browser, os].filter(Boolean).join(" / ");
}

export default function SettingsTab({ token, onLogout }) {
  const [username, setUsername] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null); // { text, error }
  const [sessions, setSessions] = useState(null);

  const inputStyle = {
    fontSize: 13, padding: "8px 12px", borderRadius: 8,
    border: "1px solid var(--border)", background: "var(--bg-card)",
    color: "var(--text)", fontFamily: "var(--font-display)", outline: "none",
    width: "100%", boxSizing: "border-box",
  };

  useEffect(() => {
    fetch("/api/admin/sessions", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setSessions).catch(() => setSessions([]));
  }, [token]);

  const handleSave = async () => {
    if (!currentPw) { setMsg({ text: "Enter your current password.", error: true }); return; }
    if (!newPw)     { setMsg({ text: "Enter a new password.", error: true }); return; }
    if (newPw !== confirmPw) { setMsg({ text: "New passwords do not match.", error: true }); return; }

    // Verify current password via dedicated endpoint (avoids triggering the login rate-limiter)
    setSaving(true); setMsg(null);
    try {
      const verifyRes = await fetch("/api/admin/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password: currentPw }),
      });
      if (!verifyRes.ok) { setMsg({ text: "Current password is incorrect.", error: true }); setSaving(false); return; }

      const body = { new_password: newPw };
      if (username) body.new_username = username;
      const res = await fetch("/api/admin/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
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

        <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 5 }}>
          New username <span style={{ color: "var(--text-muted)" }}>(leave blank to keep current)</span>
        </label>
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Keep current username"
          style={{ ...inputStyle, marginBottom: 14 }} />

        <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 5 }}>
          Current password <span style={{ color: "#f87171" }}>*</span>
        </label>
        <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)}
          style={{ ...inputStyle, marginBottom: 14 }} />

        <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 5 }}>
          New password <span style={{ color: "#f87171" }}>*</span>
        </label>
        <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
          style={{ ...inputStyle, marginBottom: 14 }} />

        <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 5 }}>
          Confirm new password <span style={{ color: "#f87171" }}>*</span>
        </label>
        <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSave()}
          style={{ ...inputStyle, marginBottom: 16 }} />

        {msg && (
          <p style={{ fontSize: 12, color: msg.error ? "#f87171" : "var(--accent)", marginBottom: 12 }}>{msg.text}</p>
        )}

        <button onClick={handleSave} disabled={saving}
          style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "var(--accent)", color: "#fff", fontSize: 13, cursor: saving ? "default" : "pointer", opacity: saving ? 0.6 : 1, fontFamily: "var(--font-display)" }}>
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
