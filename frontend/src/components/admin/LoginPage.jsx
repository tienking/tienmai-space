import { useState, useEffect } from "react";
import { inputStyle } from "./shared";

export default function LoginPage({ onLogin }) {
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
          style={{ width: "100%", padding: "11px", borderRadius: 10, border: "none", background: isLocked ? "var(--border)" : "var(--accent)", color: "#fff", fontSize: 14, fontWeight: 500, cursor: (loading || isLocked) ? "default" : "pointer", fontFamily: "var(--font-display)", opacity: loading ? 0.7 : 1 }}>
          {loading ? "Signing in..." : isLocked ? `Locked (${mins}:${secs})` : "Sign in"}
        </button>
      </div>
    </div>
  );
}
