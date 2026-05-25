import { useState } from "react";
import { TabCard, Field, SmallBtn, inputStyle } from "../shared";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function ExperienceTab({ items, onSave, saving }) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 40 }, (_, i) => currentYear - i);

  const parsePeriod = (period) => {
    if (!period) return { startMonth: "", startYear: "", endMonth: "", endYear: "", current: false };
    const current = period.includes("Present");
    const parts = period.split("·").map(s => s.trim());
    const start = parts[0] || "";
    const end = current ? "" : (parts[1] || "");
    const parseDate = (s) => {
      const m = s.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/);
      const y = s.match(/\d{4}/);
      return { month: m?.[0] || "", year: y?.[0] || "" };
    };
    const s = parseDate(start);
    const e = parseDate(end);
    return { startMonth: s.month, startYear: s.year, endMonth: e.month, endYear: e.year, current };
  };

  const buildPeriod = (startMonth, startYear, endMonth, endYear, current) => {
    const start = [startMonth, startYear].filter(Boolean).join(" ");
    if (current) return `${start} · Present`;
    const end = [endMonth, endYear].filter(Boolean).join(" ");
    return end ? `${start} · ${end}` : start;
  };

  const [list, setList] = useState(items.map(item => {
    const parsed = parsePeriod(item.period);
    return { ...item, ...parsed };
  }));

  const add = () => setList(p => [...p, { company: "", role: "", description: "", period: "", startMonth: "", startYear: "", endMonth: "", endYear: "", current: false }]);
  const remove = i => setList(p => p.filter((_, idx) => idx !== i));
  const update = (i, k, v) => setList(p => p.map((item, idx) => idx === i ? { ...item, [k]: v } : item));
  const moveUp = i => { if (i === 0) return; const l = [...list]; [l[i - 1], l[i]] = [l[i], l[i - 1]]; setList(l); };
  const moveDown = i => { if (i === list.length - 1) return; const l = [...list]; [l[i], l[i + 1]] = [l[i + 1], l[i]]; setList(l); };

  const handleSave = () => {
    const experiences = list.map(({ startMonth, startYear, endMonth, endYear, current, ...rest }) => ({
      ...rest,
      period: buildPeriod(startMonth, startYear, endMonth, endYear, current),
    }));
    onSave({ experiences });
  };

  const MonthYearPicker = ({ monthKey, yearKey, item, idx }) => (
    <div style={{ display: "flex", gap: 8 }}>
      <select value={item[monthKey]} onChange={e => update(idx, monthKey, e.target.value)} style={{ ...inputStyle, flex: 1 }}>
        <option value="">Month</option>
        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
      </select>
      <select value={item[yearKey]} onChange={e => update(idx, yearKey, e.target.value)} style={{ ...inputStyle, flex: 1 }}>
        <option value="">Year</option>
        {years.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
    </div>
  );

  return (
    <TabCard title="Experience" onSave={handleSave} saving={saving}>
      {list.map((item, i) => (
        <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>#{i + 1}</span>
            <div style={{ display: "flex", gap: 6 }}>
              <SmallBtn onClick={() => moveUp(i)} disabled={i === 0}>↑</SmallBtn>
              <SmallBtn onClick={() => moveDown(i)} disabled={i === list.length - 1}>↓</SmallBtn>
              <SmallBtn onClick={() => remove(i)} danger>✕</SmallBtn>
            </div>
          </div>

          <Field label="Company"><input value={item.company || ""} onChange={e => update(i, "company", e.target.value)} style={inputStyle} /></Field>
          <Field label="Role"><input value={item.role || ""} onChange={e => update(i, "role", e.target.value)} style={inputStyle} /></Field>
          <Field label="Start Date"><MonthYearPicker monthKey="startMonth" yearKey="startYear" item={item} idx={i} /></Field>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <input type="checkbox" id={`current-${i}`} checked={item.current || false}
              onChange={e => update(i, "current", e.target.checked)}
              style={{ width: 16, height: 16, cursor: "pointer", accentColor: "var(--accent)" }}
            />
            <label htmlFor={`current-${i}`} style={{ fontSize: 13, color: "var(--text-muted)", cursor: "pointer" }}>
              I am currently working in this role
            </label>
          </div>

          {!item.current && (
            <Field label="End Date"><MonthYearPicker monthKey="endMonth" yearKey="endYear" item={item} idx={i} /></Field>
          )}

          <Field label="Description">
            <textarea value={item.description || ""} onChange={e => update(i, "description", e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
          </Field>
        </div>
      ))}
      <button onClick={add} style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px dashed var(--border)", background: "none", color: "var(--text-muted)", fontSize: 13, cursor: "pointer", fontFamily: "var(--font-display)" }}>
        + Add Experience
      </button>
    </TabCard>
  );
}
