import { useState, useRef, useEffect, useCallback } from "react";

const API_URL = "/api/chat";

function generateSessionId() {
  return Math.random().toString(36).slice(2);
}

async function sendMessage(message, sessionId) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, session_id: sessionId }),
  });
  const data = await res.json();
  return data.reply;
}

function useProfile() {
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    fetch("/api/profile")
      .then(r => r.json())
      .then(data => {
        setProfile(data);
        if (data.theme) applyTheme(data.theme);
        if (data.fonts) applyFonts(data.fonts);
      })
      .catch(err => console.error("Failed to load profile:", err));
  }, []);
  return profile;
}

function applyTheme(theme) {
  const root = document.documentElement;
  const map = { bg: "--bg", bgSurface: "--bg-surface", bgCard: "--bg-card", accent: "--accent", text: "--text", textMuted: "--text-muted" };
  Object.entries(map).forEach(([key, cssVar]) => { if (theme[key]) root.style.setProperty(cssVar, theme[key]); });
  if (theme.accent) {
    root.style.setProperty("--accent-dim", theme.accent + "1a");
    root.style.setProperty("--accent-border", theme.accent + "4d");
    root.style.setProperty("--user-bg", theme.accent + "1a");
  }
}

function applyFonts(fonts) {
  const root = document.documentElement;
  // Load Google Fonts dynamically
  const displayFont = fonts.display || "Syne";
  const monoFont = fonts.mono || "DM Mono";
  const googleFontsUrl = `https://fonts.googleapis.com/css2?family=${displayFont.replace(/ /g, "+")}:wght@400;500;700&family=${monoFont.replace(/ /g, "+")}:wght@400;500&display=swap`;

  // Remove old font link if exists
  const oldLink = document.getElementById("google-fonts");
  if (oldLink) oldLink.remove();

  const link = document.createElement("link");
  link.id = "google-fonts";
  link.rel = "stylesheet";
  link.href = googleFontsUrl;
  document.head.appendChild(link);

  // Apply CSS variables
  root.style.setProperty("--font-display", `'${displayFont}', sans-serif`);
  root.style.setProperty("--font-mono", `'${monoFont}', monospace`);
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({ images, index, onClose }) {
  const [current, setCurrent] = useState(index);
  const goPrev = useCallback(() => setCurrent(i => (i - 1 + images.length) % images.length), [images.length]);
  const goNext = useCallback(() => setCurrent(i => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    const handleKey = e => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, goPrev, goNext]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeUp 0.2s ease" }}>
      <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "50%", width: 40, height: 40, color: "#fff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
      <div style={{ position: "absolute", top: 24, left: "50%", transform: "translateX(-50%)", fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-mono)" }}>{current + 1} / {images.length}</div>
      {images.length > 1 && <button onClick={e => { e.stopPropagation(); goPrev(); }} style={{ position: "absolute", left: 20, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "50%", width: 44, height: 44, color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>}
      <img src={images[current]} onClick={e => e.stopPropagation()} style={{ maxWidth: "88vw", maxHeight: "88vh", objectFit: "contain", borderRadius: 12, boxShadow: "0 24px 80px rgba(0,0,0,0.8)" }} alt={`Gallery ${current + 1}`} />
      {images.length > 1 && <button onClick={e => { e.stopPropagation(); goNext(); }} style={{ position: "absolute", right: 20, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "50%", width: 44, height: 44, color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>}
    </div>
  );
}

// ─── Chat ──────────────────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, padding: "12px 14px", alignItems: "center" }}>
      {[0, 1, 2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
    </div>
  );
}

function ChatMessage({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 10, animation: "fadeUp 0.2s ease" }}>
      {!isUser && <div style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, background: "var(--accent-dim)", border: "1px solid var(--accent-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "var(--accent)", marginRight: 7, fontFamily: "var(--font-mono)", fontWeight: 500 }}>AI</div>}
      <div style={{ maxWidth: "80%", padding: "9px 13px", fontSize: 13, lineHeight: 1.6, background: isUser ? "var(--user-bg)" : "var(--bg-card)", border: `1px solid ${isUser ? "var(--accent-border)" : "var(--border)"}`, borderRadius: isUser ? "14px 14px 3px 14px" : "14px 14px 14px 3px", color: isUser ? "var(--accent)" : "var(--text)", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{msg.content}</div>
    </div>
  );
}

function ChatPopup({ onClose }) {
  const [sessionId] = useState(generateSessionId);
  const [messages, setMessages] = useState([{ role: "assistant", content: "Hey! Ask me anything about Tien 👋" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const bottomRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const handleSend = async () => {
    const text = input.trim();
    if ((!text && !selectedFile) || loading) return;

    setInput("");
    setLoading(true);

    if (selectedFile) {
      // Send with file
      const file = selectedFile;
      setSelectedFile(null);
      const displayMsg = text || "Please analyze this file and evaluate how well it matches my profile.";
      setMessages(prev => [...prev, { role: "user", content: `📎 ${file.name}\n${displayMsg}` }]);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("message", displayMsg);
        formData.append("session_id", sessionId);
        const res = await fetch("/api/chat/file", { method: "POST", body: formData });
        const data = await res.json();
        setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
      } catch {
        setMessages(prev => [...prev, { role: "assistant", content: "Something went wrong processing the file." }]);
      }
    } else {
      // Send text only
      setMessages(prev => [...prev, { role: "user", content: text }]);
      try {
        const reply = await sendMessage(text, sessionId);
        setMessages(prev => [...prev, { role: "assistant", content: reply }]);
      } catch {
        setMessages(prev => [...prev, { role: "assistant", content: "Something went wrong. Please try again." }]);
      }
    }
    setLoading(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
    e.target.value = "";
  };

  return (
    <div className="chat-popup" style={{ position: "fixed", bottom: 84, right: 24, zIndex: 999, width: 340, height: 460, background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 18, boxShadow: "0 20px 60px rgba(0,0,0,0.7)", display: "flex", flexDirection: "column", overflow: "hidden", animation: "fadeUp 0.25s ease" }}>
      <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-card)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)", animation: "pulse 2s ease infinite" }} />
          <span style={{ fontSize: 13, fontWeight: 500 }}>AI Assistant</span>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 20, lineHeight: 1, padding: "0 4px" }}>×</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "14px 12px" }}>
        {messages.map((msg, i) => <ChatMessage key={i} msg={msg} />)}
        {loading && (
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, background: "var(--accent-dim)", border: "1px solid var(--accent-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "var(--accent)", marginRight: 7, fontFamily: "var(--font-mono)" }}>AI</div>
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px 14px 14px 3px" }}><TypingDots /></div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Selected file preview */}
      {selectedFile && (
        <div style={{ padding: "6px 12px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8, background: "var(--accent-dim)" }}>
          <span style={{ fontSize: 12, color: "var(--accent)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📎 {selectedFile.name}</span>
          <button onClick={() => setSelectedFile(null)} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: 14, flexShrink: 0 }}>×</button>
        </div>
      )}

      <div style={{ padding: "10px 12px", borderTop: "1px solid var(--border)", display: "flex", gap: 7, alignItems: "center" }}>
        {/* File upload button */}
        <button onClick={() => fileRef.current?.click()} disabled={loading} style={{ width: 36, height: 36, borderRadius: 9, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-muted)", cursor: loading ? "default" : "pointer", fontSize: 15, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
          title="Upload PDF, Word, or Text file"
        >📎</button>
        <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" onChange={handleFileSelect} style={{ display: "none" }} />

        <textarea value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder={selectedFile ? "Add a message (optional)..." : "Type a message..."}
          rows={1}
          style={{ flex: 1, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: "8px 12px", color: "var(--text)", fontSize: 13, fontFamily: "var(--font-display)", resize: "none", outline: "none", lineHeight: 1.5, transition: "border 0.2s" }}
          onFocus={e => e.target.style.borderColor = "var(--accent-border)"}
          onBlur={e => e.target.style.borderColor = "var(--border)"}
        />
        <button onClick={handleSend} disabled={loading || (!input.trim() && !selectedFile)} style={{ width: 36, height: 36, borderRadius: 9, border: "1px solid var(--border)", background: (input.trim() || selectedFile) && !loading ? "var(--accent)" : "var(--bg-card)", color: (input.trim() || selectedFile) && !loading ? "#0a0a0b" : "var(--text-muted)", cursor: (input.trim() || selectedFile) && !loading ? "pointer" : "default", fontSize: 16, transition: "all 0.2s", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>↑</button>
      </div>
    </div>
  );
}

function FloatingButton({ onClick, isOpen }) {
  return (
    <button className="chat-float-btn" onClick={onClick} style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000, width: 52, height: 52, borderRadius: "50%", border: "none", background: isOpen ? "var(--bg-card)" : "var(--accent)", boxShadow: isOpen ? "none" : "0 8px 28px rgba(93,202,165,0.35)", color: isOpen ? "var(--text-muted)" : "#0a0a0b", fontSize: isOpen ? 22 : 20, cursor: "pointer", transition: "all 0.25s", display: "flex", alignItems: "center", justifyContent: "center", outline: isOpen ? "1px solid var(--border)" : "none" }}>
      {isOpen ? "×" : "✦"}
    </button>
  );
}

// ─── Resume Popup ──────────────────────────────────────────────────────────────

function ResumePopup({ onClose }) {
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

// ─── Profile Components ────────────────────────────────────────────────────────

function Avatar({ name, avatar }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{ width: 88, height: 88, borderRadius: "50%", background: "var(--accent-dim)", border: "2px solid var(--accent-border)", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--font-display)" }}>
      {avatar ? <img src={avatar} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
    </div>
  );
}

function Section({ title, children, labelColor, lineColor }) {
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

function Card({ children }) {
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "16px 18px", marginBottom: 10, transition: "border-color 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border-hover)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
    >{children}</div>
  );
}

const linkStyle = { fontSize: 12, color: "var(--text-muted)", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: "5px 12px", textDecoration: "none", fontFamily: "var(--font-mono)" };

// ─── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const profile = useProfile();
  const [chatOpen, setChatOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [hasResume, setHasResume] = useState(false);

  useEffect(() => {
    fetch("/api/resume/exists")
      .then(r => r.json())
      .then(data => setHasResume(data.exists))
      .catch(() => setHasResume(false));
  }, []);

  if (!profile) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid var(--accent)", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const t = profile.theme || {};

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {/* Admin button */}
      <a href="/admin" style={{ position: "fixed", top: 16, right: 16, zIndex: 100, fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--font-mono)", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: "5px 10px", textDecoration: "none", letterSpacing: "0.06em", transition: "all 0.2s" }}
        onMouseEnter={e => { e.target.style.color = "var(--accent)"; e.target.style.borderColor = "var(--accent-border)"; }}
        onMouseLeave={e => { e.target.style.color = "var(--text-dim)"; e.target.style.borderColor = "var(--border)"; }}
      >⚙</a>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px 120px" }}>

        {/* Hero */}
        <div className="hero-section" style={{ display: "flex", gap: 20, alignItems: "flex-start", marginBottom: 40, animation: "fadeUp 0.4s ease" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <Avatar name={profile.name} avatar={profile.avatar} />
            {profile.openToWork && (
              <div style={{
                fontSize: 10, fontWeight: 600, letterSpacing: "0.04em",
                color: t.openToWorkText || "#fff",
                background: t.openToWorkBg || "#16a34a",
                border: `1px solid ${t.openToWorkBorder || "rgba(255,255,255,0.2)"}`,
                borderRadius: 20, padding: "3px 10px",
                fontFamily: "var(--font-display)",
                whiteSpace: "nowrap",
                boxShadow: `0 0 12px ${t.openToWorkBg || "#16a34a"}55`,
              }}>
                ✦ Open to Work
              </div>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "1.9rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4, color: t.headingName || "var(--text)", fontFamily: "var(--font-display)" }}>{profile.name}</h1>
            <p style={{ fontSize: 14, color: "var(--accent)", fontFamily: "var(--font-mono)", marginBottom: 8 }}>{profile.title}</p>
            <p style={{ fontSize: 13, color: t.textMuted || "var(--text-muted)", marginBottom: 14 }}>📍 {profile.location}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {profile.email && <a href={`mailto:${profile.email}`} style={linkStyle}>✉ Email</a>}
              {profile.github && <a href={profile.github} target="_blank" rel="noreferrer" style={linkStyle}>⌥ GitHub</a>}
              {profile.gitlab && <a href={profile.gitlab} target="_blank" rel="noreferrer" style={linkStyle}>⌦ GitLab</a>}
              {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noreferrer" style={linkStyle}>in LinkedIn</a>}
              {hasResume && (
                <button onClick={() => setResumeOpen(true)} style={{ ...linkStyle, cursor: "pointer", border: "1px solid var(--accent-border)", color: "var(--accent)", background: "var(--accent-dim)" }}>
                  ↓ Resume
                </button>
              )}
            </div>
          </div>
        </div>

        {/* About */}
        {profile.about && (
          <Section title="About" labelColor={t.labelAbout} lineColor={t.lineColor}>
            <p style={{ fontSize: 14, color: t.sectionAbout || "var(--text-muted)", lineHeight: 1.8 }}>{profile.about}</p>
          </Section>
        )}

        {/* Skills */}
        {profile.skills?.length > 0 && (
          <Section title="Skills" labelColor={t.labelSkills} lineColor={t.lineColor}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {profile.skills.map(s => (
                <span key={s} style={{ fontSize: 12, color: t.sectionSkills || "var(--text-muted)", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: "5px 12px", fontFamily: "var(--font-mono)" }}>{s}</span>
              ))}
            </div>
          </Section>
        )}

        {/* Experience */}
        {profile.experiences?.length > 0 && (
          <Section title="Experience" labelColor={t.labelExperience} lineColor={t.lineColor}>
            {profile.experiences.map((exp, i) => (
              <Card key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: t.sectionExperience || "var(--text)" }}>{exp.role}</p>
                    <p style={{ fontSize: 13, color: "var(--accent)", fontFamily: "var(--font-mono)", marginTop: 2 }}>{exp.company}</p>
                  </div>
                  <span style={{ fontSize: 11, color: t.textMuted || "var(--text-dim)", fontFamily: "var(--font-mono)", flexShrink: 0, marginLeft: 12 }}>{exp.period}</span>
                </div>
                {exp.description && <p style={{ fontSize: 13, color: t.sectionExperience || "var(--text-muted)", lineHeight: 1.65, marginTop: 8 }}>{exp.description}</p>}
              </Card>
            ))}
          </Section>
        )}

        {/* Education */}
        {profile.educations?.length > 0 && (
          <Section title="Education" labelColor={t.labelEducation} lineColor={t.lineColor}>
            {profile.educations.map((edu, i) => (
              <Card key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: t.sectionEducation || "var(--text)" }}>{edu.school}</p>
                    <p style={{ fontSize: 13, color: t.sectionEducation || "var(--text-muted)", marginTop: 2 }}>{edu.degree}</p>
                  </div>
                  <span style={{ fontSize: 11, color: t.textMuted || "var(--text-dim)", fontFamily: "var(--font-mono)", flexShrink: 0, marginLeft: 12 }}>{edu.period}</span>
                </div>
              </Card>
            ))}
          </Section>
        )}

        {/* Projects */}
        {profile.projects?.length > 0 && (
          <Section title="Projects" labelColor={t.labelProjects} lineColor={t.lineColor}>
            {profile.projects.map((p, i) => (
              <Card key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: t.sectionProjects || "var(--text)" }}>{p.title}</p>
                  {p.tag && <span style={{ fontSize: 10, color: "var(--accent)", fontFamily: "var(--font-mono)", background: "var(--accent-dim)", border: "1px solid var(--accent-border)", borderRadius: 6, padding: "3px 8px", flexShrink: 0, marginLeft: 12 }}>{p.tag}</span>}
                </div>
                <p style={{ fontSize: 13, color: t.sectionProjects || "var(--text-muted)", lineHeight: 1.65 }}>{p.description}</p>
                {p.link && <a href={p.link} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "var(--accent)", marginTop: 8, display: "inline-block" }}>View project →</a>}
              </Card>
            ))}
          </Section>
        )}

        {/* Gallery */}
        {profile.gallery?.length > 0 && (
          <Section title="Gallery" labelColor={t.labelGallery} lineColor={t.lineColor}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {profile.gallery.map((url, i) => (
                <div key={i} onClick={() => setLightboxIndex(i)} style={{ aspectRatio: "1", borderRadius: 10, overflow: "hidden", cursor: "pointer", border: "1px solid var(--border)", transition: "border-color 0.2s, transform 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent-border)"; e.currentTarget.style.transform = "scale(1.03)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "scale(1)"; }}
                >
                  <img src={url} alt={`Gallery ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          </Section>
        )}

      </div>

      {resumeOpen && <ResumePopup onClose={() => setResumeOpen(false)} />}
      {lightboxIndex !== null && <Lightbox images={profile.gallery} index={lightboxIndex} onClose={() => setLightboxIndex(null)} />}
      {chatOpen && <ChatPopup onClose={() => setChatOpen(false)} />}
      <FloatingButton onClick={() => setChatOpen(p => !p)} isOpen={chatOpen} />
    </>
  );
}
