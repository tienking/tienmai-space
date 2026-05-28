import { useState } from "react";
import { TabCard, Field, SmallBtn, inputStyle } from "../shared";

export default function ListTab({ title, field, items, onSave, saving, fields }) {
  const [list, setList] = useState(items.map(i => ({ ...i })));
  const add = () => setList(p => [...p, Object.fromEntries(fields.map(f => [f, ""]))]);
  const remove = i => setList(p => p.filter((_, idx) => idx !== i));
  const update = (i, k, v) => setList(p => p.map((item, idx) => idx === i ? { ...item, [k]: v } : item));
  const moveUp = i => { if (i === 0) return; const l = [...list]; [l[i - 1], l[i]] = [l[i], l[i - 1]]; setList(l); };
  const moveDown = i => { if (i === list.length - 1) return; const l = [...list]; [l[i], l[i + 1]] = [l[i + 1], l[i]]; setList(l); };

  return (
    <TabCard title={title} onSave={() => onSave({ [field]: list })} saving={saving}
      footer={<button onClick={add} style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px dashed var(--border)", background: "none", color: "var(--text-muted)", fontSize: 13, cursor: "pointer", fontFamily: "var(--font-display)" }}>+ Add {title.endsWith("s") ? title.slice(0, -1) : title}</button>}
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
          {fields.map(f => (
            <Field key={f} label={f.charAt(0).toUpperCase() + f.slice(1)}>
              {f === "description"
                ? <textarea value={item[f] || ""} onChange={e => update(i, f, e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
                : <input value={item[f] || ""} onChange={e => update(i, f, e.target.value)} style={inputStyle} />
              }
            </Field>
          ))}
        </div>
      ))}
    </TabCard>
  );
}
