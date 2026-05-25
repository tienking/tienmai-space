import { useState } from "react";
import { Section, Card, isCertExpired } from "./shared";

export default function CertificationsSection({ certifications, t }) {
  const [expanded, setExpanded] = useState(false);
  const sorted = [...certifications].sort((a, b) => {
    const getYear = s => parseInt((s || "").match(/\d{4}/)?.[0] || "0");
    const getMonth = s => {
      const months = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
      return months[(s || "").match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/)?.[0]] || 0;
    };
    const yearDiff = getYear(b.date) - getYear(a.date);
    return yearDiff !== 0 ? yearDiff : getMonth(b.date) - getMonth(a.date);
  });
  const visible = expanded ? sorted : sorted.slice(0, 5);

  return (
    <Section title="Licenses & Certifications" labelColor={t.labelCertifications} lineColor={t.lineColor}>
      {visible.map((cert, i) => (
        <Card key={i} bg={isCertExpired(cert.date) ? (t.expiredCertBg || "#2d1515") : undefined}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: "var(--accent-dim)", border: "1px solid var(--accent-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🎓</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: t.sectionCertifications || "var(--text)" }}>{cert.name}</p>
                  <p style={{ fontSize: 13, color: "var(--accent)", fontFamily: "var(--font-mono)", marginTop: 2 }}>{cert.issuer}</p>
                </div>
                {cert.date && <span style={{ fontSize: 11, color: t.textMuted || "var(--text-dim)", fontFamily: "var(--font-mono)", flexShrink: 0, marginLeft: 12 }}>{cert.date}</span>}
              </div>
              {cert.credentialId && <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Credential ID: {cert.credentialId}</p>}
              {cert.link && <a href={cert.link} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "var(--accent)", marginTop: 6, display: "inline-block" }}>Show credential →</a>}
            </div>
          </div>
        </Card>
      ))}
      {sorted.length > 5 && (
        <button onClick={() => setExpanded(p => !p)} style={{
          width: "100%", padding: "10px", borderRadius: 10,
          border: "1px solid var(--border)", background: "none",
          color: "var(--accent)", fontSize: 13, cursor: "pointer",
          fontFamily: "var(--font-display)", transition: "border-color 0.2s", marginTop: 4,
        }}
          onMouseEnter={e => e.target.style.borderColor = "var(--accent-border)"}
          onMouseLeave={e => e.target.style.borderColor = "var(--border)"}
        >
          {expanded ? "↑ Show less" : `↓ Show all ${sorted.length} certifications`}
        </button>
      )}
    </Section>
  );
}
