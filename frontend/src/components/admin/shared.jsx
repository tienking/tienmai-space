// Shared UI primitives for the Admin dashboard

export const inputStyle = {
  width: "100%", background: "var(--bg-card)", border: "1px solid var(--border)",
  borderRadius: 9, padding: "9px 12px", color: "var(--text)",
  fontSize: 13, fontFamily: "var(--font-display)", outline: "none",
  transition: "border-color 0.2s", boxSizing: "border-box",
};

export function authHeaders(token) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export function loadGoogleFont(fontName) {
  const id = `gf-${fontName.replace(/ /g, "-")}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, "+")}:wght@400;500;700&display=swap`;
  document.head.appendChild(link);
}

export function TabCard({ title, children, onSave, saving }) {
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

export function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

export function SmallBtn({ onClick, children, disabled, danger }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid var(--border)", background: "none", color: danger ? "#f87171" : "var(--text-muted)", cursor: disabled ? "default" : "pointer", fontSize: 12, opacity: disabled ? 0.3 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {children}
    </button>
  );
}

export function Divider() {
  return <div style={{ height: "1px", background: "var(--border)", marginBottom: 20 }} />;
}

export function GroupLabel({ children }) {
  return <p style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em", marginBottom: 12, textTransform: "uppercase" }}>{children}</p>;
}

export function ColorPicker({ label, value, onChange }) {
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
