import { useState, useEffect } from "react";
import JobModal from "./JobModal";
import JdViewModal from "./JdViewModal";
import { JtChatBot } from "./JtChat";
import MultiSelect, { MODE_OPTIONS, STATUS_OPTIONS } from "./MultiSelect";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return isMobile;
}

function badge(status) {
  if (status === "not_applied")  return { text: "Chưa apply",      bg: "#FFF3E0", color: "#7C4500" };
  if (status === "viewed")       return { text: "Đã xem CV",       bg: "#E6F1FB", color: "#0C447C" };
  if (status === "downloaded")   return { text: "Đã tải CV",       bg: "#EAF3DE", color: "#27500A" };
  if (status === "interviewing") return { text: "Đang phỏng vấn",  bg: "#F5F0FF", color: "#6D28D9" };
  if (status === "waiting")      return { text: "Chờ kết quả",     bg: "#FFFBEB", color: "#B45309" };
  if (status === "rejected")     return { text: "Đã từ chối",      bg: "#FFF5F5", color: "#E57373" };
  if (status === "failed")       return { text: "Rớt",             bg: "#FFEBEE", color: "#B71C1C" };
  return                                { text: "Đã apply",        bg: "#F1EFE8", color: "#5F5E5A" };
}

// Load saved filter state from localStorage for this user.
// Sets are serialized as arrays; null means "no filter" (Select All).
function loadSavedFilters(username) {
  try { return JSON.parse(localStorage.getItem(`jt_filters_${username}`) || "{}"); }
  catch { return {}; }
}

