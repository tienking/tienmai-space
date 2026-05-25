import { useState, useRef, useEffect } from "react";

export default function JDMatchBanner({ theme = {} }) {
  const fileRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const bannerBg = theme.bannerBg || "var(--bg-card)";
  const bannerBorder = theme.bannerBorder || "var(--accent-border)";
  const bannerLabel = theme.bannerLabel || "var(--accent)";
  const bannerTitle = theme.bannerTitle || "var(--text)";
  const bannerText = theme.bannerText || "var(--text-muted)";
  const bannerBtnText = theme.bannerBtnText || "var(--accent)";
  const skillMatchColor = theme.bannerMatchColor || "#16a34a";
  const skillMissingColor = theme.bannerMissingColor || "#dc2626";
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(() => {
    try { const s = localStorage.getItem("tienmai_jd_result"); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [expanded, setExpanded] = useState(() => {
    return localStorage.getItem("tienmai_jd_expanded") !== "false";
  });

  useEffect(() => {
    if (result && !result.error) localStorage.setItem("tienmai_jd_result", JSON.stringify(result));
    else localStorage.removeItem("tienmai_jd_result");
  }, [result]);

  useEffect(() => {
    localStorage.setItem("tienmai_jd_expanded", expanded);
  }, [expanded]);

  const handleFile = async (file) => {
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!name.endsWith(".pdf") && !name.endsWith(".docx") && !name.endsWith(".txt")) return;
    if (file.size > 8 * 1024 * 1024) {
      setResult({ error: true, message: "File too large (max 8MB). Try converting to .txt or .docx." });
      return;
    }
    setLoading(true);
    setResult(null);
    setExpanded(true);
    setDragging(false);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/jd-match", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setResult({ error: true, message: err.detail || `Server error (${res.status})` });
        setLoading(false);
        return;
      }
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: true, message: "Network error. Please try again." });
    }
    setLoading(false);
  };

  const matchColor = result && !result.error
    ? result.match_percent >= 50 ? skillMatchColor : skillMissingColor
    : "var(--accent)";

  return (
    <div
      style={{
        borderRadius: 16, padding: "20px 24px", marginBottom: 36,
        border: `1px solid ${dragging ? bannerLabel : bannerBorder}`,
        background: dragging ? bannerLabel + "18" : bannerBg,
        transition: "border-color 0.2s, background 0.2s",
        cursor: !result && !loading ? "pointer" : "default",
      }}
      onClick={() => { if (!result && !loading) fileRef.current?.click(); }}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: result || loading ? 20 : 0 }}>
        <div>
          <p style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: bannerLabel, letterSpacing: "0.12em", marginBottom: 6 }}>FOR RECRUITERS</p>
          <p style={{ fontSize: 15, fontWeight: 600, color: bannerTitle, marginBottom: result || loading ? 0 : 4 }}>Check if I'm a fit for your role</p>
          {!result && !loading && <p style={{ fontSize: 13, color: bannerText, lineHeight: 1.5, marginTop: 4 }}>Drop a job description here — I'll analyze match %, skills alignment and gaps instantly.</p>}
        </div>
        <button
          onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}
          disabled={loading}
          style={{ padding: "8px 16px", borderRadius: 10, flexShrink: 0, border: `1px solid ${bannerBorder}`, background: bannerBtnText + "18", color: bannerBtnText, fontSize: 12, cursor: loading ? "default" : "pointer", fontFamily: "var(--font-display)", whiteSpace: "nowrap", transition: "all 0.15s", opacity: loading ? 0.6 : 1 }}
          onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = bannerBtnText; e.currentTarget.style.color = "#0a0a0b"; } }}
          onMouseLeave={e => { e.currentTarget.style.background = bannerBtnText + "18"; e.currentTarget.style.color = bannerBtnText; }}
        >{loading ? "Analyzing..." : result ? "↑ New JD" : "↑ Upload JD"}</button>
        <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" onChange={e => { handleFile(e.target.files[0]); e.target.value = ""; }} style={{ display: "none" }} />
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0" }}>
          <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid var(--accent-border)", borderTopColor: "var(--accent)", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Reading your JD and comparing with my profile...</p>
        </div>
      )}

      {/* Error */}
      {result?.error && <p style={{ fontSize: 13, color: "#f87171", padding: "8px 0" }}>{result.message || "Something went wrong. Please try again."}</p>}

      {/* Result */}
      {result && !result.error && (
        <div style={{ animation: "fadeUp 0.3s ease" }}>
          {/* Match percent */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: result.job_title ? 8 : 16 }}>
            <span style={{ fontSize: 52, fontWeight: 700, color: matchColor, lineHeight: 1, fontFamily: "var(--font-display)" }}>{result.match_percent}%</span>
            <div>
              <p style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", letterSpacing: "0.08em" }}>OVERALL MATCH</p>
              <p style={{ fontSize: 12, color: matchColor, marginTop: 2 }}>
                {result.match_percent >= 70 ? "Strong fit" : result.match_percent >= 50 ? "Good fit" : "Low fit"}
              </p>
            </div>
          </div>
          {result.job_title && (
            <p style={{ fontSize: 12, color: bannerText, fontFamily: "var(--font-mono)", marginBottom: 16, opacity: 0.8 }}>
              📌 {result.job_title}
            </p>
          )}

          {/* Expandable detail */}
          {expanded && (
            <div style={{ animation: "fadeUp 0.2s ease" }}>
              {/* Skills grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px" }}>
                  <p style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: skillMatchColor, letterSpacing: "0.08em", marginBottom: 10 }}>✓ MATCHING SKILLS</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {result.match_skills?.map((s, i) => (
                      <span key={i} style={{ fontSize: 11, color: skillMatchColor, background: skillMatchColor + "22", border: `1px solid ${skillMatchColor}55`, borderRadius: 6, padding: "3px 9px", fontFamily: "var(--font-mono)" }}>{s}</span>
                    ))}
                  </div>
                </div>
                <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px" }}>
                  <p style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: skillMissingColor, letterSpacing: "0.08em", marginBottom: 10 }}>✕ MISSING SKILLS</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {result.missing_skills?.length > 0
                      ? result.missing_skills.map((s, i) => (
                        <span key={i} style={{ fontSize: 11, color: skillMissingColor, background: skillMissingColor + "22", border: `1px solid ${skillMissingColor}55`, borderRadius: 6, padding: "3px 9px", fontFamily: "var(--font-mono)" }}>{s}</span>
                      ))
                      : <span style={{ fontSize: 12, color: "var(--text-muted)" }}>None identified</span>
                    }
                  </div>
                </div>
              </div>

              {/* Assessment */}
              <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px" }}>
                <p style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 8 }}>MY TAKE</p>
                <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.7, fontStyle: "italic" }}>{result.assessment}</p>
              </div>
            </div>
          )}

          {/* Show less/more */}
          <button onClick={() => setExpanded(p => !p)} style={{ width: "100%", padding: "9px", borderRadius: 10, border: "1px solid var(--border)", background: "none", color: "var(--accent)", fontSize: 13, cursor: "pointer", fontFamily: "var(--font-display)", transition: "border-color 0.2s", marginTop: 12 }}
            onMouseEnter={e => e.target.style.borderColor = "var(--accent-border)"}
            onMouseLeave={e => e.target.style.borderColor = "var(--border)"}
          >{expanded ? "↑ Show less" : "↓ Show full analysis"}</button>
        </div>
      )}
    </div>
  );
}
