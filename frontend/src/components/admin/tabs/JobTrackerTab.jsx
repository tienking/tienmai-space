import { useState, useEffect } from "react";
import { GroupLabel, Divider, inputStyle } from "../shared";

export default function JobTrackerTab({ token }) {
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
