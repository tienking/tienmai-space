// Shared UI primitives for the portfolio page

export const linkStyle = {
  fontSize: 12, color: "var(--text-muted)", background: "var(--bg-card)",
  border: "1px solid var(--border)", borderRadius: 8, padding: "5px 12px",
  textDecoration: "none", fontFamily: "var(--font-mono)",
};

export function Avatar({ name, avatar }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: 176, height: 176, borderRadius: "50%", background: "var(--accent-dim)",
      border: "2px solid var(--accent-border)", overflow: "hidden", flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 28, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--font-display)",
    }}>
      {avatar ? <img src={avatar} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
    </div>
  );
}

export function Section({ title, children, labelColor, lineColor }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <p style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: labelColor || "var(--text-dim)", letterSpacing: "0.12em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{title}</p>
        <div style={{ flex: 1, height: "1px", background: lineColor || "var(--border)" }} />
      </div>
      {children}
    </div>
  );
}

export function Card({ children, bg }) {
  return (
    <div style={{ background: bg || "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "16px 18px", marginBottom: 10, transition: "border-color 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border-hover)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
    >{children}</div>
  );
}

export function isCertExpired(dateStr) {
  if (!dateStr) return false;
  const match = dateStr.match(/Expires?\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/i);
  if (!match) return false;
  const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
  const expMonth = months[match[1]];
  const expYear = parseInt(match[2]);
  const now = new Date();
  return expYear < now.getFullYear() || (expYear === now.getFullYear() && expMonth < now.getMonth());
}
