import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inp = { fontSize: 13, padding: "8px 10px", borderRadius: 6, border: "0.5px solid #ccc", width: "100%", boxSizing: "border-box", outline: "none", fontFamily: "inherit" };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await fetch("/api/jobtracker/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
      if (!res.ok) { setError("Sai username hoặc password."); return; }
      const data = await res.json();
      localStorage.setItem("jt_token", data.access_token);
      window.location.href = `/jobtracker/${data.username}`;
    } catch { setError("Không thể kết nối server."); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f3", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <div style={{ width: 340, background: "#fff", borderRadius: 12, border: "0.5px solid #e0e0dc", padding: "32px 28px" }}>
        <h1 style={{ fontSize: 18, fontWeight: 500, marginBottom: 4, color: "#1a1a18" }}>Job Tracker</h1>
        <p style={{ fontSize: 12, color: "#888", marginBottom: 24 }}>Đăng nhập để xem danh sách job của bạn.</p>
        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: 12, color: "#555", display: "block", marginBottom: 4 }}>Username</label>
          <input value={username} onChange={e => setUsername(e.target.value)} required autoFocus style={{ ...inp, marginBottom: 12 }} />
          <label style={{ fontSize: 12, color: "#555", display: "block", marginBottom: 4 }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ ...inp, marginBottom: error ? 10 : 16 }} />
          {error && <p style={{ fontSize: 12, color: "#c00", marginBottom: 12 }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ width: "100%", padding: 9, borderRadius: 6, border: "none", background: "#1a1a18", color: "#fff", fontSize: 13, cursor: loading ? "default" : "pointer", opacity: loading ? 0.6 : 1, fontFamily: "inherit" }}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}
