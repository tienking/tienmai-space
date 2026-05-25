import { useState } from "react";
import { TabCard, Field, inputStyle } from "../shared";

export default function BasicTab({ profile, onSave, saving }) {
  const [form, setForm] = useState({
    name: profile.name || "", title: profile.title || "", location: profile.location || "",
    email: profile.email || "", phone: profile.phone || "", github: profile.github || "",
    gitlab: profile.gitlab || "", linkedin: profile.linkedin || "",
    avatar: profile.avatar || "", openToWork: profile.openToWork || false,
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <TabCard title="Basic Info" onSave={() => onSave(form)} saving={saving}>
      {[["name", "Name"], ["title", "Title / Headline"], ["location", "Location"], ["email", "Email"], ["phone", "Phone Number"], ["github", "GitHub URL"], ["gitlab", "GitLab URL"], ["linkedin", "LinkedIn URL"], ["avatar", "Avatar URL (Cloudinary)"]].map(([key, label]) => (
        <Field key={key} label={label}><input value={form[key]} onChange={e => set(key, e.target.value)} style={inputStyle} /></Field>
      ))}

      {/* Open to Work toggle */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px", marginTop: 8 }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 500 }}>Open to Work</p>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Show badge below your avatar</p>
        </div>
        <button onClick={() => set("openToWork", !form.openToWork)} style={{
          width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
          background: form.openToWork ? "var(--accent)" : "var(--border)",
          position: "relative", transition: "background 0.2s", flexShrink: 0,
        }}>
          <div style={{
            width: 18, height: 18, borderRadius: "50%", background: "#fff",
            position: "absolute", top: 3,
            left: form.openToWork ? 23 : 3,
            transition: "left 0.2s",
          }} />
        </button>
      </div>
    </TabCard>
  );
}
