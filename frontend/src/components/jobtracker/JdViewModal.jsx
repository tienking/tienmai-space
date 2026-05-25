export default function JdViewModal({ title, jd, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#fff", borderRadius: 12, padding: "24px", width: 680, maxWidth: "96vw", maxHeight: "88vh", display: "flex", flexDirection: "column", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, gap: 12 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0, lineHeight: 1.4 }}>{title}</h2>
          <button onClick={onClose} style={{ flexShrink: 0, padding: "4px 12px", borderRadius: 6, border: "0.5px solid #ccc", background: "#fff", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Đóng</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", fontSize: 13, lineHeight: 1.7, color: "#333", whiteSpace: "pre-wrap", wordBreak: "break-word", borderTop: "0.5px solid #f0f0ec", paddingTop: 16 }}>
          {jd || <span style={{ color: "#aaa" }}>Chưa có JD.</span>}
        </div>
      </div>
    </div>
  );
}
