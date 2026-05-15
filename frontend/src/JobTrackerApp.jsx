import { useState, useEffect } from "react";

// ── Token helpers ──────────────────────────────────────────────────────────────
function getTokenData() {
  const token = localStorage.getItem("jt_token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem("jt_token");
      return null;
    }
    return { token, username: payload.sub };
  } catch {
    localStorage.removeItem("jt_token");
    return null;
  }
}

function getUrlUsername() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  // ["jobtracker"] or ["jobtracker", "nhanvo"]
  return parts.length >= 2 ? parts[1] : null;
}

// ── Login Page ─────────────────────────────────────────────────────────────────
function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inp = { fontSize: 13, padding: "8px 10px", borderRadius: 6, border: "0.5px solid #ccc", width: "100%", boxSizing: "border-box", outline: "none", fontFamily: "inherit" };
  const lbl = { fontSize: 12, color: "#555", display: "block", marginBottom: 4 };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/jobtracker/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) { setError("Sai username hoặc password."); return; }
      const data = await res.json();
      localStorage.setItem("jt_token", data.access_token);
      window.location.href = `/jobtracker/${data.username}`;
    } catch {
      setError("Không thể kết nối server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f3", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <div style={{ width: 340, background: "#fff", borderRadius: 12, border: "0.5px solid #e0e0dc", padding: "32px 28px" }}>
        <h1 style={{ fontSize: 18, fontWeight: 500, marginBottom: 4, color: "#1a1a18" }}>Job Tracker</h1>
        <p style={{ fontSize: 12, color: "#888", marginBottom: 24 }}>Đăng nhập để xem danh sách job của bạn.</p>
        <form onSubmit={handleSubmit}>
          <label style={lbl}>Username</label>
          <input value={username} onChange={e => setUsername(e.target.value)} required autoFocus style={{ ...inp, marginBottom: 12 }} />
          <label style={lbl}>Password</label>
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

// ── Tracker Page ───────────────────────────────────────────────────────────────
function badge(status) {
  if (status === "viewed")      return { text: "Đã xem CV",  bg: "#E6F1FB", color: "#0C447C" };
  if (status === "downloaded")  return { text: "Đã tải CV",  bg: "#EAF3DE", color: "#27500A" };
  return                               { text: "Applied only", bg: "#F1EFE8", color: "#5F5E5A" };
}

function TrackerPage({ username, token }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortCol, setSortCol] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [search, setSearch] = useState("");
  const [fMode, setFMode] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [fMonth, setFMonth] = useState("");

  useEffect(() => {
    fetch(`/api/jobtracker/jobs/${username}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => {
        if (r.status === 401 || r.status === 403) {
          localStorage.removeItem("jt_token");
          window.location.href = "/jobtracker";
          return null;
        }
        return r.json();
      })
      .then(data => { if (data) setJobs(data.jobs || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [username, token]);

  const handleSort = (col) => {
    if (sortCol === col) setSortAsc(a => !a);
    else { setSortCol(col); setSortAsc(true); }
  };

  const months = [...new Set(jobs.map(j => `${j.year}-${String(j.month).padStart(2, "0")}`))]
    .sort();

  let filtered = jobs.filter(j => {
    if (fMode && j.mode !== fMode) return false;
    if (fStatus && j.status !== fStatus) return false;
    if (fMonth) {
      const [fy, fm] = fMonth.split("-");
      if (j.year !== parseInt(fy) || j.month !== parseInt(fm)) return false;
    }
    const q = search.toLowerCase();
    if (q && !j.title.toLowerCase().includes(q) && !j.company.toLowerCase().includes(q)) return false;
    return true;
  });

  if (sortCol) {
    filtered = [...filtered].sort((a, b) => {
      let va = a[sortCol], vb = b[sortCol];
      if (typeof va === "string") { va = va.toLowerCase(); vb = vb.toLowerCase(); }
      return sortAsc ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
  }

  const sel = { fontSize: 12, padding: "5px 8px", borderRadius: 6, border: "0.5px solid #ccc", background: "#fff", color: "#333", fontFamily: "inherit" };
  const th = { background: "#f5f5f3", color: "#666", fontWeight: 500, fontSize: 11, padding: "8px 10px", textAlign: "left", borderBottom: "0.5px solid #e0e0dc", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap", position: "sticky", top: 0, zIndex: 1 };

  const counts = { v: jobs.filter(j => j.status === "viewed").length, d: jobs.filter(j => j.status === "downloaded").length, a: jobs.filter(j => j.status === "applied").length };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f3", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <p style={{ color: "#888" }}>Đang tải...</p>
    </div>
  );

  return (
    <div style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", fontSize: 13, background: "#f5f5f3", color: "#1a1a18", padding: 24, minHeight: "100vh", boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <h1 style={{ fontSize: 20, fontWeight: 500 }}>LinkedIn Job Tracker</h1>
        <button onClick={() => { localStorage.removeItem("jt_token"); window.location.href = "/jobtracker"; }}
          style={{ fontSize: 12, color: "#888", background: "none", border: "0.5px solid #ccc", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontFamily: "inherit" }}>
          Sign out
        </button>
      </div>
      <p style={{ fontSize: 12, color: "#888", marginBottom: 20 }}>{username} · {jobs.length} jobs tổng cộng</p>

      {/* Stats */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        {[
          { num: jobs.length,     label: "Tổng jobs" },
          { num: counts.v,        label: "Đã xem CV",    color: "#0C447C" },
          { num: counts.d,        label: "Đã tải CV",    color: "#27500A" },
          { num: counts.a,        label: "Applied only", color: "#5F5E5A" },
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
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Tìm theo tên job / công ty..."
          style={{ ...sel, width: 220 }} />
        <select value={fMode} onChange={e => setFMode(e.target.value)} style={sel}>
          <option value="">Tất cả hình thức</option>
          <option>On-site</option><option>Hybrid</option><option>Remote</option>
        </select>
        <select value={fStatus} onChange={e => setFStatus(e.target.value)} style={sel}>
          <option value="">Tất cả trạng thái</option>
          <option value="viewed">Đã xem CV</option>
          <option value="downloaded">Đã tải CV</option>
          <option value="applied">Applied only</option>
        </select>
        <select value={fMonth} onChange={e => setFMonth(e.target.value)} style={sel}>
          <option value="">Tất cả tháng/năm</option>
          {months.map(ym => { const [y, m] = ym.split("-"); return <option key={ym} value={ym}>{m}/{y}</option>; })}
        </select>
        <span style={{ fontSize: 12, color: "#888", marginLeft: "auto" }}>{filtered.length} vị trí</span>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto", background: "#fff", borderRadius: 10, border: "0.5px solid #e0e0dc" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "4%" }} /><col style={{ width: "30%" }} /><col style={{ width: "21%" }} />
            <col style={{ width: "9%" }} /><col style={{ width: "9%" }} /><col style={{ width: "10%" }} />
            <col style={{ width: "8%" }} /><col style={{ width: "12%" }} />
          </colgroup>
          <thead>
            <tr>
              {[["#", null], ["Vị trí", "title"], ["Công ty", "company"], ["Địa điểm", null], ["Hình thức", null], ["Tháng", "month"], ["Năm", "year"], ["Trạng thái", "status"]].map(([label, col]) => (
                <th key={label} style={th} onClick={col ? () => handleSort(col) : undefined}>
                  {label}{col ? (sortCol === col ? (sortAsc ? " ↑" : " ↓") : " ↕") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!filtered.length
              ? <tr><td colSpan={8} style={{ padding: 32, textAlign: "center", color: "#888" }}>Không tìm thấy kết quả.</td></tr>
              : filtered.map((j, i) => {
                const b = badge(j.status);
                return (
                  <tr key={i} style={{ borderBottom: "0.5px solid #f0f0ec" }}
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
                    <td style={{ padding: "6px 10px" }}>
                      <span style={{ padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 500, background: b.bg, color: b.color }}>{b.text}</span>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
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

  if (auth.username !== urlUsername) {
    localStorage.removeItem("jt_token");
    window.location.href = "/jobtracker";
    return null;
  }

  return <TrackerPage username={urlUsername} token={auth.token} />;
}
