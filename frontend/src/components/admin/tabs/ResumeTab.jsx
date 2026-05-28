import { useState, useEffect, useRef } from "react";

export default function ResumeTab({ token, resumeVisible, onSave, saving }) {
  const [hasResume, setHasResume] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(resumeVisible);
  const fileRef = useRef(null);

  useEffect(() => {
    fetch("/api/resume/exists")
      .then(r => r.json())
      .then(data => setHasResume(data.exists));
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".pdf")) { setMessage("Only PDF files are allowed."); return; }
    setUploading(true); setMessage("");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/admin/resume", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) { setHasResume(true); setMessage("Resume uploaded successfully!"); }
      else { setMessage("Upload failed. Please try again."); }
    } catch { setMessage("Upload failed. Please try again."); }
    setUploading(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete the resume?")) return;
    await fetch("/api/admin/resume", { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    setHasResume(false);
    setMessage("Resume deleted.");
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Resume</h2>
      </div>

      {/* Visibility toggle */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-card)", border: `1px solid ${visible ? "var(--accent-border)" : "var(--border)"}`, borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 500 }}>Show resume on profile</p>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
            {visible ? "Visible to visitors" : "Hidden from visitors — file still saved"}
          </p>
        </div>
        <button onClick={() => { const v = !visible; setVisible(v); onSave({ resumeVisible: v }); }} disabled={saving} style={{ width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", background: visible ? "var(--accent)" : "var(--border)", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
          <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: visible ? 23 : 3, transition: "left 0.2s" }} />
        </button>
      </div>

      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: hasResume ? "var(--accent-dim)" : "var(--bg-surface)", border: `1px solid ${hasResume ? "var(--accent-border)" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📄</div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 500 }}>{hasResume ? "Resume uploaded" : "No resume uploaded"}</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{hasResume ? "Tien_Mai_Resume.pdf — visible on profile" : "Upload a PDF to show on your profile"}</p>
          </div>
          {hasResume && <a href="/api/resume/file" target="_blank" style={{ marginLeft: "auto", fontSize: 12, color: "var(--accent)", textDecoration: "none", fontFamily: "var(--font-mono)" }}>Preview →</a>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ padding: "8px 18px", borderRadius: 9, border: "none", background: "var(--accent)", color: "#fff", fontSize: 13, fontWeight: 500, cursor: uploading ? "default" : "pointer", fontFamily: "var(--font-display)", opacity: uploading ? 0.7 : 1 }}>
            {uploading ? "Uploading..." : hasResume ? "Replace PDF" : "Upload PDF"}
          </button>
          {hasResume && (
            <button onClick={handleDelete} style={{ padding: "8px 18px", borderRadius: 9, border: "1px solid var(--border)", background: "none", color: "#f87171", fontSize: 13, cursor: "pointer", fontFamily: "var(--font-display)" }}>Delete</button>
          )}
        </div>
        <input ref={fileRef} type="file" accept=".pdf" onChange={handleUpload} style={{ display: "none" }} />
      </div>
      {message && <p style={{ fontSize: 13, color: message.includes("success") ? "var(--accent)" : "#f87171" }}>{message}</p>}
    </div>
  );
}
