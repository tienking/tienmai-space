import { useState } from "react";
import { TabCard, Field, SmallBtn, inputStyle } from "../shared";

const SKILL_ICONS = [
  "⚙️", "🖥️", "🗄️", "☁️", "🧰", "🔗", "🎨", "📱", "🔒", "📊",
  "🌐", "🚀", "🤖", "🧪", "📦", "🔧", "💾", "🎯", "🔄", "📡",
  "💻", "🛡️", "📐", "⚡", "🧩", "🔍", "💡", "🗂️",
];

export default function SkillsTab({ profile, onSave, saving }) {
  const rawSkills = profile.skills || [];
  const isGrouped = rawSkills.length > 0 && typeof rawSkills[0] === "object";

  const initGroups = () => {
    if (isGrouped) return rawSkills.map(g => ({ group: g.group || "", icon: g.icon || "⚙️", items: (g.items || []).join(", ") }));
    return rawSkills.length > 0 ? [{ group: "General", icon: "⚙️", items: rawSkills.join(", ") }] : [{ group: "", icon: "⚙️", items: "" }];
  };

  const [groups, setGroups] = useState(initGroups);

  const addGroup = () => setGroups(p => [...p, { group: "", icon: "⚙️", items: "" }]);
  const removeGroup = i => setGroups(p => p.filter((_, idx) => idx !== i));
  const updateGroup = (i, k, v) => setGroups(p => p.map((g, idx) => idx === i ? { ...g, [k]: v } : g));
  const moveUp = i => { if (i === 0) return; const l = [...groups]; [l[i-1], l[i]] = [l[i], l[i-1]]; setGroups(l); };
  const moveDown = i => { if (i === groups.length - 1) return; const l = [...groups]; [l[i], l[i+1]] = [l[i+1], l[i]]; setGroups(l); };

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
          <Field label="Group Name (e.g. Languages, Frameworks, Tools)">
            <input value={g.group} onChange={e => updateGroup(i, "group", e.target.value)} placeholder="e.g. Languages" style={inputStyle} />
          </Field>
          <Field label="Icon">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {SKILL_ICONS.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => updateGroup(i, "icon", icon)}
                  title={icon}
                  style={{
                    fontSize: 18, lineHeight: 1,
                    padding: "5px 7px", borderRadius: 8,
                    border: g.icon === icon ? "2px solid var(--accent)" : "1px solid var(--border)",
                    background: g.icon === icon ? "var(--accent-dim)" : "transparent",
                    cursor: "pointer", transition: "all .15s",
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </Field>
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
