import { useState } from "react";
import { TabCard, Field, SmallBtn, inputStyle } from "../shared";

export default function EducationTab({ items, onSave, saving }) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 46 }, (_, i) => currentYear + 5 - i);

  const parsePeriod = (period) => {
    if (!period) return { startYear: "", endYear: "", current: false };
    const current = period.includes("Present");
    const parts = period.split("–").map(s => s.trim());
    const startYear = parts[0]?.match(/\d{4}/)?.[0] || "";
    const endYear = current ? "" : (parts[1]?.match(/\d{4}/)?.[0] || "");
    return { startYear, endYear, current };
  };

  const buildPeriod = (startYear, endYear, current) => {
    if (current) return `${startYear} – Present`;
    return endYear ? `${startYear} – ${endYear}` : startYear;
  };

  const [list, setList] = useState(items.map(item => {
    const parsed = parsePeriod(item.period);
    return { ...item, ...parsed };
  }));

  const add = () => setList(p => [...p, { school: "", degree: "", period: "", startYear: "", endYear: "", current: false }]);
  const remove = i => setList(p => p.filter((_, idx) => idx !== i));
  const update = (i, k, v) => setList(p => p.map((item, idx) => idx === i ? { ...item, [k]: v } : item));
  const moveUp = i => { if (i === 0) return; const l = [...list]; [l[i-1], l[i]] = [l[i], l[i-1]]; setList(l); };
  const moveDown = i => { if (i === list.length - 1) return; const l = [...list]; [l[i], l[i+1]] = [l[i+1], l[i]]; setList(l); };

  const handleSave = () => {
    const educations = list.map(({ startYear, endYear, current, ...rest }) => ({
      ...rest,
      period: buildPeriod(startYear, endYear, current),
    }));
    onSave({ educations });
  };

  const YearPicker = ({ yearKey, item, idx, placeholder }) => (
    <select value={item[yearKey]} onChange={e => update(idx, yearKey, e.target.value)} style={inputStyle}>
      <option value="">{placeholder}</option>
      {years.map(y => <option key={y} value={y}>{y}</option>)}
    </select>
  );

  return (
    <TabCard title="Education" onSave={handleSave} saving={saving}>
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

          <Field label="School / University"><input value={item.school || ""} onChange={e => update(i, "school", e.target.value)} style={inputStyle} /></Field>
          <Field label="Degree"><input value={item.degree || ""} onChange={e => update(i, "degree", e.target.value)} style={inputStyle} /></Field>
          <Field label="Start Year"><YearPicker yearKey="startYear" item={item} idx={i} placeholder="Start Year" /></Field>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <input type="checkbox" id={`edu-current-${i}`} checked={item.current || false}
              onChange={e => update(i, "current", e.target.checked)}
              style={{ width: 16, height: 16, cursor: "pointer", accentColor: "var(--accent)" }}
            />
            <label htmlFor={`edu-current-${i}`} style={{ fontSize: 13, color: "var(--text-muted)", cursor: "pointer" }}>
              I am currently studying here
            </label>
          </div>

          {!item.current && (
            <Field label="End Year"><YearPicker yearKey="endYear" item={item} idx={i} placeholder="End Year" /></Field>
          )}
        </div>
      ))}
      <button onClick={add} style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px dashed var(--border)", background: "none", color: "var(--text-muted)", fontSize: 13, cursor: "pointer", fontFamily: "var(--font-display)" }}>
        + Add Education
      </button>
    </TabCard>
  );
}
