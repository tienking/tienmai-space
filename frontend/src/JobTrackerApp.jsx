import { useState, useEffect, useRef } from "react";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return isMobile;
}

// ── Token helpers ──────────────────────────────────────────────────────────────
function getTokenData() {
  const token = localStorage.getItem("jt_token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp * 1000 < Date.now()) { localStorage.removeItem("jt_token"); return null; }
    return { token, username: payload.sub };
  } catch { localStorage.removeItem("jt_token"); return null; }
}


// ── Login Page ─────────────────────────────────────────────────────────────────
function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inp = { fontSize: 13, padding: "8px 10px", borderRadius: 6, border: "0.5px solid #ccc", width: "100%", boxSizing: "border-box", outline: "none", fontFamily: "inherit" };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await fetch("/api/jobtracker/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
      if (!res.ok) { setError("Sai username hoặc password."); return; }
      const data = await res.json();
      localStorage.setItem("jt_token", data.access_token);
      window.location.href = `/jobtracker/${data.username}`;
    } catch { setError("Không thể kết nối server."); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f3", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <div style={{ width: 340, background: "#fff", borderRadius: 12, border: "0.5px solid #e0e0dc", padding: "32px 28px" }}>
        <h1 style={{ fontSize: 18, fontWeight: 500, marginBottom: 4, color: "#1a1a18" }}>Job Tracker</h1>
        <p style={{ fontSize: 12, color: "#888", marginBottom: 24 }}>Đăng nhập để xem danh sách job của bạn.</p>
        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: 12, color: "#555", display: "block", marginBottom: 4 }}>Username</label>
          <input value={username} onChange={e => setUsername(e.target.value)} required autoFocus style={{ ...inp, marginBottom: 12 }} />
          <label style={{ fontSize: 12, color: "#555", display: "block", marginBottom: 4 }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ ...inp, marginBottom: error ? 10 : 16 }} />
          {error && <p style={{ fontSize: 12, color: "#c00", marginBottom: 12 }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ width: "100%", padding: 9, borderRadius: 6, border: "none", background: "#1a1a18", color: "#fff", fontSize: 13, cursor: loading ? "default" : "pointer", opacity: loading ? 0.6 : 1, fontFamily: "inherit" }}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Badge ──────────────────────────────────────────────────────────────────────
function badge(status) {
  if (status === "viewed")     return { text: "Đã xem CV", bg: "#E6F1FB", color: "#0C447C" };
  if (status === "downloaded") return { text: "Đã tải CV", bg: "#EAF3DE", color: "#27500A" };
  return                              { text: "Đã apply",  bg: "#F1EFE8", color: "#5F5E5A" };
}

// ── Job Modal (Add / Edit) ─────────────────────────────────────────────────────
const emptyJob = () => ({ title: "", url: "", company: "", loc: "HCM", mode: "On-site", month: new Date().getMonth() + 1, year: new Date().getFullYear(), status: "applied", jd: "" });

