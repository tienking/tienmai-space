import { useState, useRef, useEffect } from "react";

const API_URL = "/api/chat";
const STORAGE_SESSION = "tienmai_session_id";
const STORAGE_MESSAGES = "tienmai_chat_messages";
const SUGGESTED_QUESTIONS = ["Work experience?", "Skills & tools?", "Certifications?", "Open to work?"];
const WELCOME_MSG = { role: "assistant", content: "Hey! I'm Tien — feel free to ask me anything 👋" };

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

export function ChatPopup({ onClose }) {
  const [sessionId, setSessionId] = useState(() => {
    const s = localStorage.getItem(STORAGE_SESSION);
    if (s) return s;
    const id = generateSessionId();
    localStorage.setItem(STORAGE_SESSION, id);
    return id;
  });
  const [messages, setMessages] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_MESSAGES);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [WELCOME_MSG];
  });

  const clearChat = () => {
    fetch(`/api/chat/${sessionId}`, { method: "DELETE" }).catch(() => {});
    const newId = generateSessionId();
    localStorage.setItem(STORAGE_SESSION, newId);
    localStorage.removeItem(STORAGE_MESSAGES);
    setSessionId(newId);
    setMessages([WELCOME_MSG]);
  };
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const bottomRef = useRef(null);
  const chatContainerRef = useRef(null);
  const fileRef = useRef(null);
  const prevLoadingRef = useRef(false);

  // Scroll to bottom on popup open
  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "instant" }), 50);
  }, []);

  // Scroll to bottom only when user sends (loading starts), not on AI reply
  useEffect(() => {
    if (loading && !prevLoadingRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevLoadingRef.current = loading;
  }, [loading]);

  // Track whether user is at the bottom of the chat
  useEffect(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    const onScroll = () => setIsAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 50);
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { localStorage.setItem(STORAGE_MESSAGES, JSON.stringify(messages.slice(-30))); }, [messages]);

  const handleSend = async (textOverride) => {
    const text = textOverride !== undefined ? textOverride.trim() : input.trim();
    if ((!text && !selectedFile) || loading) return;

    if (textOverride === undefined) setInput("");
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
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button onClick={clearChat} title="New conversation"
            style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: "2px 6px", borderRadius: 6, opacity: 0.6 }}>↺</button>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 20, lineHeight: 1, padding: "0 4px" }}>×</button>
        </div>
      </div>

      <div ref={chatContainerRef} style={{ flex: 1, overflowY: "auto", padding: "14px 12px", overscrollBehavior: "contain" }}>
        {messages.map((msg, i) => <ChatMessage key={i} msg={msg} />)}
        {messages.length === 1 && !loading && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8, marginLeft: 33 }}>
            {SUGGESTED_QUESTIONS.map(q => (
              <button key={q} onClick={() => handleSend(q)}
                style={{ fontSize: 12, padding: "5px 11px", borderRadius: 20, border: "1px solid var(--accent-border)", background: "var(--accent-dim)", color: "var(--accent)", cursor: "pointer", fontFamily: "var(--font-display)", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.color = "#0a0a0b"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "var(--accent-dim)"; e.currentTarget.style.color = "var(--accent)"; }}
              >{q}</button>
            ))}
          </div>
        )}
        {loading && (
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, background: "var(--accent-dim)", border: "1px solid var(--accent-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "var(--accent)", marginRight: 7, fontFamily: "var(--font-mono)" }}>AI</div>
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px 14px 14px 3px" }}><TypingDots /></div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {!isAtBottom && (
        <div style={{ display: "flex", justifyContent: "center", padding: "4px 0", flexShrink: 0 }}>
          <button onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
            style={{ fontSize: 12, padding: "4px 14px", borderRadius: 20, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-muted)", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.3)", fontFamily: "var(--font-display)" }}>
            ↓
          </button>
        </div>
      )}

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

export function FloatingButton({ onClick, isOpen }) {
  return (
    <button className="chat-float-btn" onClick={onClick} style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000, width: 52, height: 52, borderRadius: "50%", border: "none", background: isOpen ? "var(--bg-card)" : "var(--accent)", boxShadow: isOpen ? "none" : "0 8px 28px rgba(93,202,165,0.35)", color: isOpen ? "var(--text-muted)" : "#0a0a0b", fontSize: isOpen ? 22 : 20, cursor: "pointer", transition: "all 0.25s", display: "flex", alignItems: "center", justifyContent: "center", outline: isOpen ? "1px solid var(--border)" : "none" }}>
      {isOpen ? "×" : "✦"}
    </button>
  );
}