export default function TrackerPage({ username, token }) {
  const isMobile = useIsMobile();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  // Restore filter/sort state from localStorage on first render.
  const _saved = loadSavedFilters(username);
  const [sortCol, setSortCol] = useState(_saved.sortCol ?? null);
  const [sortAsc, setSortAsc] = useState(_saved.sortAsc ?? true);
  const [fModes, setFModes] = useState(_saved.fModes ? new Set(_saved.fModes) : null);
  const [fStatuses, setFStatuses] = useState(_saved.fStatuses ? new Set(_saved.fStatuses) : null);
  const [fMonths, setFMonths] = useState(_saved.fMonths ? new Set(_saved.fMonths) : null);
  const [fYears, setFYears] = useState(_saved.fYears ? new Set(_saved.fYears) : null);

  // Persist filter/sort state whenever it changes (search box is intentionally excluded).
  useEffect(() => {
    const toArr = s => (s instanceof Set ? [...s] : null);
    localStorage.setItem(`jt_filters_${username}`, JSON.stringify({
      sortCol, sortAsc,
      fModes: toArr(fModes), fStatuses: toArr(fStatuses),
      fMonths: toArr(fMonths), fYears: toArr(fYears),
    }));
  }, [sortCol, sortAsc, fModes, fStatuses, fMonths, fYears, username]);
  const [modal, setModal] = useState(null);
  const [viewJd, setViewJd] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [analyzeMsg, setAnalyzeMsg] = useState(null);
  const [analyzeAlert, setAnalyzeAlert] = useState(null);

  const handleAnalyze = (j) => {
    if (!j.jd) {
      setAnalyzeAlert("Job này chưa có JD. Hãy thêm JD rồi nhấn Phân tích lại nhé!");
      setTimeout(() => setAnalyzeAlert(null), 4000);
      return;
    }
    const api = `[PHÂN TÍCH MỚI - đánh giá độc lập, không tham chiếu kết quả phân tích trước đó trong cuộc trò chuyện này]\n\nPhân tích job sau và đánh giá mức độ phù hợp với Hồ sơ hiện tại của tôi (lấy từ hệ thống, đã bao gồm mọi cập nhật mới nhất):\n\n**Vị trí**: ${j.title}\n**Công ty**: ${j.company}\n**Địa điểm**: ${j.loc} · ${j.mode}${j.url ? `\n**Link**: ${j.url}` : ""}\n\n**Job Description**:\n${j.jd}\n\nHãy đánh giá:\n(1) Mức độ phù hợp (%) — chấm điểm theo tiêu chí: yêu cầu bắt buộc đáp ứng được / tổng yêu cầu bắt buộc\n(2) Điểm mạnh — kỹ năng/kinh nghiệm thực sự khớp với JD\n(3) Điểm yếu/thiếu sót — những gì JD yêu cầu mà Hồ sơ chưa có\n(4) Những điểm cần lưu ý khi apply`;
    setAnalyzeMsg({ display: `Phân tích job: ${j.title} @ ${j.company}`, api });
    setChatOpen(true);
  };

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
    if (fModes !== null && fModes.size > 0 && !fModes.has(j.mode)) return false;
    if (fStatuses !== null && fStatuses.size > 0 && !fStatuses.has(j.status)) return false;
    if (fMonths !== null && fMonths.size > 0 && !fMonths.has(j.month)) return false;
    if (fYears !== null && fYears.size > 0 && !fYears.has(j.year)) return false;
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

  const counts = {
    na: jobs.filter(j => j.status === "not_applied").length,
    a:  jobs.filter(j => j.status === "applied").length,
    v:  jobs.filter(j => j.status === "viewed").length,
    d:  jobs.filter(j => j.status === "downloaded").length,
    iv: jobs.filter(j => j.status === "interviewing").length,
    wt: jobs.filter(j => j.status === "waiting").length,
    rj: jobs.filter(j => j.status === "rejected").length,
    fl: jobs.filter(j => j.status === "failed").length,
  };

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
        <div style={isMobile
          ? { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: 12 }
          : { display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
          {[
            { num: jobs.length,     label: "Tổng jobs" },
            { num: counts.na,       label: "Chưa apply",      color: "#7C4500" },
            { num: counts.a,        label: "Đã apply",        color: "#5F5E5A" },
            { num: counts.v,        label: "Đã xem CV",       color: "#0C447C" },
            { num: counts.d,        label: "Đã tải CV",       color: "#27500A" },
            { num: counts.iv,       label: "Đang phỏng vấn",  color: "#6D28D9" },
            { num: counts.wt,       label: "Chờ kết quả",     color: "#B45309" },
            { num: counts.rj,       label: "Đã từ chối",      color: "#E57373" },
            { num: counts.fl,       label: "Rớt",             color: "#B71C1C" },
            { num: filtered.length, label: "Đang hiển thị" },
          ].map(({ num, label, color }) => (
            <div key={label} style={{ background: "#fff", border: "0.5px solid #e0e0dc", borderRadius: 8, padding: isMobile ? "8px 10px" : "10px 16px", minWidth: isMobile ? 0 : 100 }}>
              <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 500, color: color || "#1a1a18" }}>{num}</div>
              <div style={{ fontSize: isMobile ? 10 : 11, color: "#888", marginTop: 2, lineHeight: 1.3 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12, alignItems: "center" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Tìm theo tên job / công ty..." style={{ ...sel, width: isMobile ? "100%" : 220 }} />
          <MultiSelect label="Hình thức" options={MODE_OPTIONS} selected={fModes} onChange={setFModes} />
          <MultiSelect label="Trạng thái" options={STATUS_OPTIONS} selected={fStatuses} onChange={setFStatuses} />
          <MultiSelect label="Tháng" options={uniqueMonths.map(m => ({ value: m, label: `Tháng ${m}` }))} selected={fMonths} onChange={setFMonths} />
          <MultiSelect label="Năm" options={uniqueYears.map(y => ({ value: y, label: String(y) }))} selected={fYears} onChange={setFYears} />
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
                        <option value="not_applied">Chưa apply</option>
                        <option value="applied">Đã apply</option>
                        <option value="viewed">Đã xem CV</option>
                        <option value="downloaded">Đã tải CV</option>
                        <option value="interviewing">Đang phỏng vấn</option>
                        <option value="waiting">Chờ kết quả</option>
                        <option value="rejected">Đã từ chối</option>
                        <option value="failed">Rớt</option>
                      </select>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: "#aaa" }}>{j.loc} · {j.mode} · {String(j.month).padStart(2, "0")}/{j.year}</span>
                      <div style={{ display: "flex", gap: 6 }}>
                        {j.jd && <button onClick={() => setViewJd({ title: j.title, jd: j.jd })}
                          style={{ fontSize: 11, padding: "3px 10px", borderRadius: 5, border: "0.5px solid #ccc", background: "#fff", cursor: "pointer", fontFamily: "inherit" }}>JD</button>}
                        <button onClick={() => handleAnalyze(j)}
                          style={{ fontSize: 11, padding: "3px 10px", borderRadius: 5, border: "0.5px solid #185FA5", background: "#fff", color: "#185FA5", cursor: "pointer", fontFamily: "inherit", visibility: (j.status === "rejected" || j.status === "failed") ? "hidden" : "visible" }}>Phân tích</button>
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
                    const dimmed = j.status === "rejected" || j.status === "failed";
                    const dc = dimmed ? "#B71C1C" : "#888";
                    return (
                      <tr key={j._idx} style={{ borderBottom: "0.5px solid #f0f0ec" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#fafaf8"}
                        onMouseLeave={e => e.currentTarget.style.background = ""}>
                        <td style={{ padding: "6px 10px", color: dc, textAlign: "center" }}>{i + 1}</td>
                        <td style={{ padding: "6px 10px" }}>
                          {j.url ? <a href={j.url} target="_blank" rel="noreferrer" style={{ color: "#185FA5", textDecoration: "none" }}>{j.title}</a> : j.title}
                        </td>
                        <td style={{ padding: "6px 10px", color: dc }}>{j.company}</td>
                        <td style={{ padding: "6px 10px", color: dc, textAlign: "center" }}>{j.loc}</td>
                        <td style={{ padding: "6px 10px", textAlign: "center" }}>
                          <span style={{ padding: "2px 6px", borderRadius: 6, fontSize: 11, border: "0.5px solid #ddd", color: dimmed ? "#B71C1C" : "#666" }}>{j.mode}</span>
                        </td>
                        <td style={{ padding: "6px 10px", color: dc, textAlign: "center" }}>{String(j.month).padStart(2, "0")}</td>
                        <td style={{ padding: "6px 10px", color: dc, textAlign: "center" }}>{j.year}</td>
                        <td style={{ padding: "4px 10px" }}>
                          <select value={j.status} onChange={e => handleStatusChange(j._idx, e.target.value)}
                            style={{ padding: "2px 6px", borderRadius: 6, fontSize: 11, fontWeight: 500, background: b.bg, color: b.color, border: "none", cursor: "pointer", fontFamily: "inherit", outline: "none" }}>
                            <option value="not_applied">Chưa apply</option>
                            <option value="applied">Đã apply</option>
                            <option value="viewed">Đã xem CV</option>
                            <option value="downloaded">Đã tải CV</option>
                            <option value="interviewing">Đang phỏng vấn</option>
                            <option value="waiting">Chờ kết quả</option>
                            <option value="rejected">Đã từ chối</option>
                            <option value="failed">Rớt</option>
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
                          <button onClick={() => handleAnalyze(j)}
                            style={{ fontSize: 11, padding: "3px 8px", borderRadius: 5, border: "0.5px solid #185FA5", background: "#fff", color: "#185FA5", cursor: "pointer", marginRight: 4, fontFamily: "inherit", visibility: (j.status === "rejected" || j.status === "failed") ? "hidden" : "visible" }}>
                            Phân tích
                          </button>
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

      {analyzeAlert && (
        <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", zIndex: 2000, background: "#1a1a18", color: "#fff", padding: "10px 20px", borderRadius: 8, fontSize: 13, boxShadow: "0 4px 16px rgba(0,0,0,0.25)", whiteSpace: "nowrap", pointerEvents: "none" }}>
          {analyzeAlert}
        </div>
      )}
      <JtChatBot username={username} token={token} open={chatOpen} onToggle={setChatOpen} analyzeMsg={analyzeMsg} clearAnalyze={() => setAnalyzeMsg(null)} isMobile={isMobile} />
    </div>
  );
}
