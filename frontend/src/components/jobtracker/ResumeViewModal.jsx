export default function ResumeViewModal({ url, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", flexDirection: "column" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ margin: "24px auto", width: "92%", maxWidth: 860, flex: 1, minHeight: 0, display: "flex", flexDirection: "column", background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.25)" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 12px", borderBottom: "0.5px solid #e0e0dc", flexShrink: 0 }}>
          <button onClick={onClose} style={{ fontSize: 12, padding: "4px 14px", borderRadius: 6, border: "0.5px solid #ccc", background: "#fff", cursor: "pointer", fontFamily: "inherit" }}>Đóng</button>
        </div>
        <iframe src={url} style={{ flex: 1, border: "none", width: "100%" }} title="Resume" />
      </div>
    </div>
  );
}