// Sub-popup: edit JD text (z-index 200, on top of JobModal)
function JdEditorModal({ value, onSave, onClose }) {
  const [text, setText] = useState(value || "");
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#fff", borderRadius: 12, padding: "24px", width: 600, maxWidth: "96vw", boxShadow: "0 8px 32px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Nội dung JD</h2>
        <textarea value={text} onChange={e => setText(e.target.value)}
          placeholder="Paste Job Description vào đây..."
          style={{ width: "100%", height: "50vh", fontSize: 13, padding: "10px", borderRadius: 8, border: "0.5px solid #ccc", fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box", lineHeight: 1.6 }} />
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "8px 18px", borderRadius: 6, border: "0.5px solid #ccc", background: "#fff", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Huỷ</button>
          <button onClick={() => onSave(text.trim() || null)} style={{ padding: "8px 18px", borderRadius: 6, border: "none", background: "#1a1a18", color: "#fff", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Lưu JD</button>
        </div>
      </div>
    </div>
  );
}

// Popup: view JD text from table
function JdViewModal({ title, jd, onClose }) {
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

function JobModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || emptyJob());
  const [showJdEditor, setShowJdEditor] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const inp = { fontSize: 13, padding: "7px 10px", borderRadius: 6, border: "0.5px solid #ccc", width: "100%", boxSizing: "border-box", fontFamily: "inherit", outline: "none" };
  const lbl = { fontSize: 12, color: "#555", display: "block", marginBottom: 4, marginTop: 12 };

  const handleSave = () => {
    if (!form.title.trim() || !form.company.trim()) return;
    onSave({ ...form, month: parseInt(form.month), year: parseInt(form.year), jd: form.jd?.trim() || null });
  };

  return (
    <>
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}
        onClick={e => e.target === e.currentTarget && onClose()}>
        <div style={{ background: "#fff", borderRadius: 12, padding: "28px 28px 24px", width: 480, maxWidth: "94vw", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{initial ? "Sửa job" : "Thêm job mới"}</h2>

          <label style={lbl}>Vị trí <span style={{ color: "#c00" }}>*</span></label>
          <input value={form.title} onChange={e => set("title", e.target.value)} style={inp} placeholder="Software Engineer" />

          <label style={lbl}>URL</label>
          <input value={form.url} onChange={e => set("url", e.target.value)} style={inp} placeholder="https://linkedin.com/jobs/..." />

          <label style={lbl}>Công ty <span style={{ color: "#c00" }}>*</span></label>
          <input value={form.company} onChange={e => set("company", e.target.value)} style={inp} placeholder="Google" />

          <label style={lbl}>Trạng thái</label>
          <select value={form.status} onChange={e => set("status", e.target.value)} style={{ ...inp, cursor: "pointer" }}>
            <option value="applied">Đã apply</option>
            <option value="viewed">Đã xem CV</option>
            <option value="downloaded">Đã tải CV</option>
          </select>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>Địa điểm</label>
              <input value={form.loc} onChange={e => set("loc", e.target.value)} style={inp} placeholder="HCM" />
            </div>
            <div>
              <label style={lbl}>Hình thức</label>
              <select value={form.mode} onChange={e => set("mode", e.target.value)} style={{ ...inp, cursor: "pointer" }}>
                <option>On-site</option><option>Hybrid</option><option>Remote</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Tháng apply</label>
              <input type="number" min={1} max={12} value={form.month} onChange={e => set("month", e.target.value)} style={inp} />
            </div>
            <div>
              <label style={lbl}>Năm apply</label>
              <input type="number" min={2020} max={2099} value={form.year} onChange={e => set("year", e.target.value)} style={inp} />
            </div>
          </div>

          <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setShowJdEditor(true)}
              style={{ fontSize: 12, padding: "5px 14px", borderRadius: 6, border: "0.5px solid #ccc", background: "#fff", cursor: "pointer", fontFamily: "inherit" }}>
              {form.jd ? "Sửa JD" : "+ Thêm JD"}
            </button>
            {form.jd && <span style={{ fontSize: 11, color: "#888" }}>Đã có JD ({form.jd.length} ký tự)</span>}
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ padding: "8px 18px", borderRadius: 6, border: "0.5px solid #ccc", background: "#fff", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Huỷ</button>
            <button onClick={handleSave} style={{ padding: "8px 18px", borderRadius: 6, border: "none", background: "#1a1a18", color: "#fff", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Lưu</button>
          </div>
        </div>
      </div>
      {showJdEditor && <JdEditorModal value={form.jd} onSave={text => { set("jd", text); setShowJdEditor(false); }} onClose={() => setShowJdEditor(false)} />}
    </>
  );
}

// ── Simple markdown renderer for chat messages ────────────────────────────────
function renderMd(text) {
  return text.split('\n').map((line, i) => {
    const bullet = /^[*-] /.test(line);
    const raw = bullet ? line.slice(2) : line;

    const parts = raw.split(/(\*\*.*?\*\*)/g).map((seg, j) =>
      seg.startsWith('**') && seg.endsWith('**')
        ? <strong key={j}>{seg.slice(2, -2)}</strong>
        : seg
    );

    if (bullet) return (
      <div key={i} style={{ display: "flex", gap: 6, marginBottom: 3 }}>
        <span style={{ flexShrink: 0 }}>•</span><span>{parts}</span>
      </div>
    );
    if (!raw.trim()) return <div key={i} style={{ height: 6 }} />;
    return <div key={i} style={{ marginBottom: 2 }}>{parts}</div>;
  });
}

// ── Job Tracker Chatbot ────────────────────────────────────────────────────────
const JT_WELCOME = { role: "assistant", content: "Xin chào! Tôi là AI hỗ trợ tìm việc của bạn 👋\nTôi có thể giúp phân tích danh sách job đã apply, đánh giá JD mới, hoặc tư vấn cải thiện hồ sơ. Bạn cần hỗ trợ gì?" };
const JT_SUGGESTED = ["Tổng kết tình hình apply của tôi", "Tôi nên cải thiện gì trong hồ sơ?", "Phân tích job nào phù hợp nhất với tôi?", "🔍 Tìm job mới đang tuyển trên web phù hợp với tôi"];

function JtChatMessage({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 10 }}>
      {!isUser && <div style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, background: "#f0f0ec", border: "0.5px solid #e0e0dc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#888", marginRight: 7, fontWeight: 500 }}>AI</div>}
      <div style={{ maxWidth: "80%", padding: "9px 13px", fontSize: 13, lineHeight: 1.6, background: isUser ? "#1a1a18" : "#fff", border: `0.5px solid ${isUser ? "#1a1a18" : "#e0e0dc"}`, borderRadius: isUser ? "14px 14px 3px 14px" : "14px 14px 14px 3px", color: isUser ? "#fff" : "#1a1a18", wordBreak: "break-word" }}>
        {isUser ? msg.content : renderMd(msg.content)}
      </div>
    </div>
  );
}

