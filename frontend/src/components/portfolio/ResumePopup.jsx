import { useState, useEffect } from "react";

export default function ResumePopup({ onClose }) {
  const [iframeLoading, setIframeLoading] = useState(true);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const handleKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeUp 0.2s ease" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "min(860px, 92vw)", height: "88vh", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 18, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.8)" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-card)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Resume</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>PDF</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 20, lineHeight: 1, padding: "0 4px" }}>×</button>
        </div>
        <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          {iframeLoading && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-surface)", zIndex: 1 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid var(--accent-border)", borderTopColor: "var(--accent)", animation: "spin 0.8s linear infinite" }} />
            </div>
          )}
          <iframe
            src={`https://docs.google.com/viewer?url=https://tienmai.space/api/resume/file&embedded=true`}
            style={{ width: "100%", height: "100%", border: "none" }}
            title="Resume"
            onLoad={() => setIframeLoading(false)}
          />
        </div>
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", background: "var(--bg-card)", flexShrink: 0 }}>
          <button
            onClick={async () => {
              const res = await fetch("/api/resume/file");
              const blob = await res.blob();
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url; a.download = "Tien_Mai_Resume.pdf"; a.click();
              URL.revokeObjectURL(url);
            }}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 9, background: "var(--accent)", color: "#0a0a0b", border: "none", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-display)" }}
          >↓ Download</button>
        </div>
      </div>
    </div>
  );
}
