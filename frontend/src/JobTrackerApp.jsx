import { useState, useEffect } from "react";

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

function getUrlUsername() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  return parts.length >= 2 ? parts[1] : null;
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
  const [modal, setModal] = useState(null); // null | { mode: "add" } | { mode: "edit", index: number }
  const [viewJd, setViewJd] = useState(null); // null | { title, jd }

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
    const updated = [job, ...jobs];
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
    return b.year - a.year || b.month - a.month;
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
          <button onClick={() => { localStorage.removeItem("jt_token"); window.location.href = "/jobtracker"; }}
            style={{ fontSize: 12, color: "#888", background: "none", border: "0.5px solid #ccc", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontFamily: "inherit" }}>
            Sign out
          </button>
        </div>
        <p style={{ fontSize: 12, color: "#888", marginBottom: 20 }}>{username} · {counts.a} vị trí đã apply</p>

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
              + Thêm
            </button>
            <span style={{ fontSize: 12, color: "#888" }}>{filtered.length} vị trí</span>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflow: "auto", padding: isMobile ? "0 16px 24px" : "0 24px 24px" }}>

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
    </div>
  );
}

// ── App Router ─────────────────────────────────────────────────────────────────
export default function JobTrackerApp() {
  const urlUsername = getUrlUsername();
  const auth = getTokenData();

  if (!urlUsername) {
    if (auth) { window.location.href = `/jobtracker/${auth.username}`; return null; }
    return <LoginPage />;
  }
  if (!auth) { window.location.href = "/jobtracker"; return null; }
  if (auth.username !== urlUsername) { localStorage.removeItem("jt_token"); window.location.href = "/jobtracker"; return null; }
  return <TrackerPage username={urlUsername} token={auth.token} />;
}