function JtChatPopup({ username, token, onClose }) {
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const bottomRef = useRef(null);
  const chatContainerRef = useRef(null);
  const chatFileRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => {
    fetch(`/api/jobtracker/chat/${username}/history`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        setMessages(d.messages?.length ? d.messages : [JT_WELCOME]);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "instant" }), 50);
      })
      .catch(() => setMessages([JT_WELCOME]));
  }, [username, token]);

  // Chỉ scroll xuống khi user gửi tin (loading bắt đầu), không scroll khi AI trả lời
  const prevLoadingRef = useRef(false);
  useEffect(() => {
    if (loading && !prevLoadingRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevLoadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    const onScroll = () => {
      setIsAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 50);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const clearChat = () => {
    fetch(`/api/jobtracker/chat/${username}/history`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
    setMessages([JT_WELCOME]);
  };

  const sendToApi = async (text, file) => {
    const headers = { Authorization: `Bearer ${token}` };
    if (file) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("message", text || "");
      fd.append("session_id", "main");
      const res = await fetch(`/api/jobtracker/chat/${username}/file`, { method: "POST", headers, body: fd });
      return (await res.json()).reply;
    }
    const res = await fetch(`/api/jobtracker/chat/${username}`, { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ message: text, session_id: "main" }) });
    return (await res.json()).reply;
  };

  const handleSend = async (textOverride) => {
    const text = textOverride !== undefined ? textOverride.trim() : input.trim();
    if ((!text && !selectedFile) || loading || messages === null) return;
    if (textOverride === undefined) setInput("");
    const file = selectedFile; setSelectedFile(null);
    setLoading(true);
    setMessages(prev => [...prev, { role: "user", content: file ? `📎 ${file.name}${text ? "\n" + text : ""}` : text }]);
    try {
      const reply = await sendToApi(text, file);
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Có lỗi xảy ra. Vui lòng thử lại." }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", bottom: isMobile ? 84 : 84, right: isMobile ? 16 : 40, left: isMobile ? 16 : "auto", zIndex: 999, width: isMobile ? "auto" : "clamp(408px, 40vw, 696px)", height: isMobile ? "70vh" : 624, background: "#fff", border: "0.5px solid #e0e0dc", borderRadius: 16, boxShadow: "0 12px 48px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <div style={{ padding: "10px 14px", borderBottom: "0.5px solid #e0e0dc", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fafaf8", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#1a1a18" }} />
          <span style={{ fontSize: 13, fontWeight: 500 }}>AI Trợ lý</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button onClick={clearChat} title="Cuộc trò chuyện mới" style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 15, lineHeight: 1, padding: "0 4px" }}>↺</button>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 20, lineHeight: 1, padding: "0 4px" }}>×</button>
        </div>
      </div>

      <div ref={chatContainerRef} style={{ flex: 1, overflowY: "auto", padding: "14px 12px", position: "relative" }}>
        {messages === null
          ? <div style={{ textAlign: "center", color: "#aaa", fontSize: 12, marginTop: 20 }}>Đang tải...</div>
          : messages.map((msg, i) => <JtChatMessage key={i} msg={msg} />)}
        {messages?.length === 1 && !loading && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8, marginLeft: 33 }}>
            {JT_SUGGESTED.map(q => (
              <button key={q} onClick={() => handleSend(q)}
                style={{ fontSize: 12, padding: "5px 11px", borderRadius: 20, border: "0.5px solid #ccc", background: "#f5f5f3", color: "#555", cursor: "pointer", fontFamily: "inherit" }}>{q}</button>
            ))}
          </div>
        )}
        {loading && (
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, background: "#f0f0ec", border: "0.5px solid #e0e0dc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#888", marginRight: 7, fontWeight: 500 }}>AI</div>
            <div style={{ padding: "9px 13px", background: "#fff", border: "0.5px solid #e0e0dc", borderRadius: "14px 14px 14px 3px", color: "#aaa", fontSize: 13 }}>...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {!isAtBottom && (
        <div style={{ display: "flex", justifyContent: "center", padding: "4px 0", flexShrink: 0 }}>
          <button onClick={() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }}
            style={{ fontSize: 12, padding: "4px 14px", borderRadius: 20, border: "0.5px solid #ccc", background: "#fff", color: "#555", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", fontFamily: "inherit" }}>
            ↓ Cuối
          </button>
        </div>
      )}

      {selectedFile && (
        <div style={{ padding: "6px 12px", borderTop: "0.5px solid #e0e0dc", display: "flex", alignItems: "center", gap: 8, background: "#f5f5f3", flexShrink: 0 }}>
          <span style={{ fontSize: 12, color: "#555", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📎 {selectedFile.name}</span>
          <button onClick={() => setSelectedFile(null)} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 14, flexShrink: 0 }}>×</button>
        </div>
      )}

      <div style={{ padding: "10px 12px", borderTop: "0.5px solid #e0e0dc", display: "flex", gap: 7, alignItems: "center", flexShrink: 0 }}>
        <button onClick={() => chatFileRef.current?.click()} disabled={loading}
          style={{ width: 34, height: 34, borderRadius: 8, border: "0.5px solid #ccc", background: "#fff", color: "#888", cursor: loading ? "default" : "pointer", fontSize: 15, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
          title="Đính kèm JD (PDF, Word, Text)">📎</button>
        <input ref={chatFileRef} type="file" accept=".pdf,.docx,.txt" onChange={e => { if (e.target.files[0]) setSelectedFile(e.target.files[0]); e.target.value = ""; }} style={{ display: "none" }} />
        <textarea value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder={selectedFile ? "Thêm ghi chú (tùy chọn)..." : "Nhập tin nhắn..."}
          rows={1}
          style={{ flex: 1, border: "0.5px solid #ccc", borderRadius: 8, padding: "8px 12px", fontSize: 13, fontFamily: "inherit", resize: "none", outline: "none", lineHeight: 1.5, background: "#fff", color: "#1a1a18" }} />
        <button onClick={() => handleSend()} disabled={loading || (!input.trim() && !selectedFile)}
          style={{ width: 34, height: 34, borderRadius: 8, border: "none", background: (input.trim() || selectedFile) && !loading ? "#1a1a18" : "#e0e0dc", color: "#fff", cursor: (input.trim() || selectedFile) && !loading ? "pointer" : "default", fontSize: 16, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>↑</button>
      </div>
    </div>
  );
}

function JtChatBot({ username, token }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {open && <JtChatPopup username={username} token={token} onClose={() => setOpen(false)} />}
      <button onClick={() => setOpen(o => !o)}
        style={{ position: "fixed", bottom: 24, right: 40, zIndex: 1000, width: 48, height: 48, borderRadius: "50%", border: open ? "0.5px solid #ccc" : "none", background: open ? "#fff" : "#1a1a18", color: open ? "#888" : "#fff", fontSize: open ? 22 : 18, cursor: "pointer", boxShadow: open ? "none" : "0 4px 16px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", fontFamily: "inherit" }}>
        {open ? "×" : "✦"}
      </button>
    </>
  );
}

// ── Resume View Modal ──────────────────────────────────────────────────────────
function ResumeViewModal({ url, onClose }) {
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

// ── Tracker Page ───────────────────────────────────────────────────────────────
function TrackerPage({ username, token }) {
  const isMobile = useIsMobile();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sortCol, setSortCol] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [search, setSearch] = useState("");
  const [fMode, setFMode] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [fMonth, setFMonth] = useState("");
  const [fYear, setFYear] = useState("");
  const [modal, setModal] = useState(null);
  const [viewJd, setViewJd] = useState(null);

  useEffect(() => {
    fetch(`/api/jobtracker/jobs/${username}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { if (r.status === 401 || r.status === 403) { localStorage.removeItem("jt_token"); window.location.href = "/jobtracker"; return null; } return r.json(); })
      .then(data => { if (data) setJobs(data.jobs || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [username, token]);

  const saveToServer = async (updatedJobs) => {
    setSaving(true);
    await fetch(`/api/jobtracker/jobs/${username}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(updatedJobs) });
    setSaving(false);
  };

  const handleAdd = async (job) => {
    const updated = [{ ...job, added_at: new Date().toISOString() }, ...jobs];
    setJobs(updated); setModal(null);
    await saveToServer(updated);
  };

  const handleEdit = async (job) => {
    const updated = jobs.map((j, i) => i === modal.index ? job : j);
    setJobs(updated); setModal(null);
    await saveToServer(updated);
  };

  const handleStatusChange = async (index, newStatus) => {
    const updated = jobs.map((j, i) => i === index ? { ...j, status: newStatus } : j);
    setJobs(updated);
    await saveToServer(updated);
  };

  const handleDelete = async (index) => {
    if (!confirm("Xoá job này?")) return;
    const updated = jobs.filter((_, i) => i !== index);
    setJobs(updated);
    await saveToServer(updated);
  };

  const handleSort = (col) => { if (sortCol === col) setSortAsc(a => !a); else { setSortCol(col); setSortAsc(true); } };

  const uniqueMonths = [...new Set(jobs.map(j => j.month))].sort((a, b) => a - b);
  const uniqueYears = [...new Set(jobs.map(j => j.year))].sort((a, b) => b - a);

  let filtered = jobs.map((j, i) => ({ ...j, _idx: i })).filter(j => {
    if (fMode && j.mode !== fMode) return false;
    if (fStatus && j.status !== fStatus) return false;
    if (fMonth && j.month !== parseInt(fMonth)) return false;
    if (fYear && j.year !== parseInt(fYear)) return false;
    const q = search.toLowerCase();
    if (q && !j.title.toLowerCase().includes(q) && !j.company.toLowerCase().includes(q)) return false;
    return true;
  });

  filtered = [...filtered].sort((a, b) => {
    if (sortCol) {
      let va = a[sortCol], vb = b[sortCol];
      if (typeof va === "string") { va = va.toLowerCase(); vb = vb.toLowerCase(); }
      return sortAsc ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    }
    const toDate = j => j.added_at ? new Date(j.added_at) : new Date(j.year, j.month - 1, 1);
    return toDate(b) - toDate(a);
  });

  const sel = { fontSize: 12, padding: "5px 8px", borderRadius: 6, border: "0.5px solid #ccc", background: "#fff", color: "#333", fontFamily: "inherit" };
  const thBase = { background: "#f5f5f3", color: "#666", fontWeight: 500, fontSize: 11, padding: "8px 10px", borderBottom: "0.5px solid #e0e0dc", userSelect: "none", whiteSpace: "nowrap", position: "sticky", top: 0, zIndex: 1 };
  const thL = { ...thBase, textAlign: "left", cursor: "pointer" };
  const thC = { ...thBase, textAlign: "center", cursor: "pointer" };
  const thNC = { ...thBase, textAlign: "center" };

  const counts = { v: jobs.filter(j => j.status === "viewed").length, d: jobs.filter(j => j.status === "downloaded").length, a: jobs.filter(j => j.status === "applied").length };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f3", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <p style={{ color: "#888" }}>Đang tải...</p>
    </div>
  );

  return (
    <div style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", fontSize: 13, background: "#f5f5f3", color: "#1a1a18", height: "100vh", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
      {/* Sticky top section */}
      <div style={{ padding: isMobile ? "16px 16px 0" : "24px 24px 0", flexShrink: 0 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <h1 style={{ fontSize: 20, fontWeight: 500 }}>Job Tracker</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: "#888" }}>{username}</span>
            <button onClick={() => window.location.href = `/jobtracker/${username}/profile`}
              style={{ fontSize: 12, color: "#555", background: "none", border: "0.5px solid #ccc", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontFamily: "inherit" }}>
              Hồ sơ
            </button>
            <button onClick={() => { localStorage.removeItem("jt_token"); window.location.href = "/jobtracker"; }}
              style={{ fontSize: 12, color: "#888", background: "none", border: "0.5px solid #ccc", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontFamily: "inherit" }}>
              Sign out
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
          {[
            { num: jobs.length,     label: "Tổng jobs" },
            { num: counts.v,        label: "Đã xem CV",  color: "#0C447C" },
            { num: counts.d,        label: "Đã tải CV",  color: "#27500A" },
            { num: counts.a,        label: "Đã apply",   color: "#5F5E5A" },
            { num: filtered.length, label: "Đang hiển thị" },
          ].map(({ num, label, color }) => (
            <div key={label} style={{ background: "#fff", border: "0.5px solid #e0e0dc", borderRadius: 8, padding: "10px 16px", minWidth: 100 }}>
              <div style={{ fontSize: 22, fontWeight: 500, color: color || "#1a1a18" }}>{num}</div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12, alignItems: "center" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Tìm theo tên job / công ty..." style={{ ...sel, width: isMobile ? "100%" : 220 }} />
          <select value={fMode} onChange={e => setFMode(e.target.value)} style={sel}>
            <option value="">Tất cả hình thức</option>
            <option>On-site</option><option>Hybrid</option><option>Remote</option>
          </select>
          <select value={fStatus} onChange={e => setFStatus(e.target.value)} style={sel}>
            <option value="">Tất cả trạng thái</option>
            <option value="applied">Đã apply</option>
            <option value="viewed">Đã xem CV</option>
            <option value="downloaded">Đã tải CV</option>
          </select>
          <select value={fMonth} onChange={e => setFMonth(e.target.value)} style={sel}>
            <option value="">Tất cả tháng</option>
            {uniqueMonths.map(m => <option key={m} value={m}>Tháng {m}</option>)}
          </select>
          <select value={fYear} onChange={e => setFYear(e.target.value)} style={sel}>
            <option value="">Tất cả năm</option>
            {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
            {saving && <span style={{ fontSize: 12, color: "#888" }}>Đang lưu...</span>}
            <button onClick={() => setModal({ mode: "add" })}
              style={{ fontSize: 12, padding: "5px 14px", borderRadius: 6, border: "none", background: "#1a1a18", color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>
              + Thêm job
            </button>
            <span style={{ fontSize: 12, color: "#888" }}>{filtered.length} {filtered.length === 1 ? "job" : "jobs"}</span>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflow: "auto", padding: isMobile ? "0 16px 88px" : "0 24px 88px" }}>

        {/* Mobile: card list */}
        {isMobile ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {!filtered.length
              ? <p style={{ textAlign: "center", color: "#888", padding: 32 }}>Không tìm thấy kết quả.</p>
              : filtered.map((j, i) => {
                const b = badge(j.status);
                return (
                  <div key={j._idx} style={{ background: "#fff", borderRadius: 10, border: "0.5px solid #e0e0dc", padding: "12px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, color: "#aaa", marginBottom: 2 }}>{i + 1}</div>
                        {j.url
                          ? <a href={j.url} target="_blank" rel="noreferrer" style={{ color: "#185FA5", textDecoration: "none", fontSize: 13, fontWeight: 500, lineHeight: 1.4 }}>{j.title}</a>
                          : <span style={{ fontSize: 13, fontWeight: 500 }}>{j.title}</span>}
                        <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{j.company}</div>
                      </div>
                      <select value={j.status} onChange={e => handleStatusChange(j._idx, e.target.value)}
                        style={{ padding: "3px 6px", borderRadius: 6, fontSize: 11, fontWeight: 500, background: b.bg, color: b.color, border: "none", cursor: "pointer", fontFamily: "inherit", outline: "none", flexShrink: 0 }}>
                        <option value="applied">Đã apply</option>
                        <option value="viewed">Đã xem CV</option>
                        <option value="downloaded">Đã tải CV</option>
                      </select>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: "#aaa" }}>{j.loc} · {j.mode} · {String(j.month).padStart(2, "0")}/{j.year}</span>
                      <div style={{ display: "flex", gap: 6 }}>
                        {j.jd && <button onClick={() => setViewJd({ title: j.title, jd: j.jd })}
                          style={{ fontSize: 11, padding: "3px 10px", borderRadius: 5, border: "0.5px solid #ccc", background: "#fff", cursor: "pointer", fontFamily: "inherit" }}>JD</button>}
                        <button onClick={() => setModal({ mode: "edit", index: j._idx })}
                          style={{ fontSize: 11, padding: "3px 10px", borderRadius: 5, border: "0.5px solid #ccc", background: "#fff", cursor: "pointer", fontFamily: "inherit" }}>Sửa</button>
                        <button onClick={() => handleDelete(j._idx)}
                          style={{ fontSize: 11, padding: "3px 10px", borderRadius: 5, border: "0.5px solid #fca5a5", background: "#fff", color: "#dc2626", cursor: "pointer", fontFamily: "inherit" }}>Xoá</button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          /* Desktop: table */
          <div style={{ background: "#fff", borderRadius: 10, border: "0.5px solid #e0e0dc" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: "3%" }} /><col style={{ width: "22%" }} /><col style={{ width: "16%" }} />
                <col style={{ width: "7%" }} /><col style={{ width: "8%" }} /><col style={{ width: "6%" }} />
                <col style={{ width: "5%" }} /><col style={{ width: "11%" }} /><col style={{ width: "8%" }} /><col style={{ width: "14%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={thNC}>#</th>
                  <th style={thL} onClick={() => handleSort("title")}>Vị trí{sortCol === "title" ? (sortAsc ? " ↑" : " ↓") : " ↕"}</th>
                  <th style={thL} onClick={() => handleSort("company")}>Công ty{sortCol === "company" ? (sortAsc ? " ↑" : " ↓") : " ↕"}</th>
                  <th style={thC}>Địa điểm</th>
                  <th style={thC}>Hình thức</th>
                  <th style={thC} onClick={() => handleSort("month")}>Tháng{sortCol === "month" ? (sortAsc ? " ↑" : " ↓") : " ↕"}</th>
                  <th style={thC} onClick={() => handleSort("year")}>Năm{sortCol === "year" ? (sortAsc ? " ↑" : " ↓") : " ↕"}</th>
                  <th style={thL} onClick={() => handleSort("status")}>Trạng thái{sortCol === "status" ? (sortAsc ? " ↑" : " ↓") : " ↕"}</th>
                  <th style={thNC}>JD</th>
                  <th style={thNC}></th>
                </tr>
              </thead>
              <tbody>
                {!filtered.length
                  ? <tr><td colSpan={10} style={{ padding: 32, textAlign: "center", color: "#888" }}>Không tìm thấy kết quả.</td></tr>
                  : filtered.map((j, i) => {
                    const b = badge(j.status);
                    return (
                      <tr key={j._idx} style={{ borderBottom: "0.5px solid #f0f0ec" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#fafaf8"}
                        onMouseLeave={e => e.currentTarget.style.background = ""}>
                        <td style={{ padding: "6px 10px", color: "#888", textAlign: "center" }}>{i + 1}</td>
                        <td style={{ padding: "6px 10px" }}>
                          {j.url ? <a href={j.url} target="_blank" rel="noreferrer" style={{ color: "#185FA5", textDecoration: "none" }}>{j.title}</a> : j.title}
                        </td>
                        <td style={{ padding: "6px 10px", color: "#888" }}>{j.company}</td>
                        <td style={{ padding: "6px 10px", color: "#888", textAlign: "center" }}>{j.loc}</td>
                        <td style={{ padding: "6px 10px", textAlign: "center" }}>
                          <span style={{ padding: "2px 6px", borderRadius: 6, fontSize: 11, border: "0.5px solid #ddd", color: "#666" }}>{j.mode}</span>
                        </td>
                        <td style={{ padding: "6px 10px", color: "#888", textAlign: "center" }}>{String(j.month).padStart(2, "0")}</td>
                        <td style={{ padding: "6px 10px", color: "#888", textAlign: "center" }}>{j.year}</td>
                        <td style={{ padding: "4px 10px" }}>
                          <select value={j.status} onChange={e => handleStatusChange(j._idx, e.target.value)}
                            style={{ padding: "2px 6px", borderRadius: 6, fontSize: 11, fontWeight: 500, background: b.bg, color: b.color, border: "none", cursor: "pointer", fontFamily: "inherit", outline: "none" }}>
                            <option value="applied">Đã apply</option>
                            <option value="viewed">Đã xem CV</option>
                            <option value="downloaded">Đã tải CV</option>
                          </select>
                        </td>
                        <td style={{ padding: "6px 8px", textAlign: "center" }}>
                          {j.jd &&
                            <button onClick={() => setViewJd({ title: j.title, jd: j.jd })}
                              style={{ fontSize: 11, padding: "3px 8px", borderRadius: 5, border: "0.5px solid #ccc", background: "#fff", cursor: "pointer", fontFamily: "inherit" }}>
                              JD
                            </button>}
                        </td>
                        <td style={{ padding: "6px 8px", textAlign: "center", whiteSpace: "nowrap" }}>
                          <button onClick={() => setModal({ mode: "edit", index: j._idx })}
                            style={{ fontSize: 11, padding: "3px 8px", borderRadius: 5, border: "0.5px solid #ccc", background: "#fff", cursor: "pointer", marginRight: 4, fontFamily: "inherit" }}>
                            Sửa
                          </button>
                          <button onClick={() => handleDelete(j._idx)}
                            style={{ fontSize: 11, padding: "3px 8px", borderRadius: 5, border: "0.5px solid #fca5a5", background: "#fff", color: "#dc2626", cursor: "pointer", fontFamily: "inherit" }}>
                            Xoá
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        {/* Modals */}
        {modal?.mode === "add" && <JobModal onSave={handleAdd} onClose={() => setModal(null)} />}
        {modal?.mode === "edit" && <JobModal initial={jobs[modal.index]} onSave={handleEdit} onClose={() => setModal(null)} />}
        {viewJd && <JdViewModal title={viewJd.title} jd={viewJd.jd} onClose={() => setViewJd(null)} />}
      </div>
      <JtChatBot username={username} token={token} />
    </div>
  );
}

// ── Job Tracker Profile Page ───────────────────────────────────────────────────
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const EXP_YEARS = Array.from({ length: 40 }, (_, i) => new Date().getFullYear() - i);

const parsePeriod = (period) => {
  if (!period) return { startMonth: "", startYear: "", endMonth: "", endYear: "", current: false };
  const isCurrent = period.includes("Present");
  const parts = period.split("·").map(s => s.trim());
  const parseMonthYear = (str) => {
    if (!str) return { month: "", year: "" };
    const tokens = str.trim().split(" ");
    if (tokens.length === 2 && MONTHS.includes(tokens[0])) return { month: tokens[0], year: tokens[1] };
    return { month: "", year: tokens[0] };
  };
  const start = parseMonthYear(parts[0] || "");
  const end = isCurrent ? { month: "", year: "" } : parseMonthYear(parts[1] || "");
  return { startMonth: start.month, startYear: start.year, endMonth: end.month, endYear: end.year, current: isCurrent };
};

const buildPeriod = (startMonth, startYear, endMonth, endYear, current) => {
  const start = [startMonth, startYear].filter(Boolean).join(" ");
  if (current) return start ? `${start} · Present` : "Present";
  const end = [endMonth, endYear].filter(Boolean).join(" ");
  return end ? `${start} · ${end}` : start;
};

const EMPTY_EXP = () => ({ role: "", company: "", startMonth: "", startYear: "", endMonth: "", endYear: "", current: false, description: "" });
const EMPTY_EDU = () => ({ degree: "", school: "", period: "" });

function JtProfilePage({ username, token }) {
  const [tab, setTab] = useState("info");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [resumeExists, setResumeExists] = useState(false);
  const [resumeUrl, setResumeUrl] = useState(null);
  const [importing, setImporting] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const fileInputRef = useRef(null);
  const [info, setInfo] = useState({ name: "", title: "", location: "", email: "", phone: "", linkedin: "", about: "" });
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [experiences, setExperiences] = useState([]);
  const [educations, setEducations] = useState([]);

  useEffect(() => {
    fetch(`/api/jobtracker/profile/${username}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        setInfo({ name: d.name || "", title: d.title || "", location: d.location || "", email: d.email || "", phone: d.phone || "", linkedin: d.linkedin || "", about: d.about || "" });
        setSkills(d.skills || []);
        setExperiences((d.experiences || []).map(e => {
          const parsed = parsePeriod(e.period || "");
          return { role: e.role || "", company: e.company || "", description: e.description || "", ...parsed };
        }));
        setEducations(d.educations || []);
      })
      .catch(() => {});
    fetch(`/api/jobtracker/resume/${username}/check`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setResumeExists(d.exists)).catch(() => {});
  }, [username, token]);

  const handleViewResume = async () => {
    const res = await fetch(`/api/jobtracker/resume/${username}`, { headers: { Authorization: `Bearer ${token}` } });
    const blob = await res.blob();
    setResumeUrl(URL.createObjectURL(blob));
  };
  const handleCloseResume = () => { URL.revokeObjectURL(resumeUrl); setResumeUrl(null); };
  const handleFileSelected = (e) => {
    const file = e.target.files[0]; e.target.value = "";
    if (file) setPendingFile(file);
  };

  const handleUpload = async (withImport) => {
    const file = pendingFile; setPendingFile(null);
    setImporting(true);
    const form = new FormData(); form.append("file", file);
    try {
      const url = `/api/jobtracker/resume/${username}${withImport ? "?import=true" : ""}`;
      const res = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form });
      const data = await res.json();
      setResumeExists(true);
      if (withImport && data.profile) {
        const p = data.profile;
        setInfo(f => ({
          name: p.name || f.name, title: p.title || f.title, location: p.location || f.location,
          email: p.email || f.email, phone: p.phone || f.phone, linkedin: p.linkedin || f.linkedin,
          about: p.about || f.about,
        }));
        if (p.skills?.length)      setSkills(p.skills);
        if (p.experiences?.length) setExperiences(p.experiences.map(e => {
          const parsed = parsePeriod(e.period || "");
          return { role: e.role || "", company: e.company || "", description: e.description || "", ...parsed };
        }));
        if (p.educations?.length)  setEducations(p.educations);
      }
    } catch {}
    setImporting(false);
  };
  const handleDeleteResume = async () => {
    if (!confirm("Xóa Resume hiện tại?")) return;
    await fetch(`/api/jobtracker/resume/${username}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    setResumeExists(false);
  };

  const save = async (data) => {
    setSaving(true);
    await fetch(`/api/jobtracker/profile/${username}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inp = { fontSize: 13, padding: "7px 10px", borderRadius: 6, border: "0.5px solid #ccc", width: "100%", boxSizing: "border-box", fontFamily: "inherit", outline: "none", background: "#fff" };
  const lbl = { fontSize: 12, color: "#555", display: "block", marginBottom: 4, marginTop: 12 };
  const card = { background: "#fff", border: "0.5px solid #e0e0dc", borderRadius: 10, padding: "16px 18px", marginBottom: 10 };
  const tabs = ["info", "skills", "exp", "edu"];
  const tabLabels = { info: "Cá nhân", skills: "Kỹ năng", exp: "Kinh nghiệm", edu: "Học vấn" };

  const addSkill = () => {
    const v = skillInput.trim();
    if (v && !skills.includes(v)) setSkills(s => [...s, v]);
    setSkillInput("");
  };

  const setExp = (i, k, v) => setExperiences(prev => prev.map((e, idx) => idx === i ? { ...e, [k]: v } : e));
  const setEdu = (i, k, v) => setEducations(prev => prev.map((e, idx) => idx === i ? { ...e, [k]: v } : e));

  return (
    <div style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", fontSize: 13, background: "#f5f5f3", color: "#1a1a18", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 0", maxWidth: 720, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => window.location.href = `/jobtracker/${username}`}
              style={{ fontSize: 12, color: "#888", background: "none", border: "0.5px solid #ccc", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontFamily: "inherit" }}>
              ← Quay lại
            </button>
            <h1 style={{ fontSize: 18, fontWeight: 500, margin: 0 }}>Hồ sơ cá nhân</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: "#888" }}>{username}</span>
            <button onClick={() => { localStorage.removeItem("jt_token"); window.location.href = "/jobtracker"; }}
              style={{ fontSize: 12, color: "#888", background: "none", border: "0.5px solid #ccc", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontFamily: "inherit" }}>
              Sign out
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: "0.5px solid #e0e0dc", marginBottom: 20 }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ fontSize: 13, padding: "8px 18px", background: "none", border: "none", borderBottom: tab === t ? "2px solid #1a1a18" : "2px solid transparent", color: tab === t ? "#1a1a18" : "#888", cursor: "pointer", fontFamily: "inherit", fontWeight: tab === t ? 500 : 400, marginBottom: -1 }}>
              {tabLabels[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px 40px" }}>

        {/* Tab: Cá nhân */}
        {tab === "info" && (
          <div>
            <div style={card}>
              {[["name", "Họ tên"], ["title", "Vị trí / Chức danh"], ["location", "Địa điểm"], ["email", "Email"], ["phone", "Số điện thoại"], ["linkedin", "LinkedIn URL"]].map(([k, l]) => (
                <div key={k}>
                  <label style={lbl}>{l}</label>
                  <input value={info[k]} onChange={e => setInfo(f => ({ ...f, [k]: e.target.value }))} style={inp} />
                </div>
              ))}
              <label style={lbl}>Giới thiệu bản thân</label>
              <textarea value={info.about} onChange={e => setInfo(f => ({ ...f, about: e.target.value }))}
                placeholder="Mô tả ngắn về bản thân, định hướng nghề nghiệp..."
                style={{ ...inp, height: 100, resize: "vertical", lineHeight: 1.6 }} />
            </div>

            {/* Resume section */}
            <div style={{ ...card }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>Resume (PDF)</div>
                  <div style={{ fontSize: 12, color: resumeExists ? "#27500A" : "#aaa" }}>
                    {importing ? "Đang phân tích resume..." : resumeExists ? "Đã có resume" : "Chưa upload resume"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  {resumeExists && !importing && <>
                    <button onClick={handleViewResume}
                      style={{ fontSize: 12, padding: "5px 12px", borderRadius: 6, border: "0.5px solid #ccc", background: "#fff", cursor: "pointer", fontFamily: "inherit" }}>Xem</button>
                    <button onClick={handleDeleteResume}
                      style={{ fontSize: 12, padding: "5px 12px", borderRadius: 6, border: "0.5px solid #fca5a5", background: "#fff", color: "#dc2626", cursor: "pointer", fontFamily: "inherit" }}>Xóa</button>
                  </>}
                  <button onClick={() => fileInputRef.current?.click()} disabled={importing}
                    style={{ fontSize: 12, padding: "5px 12px", borderRadius: 6, border: "0.5px solid #ccc", background: "#fff", cursor: importing ? "default" : "pointer", opacity: importing ? 0.5 : 1, fontFamily: "inherit" }}>
                    {importing ? "Đang xử lý..." : "↑ Upload"}
                  </button>
                  <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileSelected} style={{ display: "none" }} />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, alignItems: "center" }}>
              {saved && <span style={{ fontSize: 12, color: "#27500A" }}>Đã lưu ✓</span>}
              <button onClick={() => save(info)} disabled={saving}
                style={{ fontSize: 13, padding: "7px 20px", borderRadius: 6, border: "none", background: "#1a1a18", color: "#fff", cursor: saving ? "default" : "pointer", opacity: saving ? 0.6 : 1, fontFamily: "inherit" }}>
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        )}
        {resumeUrl && <ResumeViewModal url={resumeUrl} onClose={handleCloseResume} />}

        {pendingFile && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}
            onClick={e => e.target === e.currentTarget && setPendingFile(null)}>
            <div style={{ background: "#fff", borderRadius: 12, padding: "28px 28px 24px", width: 400, maxWidth: "92vw", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Upload Resume</h2>
              <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6, marginBottom: 20 }}>
                Bạn có muốn AI phân tích Resume và tự động điền thông tin vào hồ sơ không?<br />
                <span style={{ fontSize: 12, color: "#aaa" }}>Chọn "Chỉ upload" nếu chỉ muốn lưu file.</span>
              </p>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button onClick={() => handleUpload(false)}
                  style={{ padding: "8px 18px", borderRadius: 6, border: "0.5px solid #ccc", background: "#fff", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                  Chỉ upload
                </button>
                <button onClick={() => handleUpload(true)}
                  style={{ padding: "8px 18px", borderRadius: 6, border: "none", background: "#1a1a18", color: "#fff", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                  Phân tích và điền thông tin
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Kỹ năng */}
        {tab === "skills" && (
          <div>
            <div style={card}>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                  placeholder="Nhập kỹ năng rồi Enter..." style={{ ...inp, flex: 1 }} />
                <button onClick={addSkill}
                  style={{ fontSize: 12, padding: "7px 16px", borderRadius: 6, border: "0.5px solid #ccc", background: "#fff", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                  + Thêm
                </button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {skills.length === 0 && <span style={{ fontSize: 12, color: "#aaa" }}>Chưa có kỹ năng nào.</span>}
                {skills.map((s, i) => (
                  <span key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, padding: "4px 10px", borderRadius: 20, border: "0.5px solid #ccc", background: "#f5f5f3" }}>
                    {s}
                    <button onClick={() => setSkills(prev => prev.filter((_, idx) => idx !== i))}
                      style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
                  </span>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, alignItems: "center" }}>
              {saved && <span style={{ fontSize: 12, color: "#27500A" }}>Đã lưu ✓</span>}
              <button onClick={() => save({ skills })} disabled={saving}
                style={{ fontSize: 13, padding: "7px 20px", borderRadius: 6, border: "none", background: "#1a1a18", color: "#fff", cursor: saving ? "default" : "pointer", opacity: saving ? 0.6 : 1, fontFamily: "inherit" }}>
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        )}

        {/* Tab: Kinh nghiệm */}
        {tab === "exp" && (
          <div>
            {experiences.map((e, i) => (
              <div key={i} style={{ ...card, position: "relative" }}>
                <button onClick={() => setExperiences(prev => prev.filter((_, idx) => idx !== i))}
                  style={{ position: "absolute", top: 12, right: 14, background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div><label style={lbl}>Vị trí / Chức danh</label><input value={e.role} onChange={ev => setExp(i, "role", ev.target.value)} style={inp} placeholder="Senior Data Analyst" /></div>
                  <div><label style={lbl}>Công ty</label><input value={e.company} onChange={ev => setExp(i, "company", ev.target.value)} style={inp} placeholder="Công ty ABC" /></div>
                  <div style={{ gridColumn: "1/-1" }}>
                    <label style={lbl}>Thời gian</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <select value={e.startMonth} onChange={ev => setExp(i, "startMonth", ev.target.value)}
                        style={{ fontSize: 12, padding: "6px 8px", borderRadius: 6, border: "0.5px solid #ccc", background: "#fff", fontFamily: "inherit", outline: "none", cursor: "pointer" }}>
                        <option value="">Tháng</option>
                        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <select value={e.startYear} onChange={ev => setExp(i, "startYear", ev.target.value)}
                        style={{ fontSize: 12, padding: "6px 8px", borderRadius: 6, border: "0.5px solid #ccc", background: "#fff", fontFamily: "inherit", outline: "none", cursor: "pointer" }}>
                        <option value="">Năm</option>
                        {EXP_YEARS.map(y => <option key={y} value={String(y)}>{y}</option>)}
                      </select>
                      <span style={{ color: "#aaa", fontSize: 12 }}>→</span>
                      {!e.current && <>
                        <select value={e.endMonth} onChange={ev => setExp(i, "endMonth", ev.target.value)}
                          style={{ fontSize: 12, padding: "6px 8px", borderRadius: 6, border: "0.5px solid #ccc", background: "#fff", fontFamily: "inherit", outline: "none", cursor: "pointer" }}>
                          <option value="">Tháng</option>
                          {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <select value={e.endYear} onChange={ev => setExp(i, "endYear", ev.target.value)}
                          style={{ fontSize: 12, padding: "6px 8px", borderRadius: 6, border: "0.5px solid #ccc", background: "#fff", fontFamily: "inherit", outline: "none", cursor: "pointer" }}>
                          <option value="">Năm</option>
                          {EXP_YEARS.map(y => <option key={y} value={String(y)}>{y}</option>)}
                        </select>
                      </>}
                      <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#555", cursor: "pointer", userSelect: "none" }}>
                        <input type="checkbox" checked={e.current} onChange={ev => setExp(i, "current", ev.target.checked)} />
                        Hiện tại
                      </label>
                    </div>
                  </div>
                </div>
                <label style={lbl}>Mô tả công việc</label>
                <textarea value={e.description} onChange={ev => setExp(i, "description", ev.target.value)}
                  placeholder="Mô tả trách nhiệm, thành tích..." style={{ ...inp, height: 80, resize: "vertical", lineHeight: 1.6 }} />
              </div>
            ))}
            <button onClick={() => setExperiences(prev => [...prev, EMPTY_EXP()])}
              style={{ width: "100%", padding: "10px", borderRadius: 8, border: "0.5px dashed #ccc", background: "#fff", color: "#888", cursor: "pointer", fontSize: 13, fontFamily: "inherit", marginBottom: 12 }}>
              + Thêm kinh nghiệm
            </button>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, alignItems: "center" }}>
              {saved && <span style={{ fontSize: 12, color: "#27500A" }}>Đã lưu ✓</span>}
              <button onClick={() => save({ experiences: experiences.map(({ startMonth, startYear, endMonth, endYear, current, ...rest }) => ({ ...rest, period: buildPeriod(startMonth, startYear, endMonth, endYear, current) })) })} disabled={saving}
                style={{ fontSize: 13, padding: "7px 20px", borderRadius: 6, border: "none", background: "#1a1a18", color: "#fff", cursor: saving ? "default" : "pointer", opacity: saving ? 0.6 : 1, fontFamily: "inherit" }}>
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        )}

        {/* Tab: Học vấn */}
        {tab === "edu" && (
          <div>
            {educations.map((e, i) => (
              <div key={i} style={{ ...card, position: "relative" }}>
                <button onClick={() => setEducations(prev => prev.filter((_, idx) => idx !== i))}
                  style={{ position: "absolute", top: 12, right: 14, background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div style={{ gridColumn: "1/-1" }}><label style={lbl}>Bằng cấp / Chương trình học</label><input value={e.degree} onChange={ev => setEdu(i, "degree", ev.target.value)} style={inp} placeholder="Cử nhân Kinh tế" /></div>
                  <div><label style={lbl}>Trường</label><input value={e.school} onChange={ev => setEdu(i, "school", ev.target.value)} style={inp} placeholder="ĐH Kinh tế TP.HCM" /></div>
                  <div><label style={lbl}>Thời gian</label><input value={e.period} onChange={ev => setEdu(i, "period", ev.target.value)} style={inp} placeholder="2018 - 2022" /></div>
                </div>
              </div>
            ))}
            <button onClick={() => setEducations(prev => [...prev, EMPTY_EDU()])}
              style={{ width: "100%", padding: "10px", borderRadius: 8, border: "0.5px dashed #ccc", background: "#fff", color: "#888", cursor: "pointer", fontSize: 13, fontFamily: "inherit", marginBottom: 12 }}>
              + Thêm học vấn
            </button>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, alignItems: "center" }}>
              {saved && <span style={{ fontSize: 12, color: "#27500A" }}>Đã lưu ✓</span>}
              <button onClick={() => save({ educations })} disabled={saving}
                style={{ fontSize: 13, padding: "7px 20px", borderRadius: 6, border: "none", background: "#1a1a18", color: "#fff", cursor: saving ? "default" : "pointer", opacity: saving ? 0.6 : 1, fontFamily: "inherit" }}>
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── App Router ─────────────────────────────────────────────────────────────────
export default function JobTrackerApp() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  const urlUsername = parts.length >= 2 ? parts[1] : null;
  const subPage = parts[2] || null;
  const auth = getTokenData();

  if (!urlUsername) {
    if (auth) { window.location.href = `/jobtracker/${auth.username}`; return null; }
    return <LoginPage />;
  }
  if (!auth) { window.location.href = "/jobtracker"; return null; }
  if (auth.username !== urlUsername) { localStorage.removeItem("jt_token"); window.location.href = "/jobtracker"; return null; }
  if (subPage === "profile") return <JtProfilePage username={urlUsername} token={auth.token} />;
  return <TrackerPage username={urlUsername} token={auth.token} />;
}
