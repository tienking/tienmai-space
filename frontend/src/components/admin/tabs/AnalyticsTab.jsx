import { useState, useEffect } from "react";

export default function AnalyticsTab({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid var(--accent)", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
    </div>
  );
  if (!data) return <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Failed to load analytics.</p>;

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const found = data.visitors_by_day.find(v => v.date === key);
    return { date: key, count: found?.count ?? 0, label: d.toLocaleDateString("en", { weekday: "short" }) };
  });
  const maxCount = Math.max(...last7.map(d => d.count), 1);
  const thisWeek = last7.reduce((a, b) => a + b.count, 0);

  return (
    <div>
      <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 20 }}>Analytics</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Visitors", value: data.total_visitors },
          { label: "Total Questions", value: data.total_messages },
          { label: "This Week", value: thisWeek },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px" }}>
            <p style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em", marginBottom: 8, textTransform: "uppercase" }}>{label}</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--font-display)" }}>{value}</p>
          </div>
        ))}
      </div>

      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px", marginBottom: 20 }}>
        <p style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em", marginBottom: 16, textTransform: "uppercase" }}>Visitors — Last 7 Days</p>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 88 }}>
          {last7.map(({ date, count, label }) => (
            <div key={date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 11, color: "var(--accent)", fontFamily: "var(--font-mono)", minHeight: 16 }}>{count > 0 ? count : ""}</span>
              <div style={{ width: "100%", height: `${Math.max((count / maxCount) * 52, count > 0 ? 4 : 2)}px`, background: count > 0 ? "var(--accent)" : "var(--border)", borderRadius: 4, transition: "height 0.3s" }} />
              <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px" }}>
        <p style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em", marginBottom: 16, textTransform: "uppercase" }}>Recent Questions</p>
        {data.recent_questions.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No questions yet.</p>
        ) : data.recent_questions.map((q, i) => (
          <div key={i} style={{ padding: "10px 0", borderBottom: i < data.recent_questions.length - 1 ? "1px solid var(--border)" : "none", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
            <p style={{ fontSize: 13, color: "var(--text)", flex: 1, lineHeight: 1.5 }}>{q.content}</p>
            <div style={{ flexShrink: 0, textAlign: "right" }}>
              <span style={{ fontSize: 10, color: "var(--accent)", fontFamily: "var(--font-mono)", display: "block", marginBottom: 2 }}>{q.source}</span>
              <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                {q.created_at ? new Date(q.created_at).toLocaleDateString("en", { month: "short", day: "numeric" }) : ""}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
