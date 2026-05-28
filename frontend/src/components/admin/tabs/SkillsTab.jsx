import { useState, useRef, useEffect } from "react";
import { TabCard, Field, SmallBtn, inputStyle } from "../shared";

const SKILL_ICONS = [
  // Dev & Code
  "💻", "🖥️", "📱", "⌨️", "🖱️", "⚙️", "🔧", "🧰", "🔗", "📦",
  // Data & Analytics
  "🗄️", "📊", "📈", "💾", "🔢", "🔍", "📡", "☁️",
  // Web & Network
  "🌐", "🚀", "🔄", "🌍", "🗺️",
  // Security
  "🔒", "🛡️", "🔐", "🔑",
  // Design & UI
  "🎨", "📐", "🧩", "🖼️", "🎛️",
  // AI & Research
  "🤖", "🧠", "💡", "🔬", "🧪",
  // Workflow & Testing
  "🎯", "✅", "🔀", "🏗️", "🌿", "🔌",
  // Docs & Comms
  "📝", "🗂️", "📋", "🔔", "📬",
  // Misc tech
  "⚡", "🧲", "🏆", "🔁",
];

// ── Icon dropdown picker ───────────────────────────────────────────────────────
function IconPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "7px 12px", borderRadius: 9,
          border: "1px solid var(--border)", background: "var(--bg-card)",
          color: "var(--text-muted)", cursor: "pointer", transition: "border-color .15s",
        }}
      >
        <span style={{ fontSize: 20, lineHeight: 1 }}>{value}</span>
        <span style={{ fontSize: 11, fontFamily: "var(--font-display)" }}>Change {open ? "▴" : "▾"}</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 200,
          background: "var(--bg-surface)", border: "1px solid var(--border)",
          borderRadius: 12, padding: 10,
          width: 252, maxHeight: 192, overflowY: "auto",
          boxShadow: "0 8px 28px rgba(0,0,0,0.45)",
          display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4,
          scrollbarWidth: "thin",
        }}>
          {SKILL_ICONS.map(icon => (
            <button
              key={icon}
              type="button"
              title={icon}
              onClick={() => { onChange(icon); setOpen(false); }}
              style={{
                fontSize: 18, lineHeight: 1, padding: "5px 4px", borderRadius: 6,
                border: value === icon ? "2px solid var(--accent)" : "1px solid transparent",
                background: value === icon ? "var(--accent-dim)" : "transparent",
                cursor: "pointer", transition: "background .1s",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
              onMouseEnter={e => { if (icon !== value) e.currentTarget.style.background = "var(--bg-card)"; }}
              onMouseLeave={e => { if (icon !== value) e.currentTarget.style.background = "transparent"; }}
            >
              {icon}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab ────────────────────────────────────────────────────────────────────────
export default function SkillsTab({ profile, onSave, saving }) {
  const rawSkills = profile.skills || [];
  const isGrouped = rawSkills.length > 0 && typeof rawSkills[0] === "object";

  const initGroups = () => {
    if (isGrouped) return rawSkills.map(g => ({ group: g.group || "", icon: g.icon || "⚙️", items: (g.items || []).join(", ") }));
    return rawSkills.length > 0 ? [{ group: "General", icon: "⚙️", items: rawSkills.join(", ") }] : [{ group: "", icon: "⚙️", items: "" }];
  };

  const [groups, setGroups] = useState(initGroups);

  const addGroup    = ()      => setGroups(p => [...p, { group: "", icon: "⚙️", items: "" }]);
  const removeGroup = i       => setGroups(p => p.filter((_, idx) => idx !== i));
  const updateGroup = (i,k,v) => setGroups(p => p.map((g, idx) => idx === i ? { ...g, [k]: v } : g));
  const moveUp      = i       => { if (i === 0) return; const l = [...groups]; [l[i-1], l[i]] = [l[i], l[i-1]]; setGroups(l); };
  const moveDown    = i       => { if (i === groups.length - 1) return; const l = [...groups]; [l[i], l[i+1]] = [l[i+1], l[i]]; setGroups(l); };

  const handleSave = async () => {
    const skills = groups.map(g => ({
      group: g.group.trim(),
      icon: g.icon || "⚙️",
      items: g.items.split(",").map(s => s.trim()).filter(Boolean),
    })).filter(g => g.items.length > 0);
    await onSave({ skills });
    setGroups(skills.map(g => ({ group: g.group, icon: g.icon, items: g.items.join(", ") })));
  };

  return (
    <TabCard title="Skills" onSave={handleSave} saving={saving}>
      {groups.map((g, i) => (
        <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Group #{i + 1}</span>
            <div style={{ display: "flex", gap: 6 }}>
              <SmallBtn onClick={() => moveUp(i)} disabled={i === 0}>↑</SmallBtn>
              <SmallBtn onClick={() => moveDown(i)} disabled={i === groups.length - 1}>↓</SmallBtn>
              <SmallBtn onClick={() => removeGroup(i)} danger>✕</SmallBtn>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <Field label="Group Name">
                <input value={g.group} onChange={e => updateGroup(i, "group", e.target.value)} placeholder="e.g. Languages, Frameworks, Tools" style={inputStyle} />
              </Field>
            </div>
            <div>
              <Field label="Icon">
                <IconPicker value={g.icon} onChange={v => updateGroup(i, "icon", v)} />
              </Field>
            </div>
          </div>
          <Field label="Skills (comma separated)">
            <textarea value={g.items} onChange={e => updateGroup(i, "items", e.target.value)} rows={2} placeholder="e.g. Python, SQL, JavaScript" style={{ ...inputStyle, resize: "vertical" }} />
          </Field>
        </div>
      ))}
      <button onClick={addGroup} style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px dashed var(--border)", background: "none", color: "var(--text-muted)", fontSize: 13, cursor: "pointer", fontFamily: "var(--font-display)" }}>
        + Add Group
      </button>
    </TabCard>
  );
}
