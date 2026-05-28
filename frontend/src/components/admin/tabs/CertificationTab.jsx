import { useState } from "react";
import { TabCard, Field, SmallBtn, inputStyle } from "../shared";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_LABELS = {
  Jan: "January", Feb: "February", Mar: "March", Apr: "April",
  May: "May", Jun: "June", Jul: "July", Aug: "August",
  Sep: "September", Oct: "October", Nov: "November", Dec: "December",
};

export default function CertificationTab({ items, onSave, saving }) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 46 }, (_, i) => currentYear + 5 - i);

  const parseCertDate = (dateStr) => {
    if (!dateStr) return { issueMonth: "", issueYear: "", expMonth: "", expYear: "", noExpiry: false };
    const noExpiry = !dateStr.includes("·") || dateStr.includes("No Expiry") || !dateStr.match(/Expires?/i);
    const parts = dateStr.split("·").map(s => s.trim());
    const parseDate = (s) => {
      const m = s?.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/);
      const y = s?.match(/\d{4}/);
      return { month: m?.[0] || "", year: y?.[0] || "" };
    };
    const issue = parseDate(parts[0]);
    const exp = noExpiry ? { month: "", year: "" } : parseDate(parts[1]);
    return { issueMonth: issue.month, issueYear: issue.year, expMonth: exp.month, expYear: exp.year, noExpiry };
  };

  const buildDate = (issueMonth, issueYear, expMonth, expYear, noExpiry) => {
    const issue = [issueMonth, issueYear].filter(Boolean).join(" ");
    if (noExpiry) return issue;
    const exp = [expMonth, expYear].filter(Boolean).join(" ");
    return exp ? `${issue} · Expires ${exp}` : issue;
  };

  const [list, setList] = useState(items.map(item => {
    const parsed = parseCertDate(item.date);
    return { ...item, ...parsed };
  }));

  const add = () => setList(p => [...p, { name: "", issuer: "", credentialId: "", link: "", date: "", issueMonth: "", issueYear: "", expMonth: "", expYear: "", noExpiry: false }]);
  const remove = i => setList(p => p.filter((_, idx) => idx !== i));
  const update = (i, k, v) => setList(p => p.map((item, idx) => idx === i ? { ...item, [k]: v } : item));
  const moveUp = i => { if (i === 0) return; const l = [...list]; [l[i - 1], l[i]] = [l[i], l[i - 1]]; setList(l); };
  const moveDown = i => { if (i === list.length - 1) return; const l = [...list]; [l[i], l[i + 1]] = [l[i + 1], l[i]]; setList(l); };

  const handleSave = () => {
    const certifications = list.map(({ issueMonth, issueYear, expMonth, expYear, noExpiry, ...rest }) => ({
      ...rest,
      date: buildDate(issueMonth, issueYear, expMonth, expYear, noExpiry),
    }));
    onSave({ certifications });
  };

  const MonthYearPicker = ({ monthKey, yearKey, item, idx }) => (
    <div style={{ display: "flex", gap: 8 }}>
      <select value={item[monthKey]} onChange={e => update(idx, monthKey, e.target.value)} style={{ ...inputStyle, width: "auto" }}>
        <option value="">Month</option>
        {MONTHS.map(m => <option key={m} value={m}>{MONTH_LABELS[m]}</option>)}
      </select>
      <select value={item[yearKey]} onChange={e => update(idx, yearKey, e.target.value)} style={{ ...inputStyle, width: "auto" }}>
        <option value="">Year</option>
        {years.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
    </div>
  );

  return (
    <TabCard title="Certifications" onSave={handleSave} saving={saving}
      footer={<button onClick={add} style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px dashed var(--border)", background: "none", color: "var(--text-muted)", fontSize: 13, cursor: "pointer", fontFamily: "var(--font-display)" }}>+ Add Certification</button>}
    >
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

          <Field label="Certification Name"><input value={item.name || ""} onChange={e => update(i, "name", e.target.value)} style={inputStyle} /></Field>
          <Field label="Issuing Organization"><input value={item.issuer || ""} onChange={e => update(i, "issuer", e.target.value)} style={inputStyle} /></Field>
          <Field label="Issue Date"><MonthYearPicker monthKey="issueMonth" yearKey="issueYear" item={item} idx={i} /></Field>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <input type="checkbox" id={`noexpiry-${i}`} checked={item.noExpiry || false}
              onChange={e => update(i, "noExpiry", e.target.checked)}
              style={{ width: 16, height: 16, cursor: "pointer", accentColor: "var(--accent)" }}
            />
            <label htmlFor={`noexpiry-${i}`} style={{ fontSize: 13, color: "var(--text-muted)", cursor: "pointer" }}>
              This credential does not expire
            </label>
          </div>

          {!item.noExpiry && (
            <Field label="Expiration Date"><MonthYearPicker monthKey="expMonth" yearKey="expYear" item={item} idx={i} /></Field>
          )}

          <Field label="Credential ID"><input value={item.credentialId || ""} onChange={e => update(i, "credentialId", e.target.value)} style={inputStyle} /></Field>
          <Field label="Credential URL"><input value={item.link || ""} onChange={e => update(i, "link", e.target.value)} placeholder="https://..." style={inputStyle} /></Field>
        </div>
      ))}
    </TabCard>
  );
}
