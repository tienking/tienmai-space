import { useState, useEffect, useRef } from "react";
import ResumeViewModal from "./ResumeViewModal";

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

export default function JtProfilePage({ username, token }) {
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
      body: JSON.stringify(data),
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
