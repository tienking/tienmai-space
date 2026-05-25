import { useState } from "react";
import { TabCard, Divider, GroupLabel, ColorPicker } from "../shared";

const PRESETS = [
  { name: "Midnight Green", dark: true, theme: { bg: "#0a0a0b", bgSurface: "#111114", bgCard: "#16161a", accent: "#5dcaa5", text: "#f0efe8", textMuted: "#6b6a65", headingName: "#f0efe8", labelAbout: "#3a3a38", labelSkills: "#3a3a38", labelExperience: "#3a3a38", labelEducation: "#3a3a38", labelProjects: "#3a3a38", labelGallery: "#3a3a38", lineColor: "rgba(255,255,255,0.07)", sectionAbout: "#6b6a65", sectionSkills: "#6b6a65", sectionExperience: "#f0efe8", sectionEducation: "#f0efe8", sectionProjects: "#f0efe8", sectionGallery: "#f0efe8" } },
  { name: "Deep Blue", dark: true, theme: { bg: "#070b14", bgSurface: "#0d1526", bgCard: "#111d35", accent: "#60a5fa", text: "#e8edf5", textMuted: "#64748b", headingName: "#e8edf5", labelAbout: "#1e3a5f", labelSkills: "#1e3a5f", labelExperience: "#1e3a5f", labelEducation: "#1e3a5f", labelProjects: "#1e3a5f", labelGallery: "#1e3a5f", lineColor: "rgba(96,165,250,0.15)", sectionAbout: "#64748b", sectionSkills: "#64748b", sectionExperience: "#e8edf5", sectionEducation: "#e8edf5", sectionProjects: "#e8edf5", sectionGallery: "#e8edf5" } },
  { name: "Obsidian Purple", dark: true, theme: { bg: "#0c0a14", bgSurface: "#13101f", bgCard: "#1a1528", accent: "#a78bfa", text: "#ede9f5", textMuted: "#6d6880", headingName: "#ede9f5", labelAbout: "#2d2545", labelSkills: "#2d2545", labelExperience: "#2d2545", labelEducation: "#2d2545", labelProjects: "#2d2545", labelGallery: "#2d2545", lineColor: "rgba(167,139,250,0.15)", sectionAbout: "#6d6880", sectionSkills: "#6d6880", sectionExperience: "#ede9f5", sectionEducation: "#ede9f5", sectionProjects: "#ede9f5", sectionGallery: "#ede9f5" } },
  { name: "Carbon Rose", dark: true, theme: { bg: "#100a0a", bgSurface: "#1a1010", bgCard: "#221515", accent: "#f472b6", text: "#f5eded", textMuted: "#7a6060", headingName: "#f5eded", labelAbout: "#3d2020", labelSkills: "#3d2020", labelExperience: "#3d2020", labelEducation: "#3d2020", labelProjects: "#3d2020", labelGallery: "#3d2020", lineColor: "rgba(244,114,182,0.15)", sectionAbout: "#7a6060", sectionSkills: "#7a6060", sectionExperience: "#f5eded", sectionEducation: "#f5eded", sectionProjects: "#f5eded", sectionGallery: "#f5eded" } },
  { name: "Forest Dark", dark: true, theme: { bg: "#080e0a", bgSurface: "#0f1a11", bgCard: "#152118", accent: "#86efac", text: "#eaf3eb", textMuted: "#567060", headingName: "#eaf3eb", labelAbout: "#1a3020", labelSkills: "#1a3020", labelExperience: "#1a3020", labelEducation: "#1a3020", labelProjects: "#1a3020", labelGallery: "#1a3020", lineColor: "rgba(134,239,172,0.15)", sectionAbout: "#567060", sectionSkills: "#567060", sectionExperience: "#eaf3eb", sectionEducation: "#eaf3eb", sectionProjects: "#eaf3eb", sectionGallery: "#eaf3eb" } },
  { name: "Clean Light", dark: false, theme: { bg: "#ffffff", bgSurface: "#f8f9fa", bgCard: "#f1f3f5", accent: "#0ea5e9", text: "#1a1a2e", textMuted: "#64748b", headingName: "#1a1a2e", labelAbout: "#94a3b8", labelSkills: "#94a3b8", labelExperience: "#94a3b8", labelEducation: "#94a3b8", labelProjects: "#94a3b8", labelGallery: "#94a3b8", lineColor: "rgba(0,0,0,0.08)", sectionAbout: "#64748b", sectionSkills: "#1a1a2e", sectionExperience: "#1a1a2e", sectionEducation: "#1a1a2e", sectionProjects: "#1a1a2e", sectionGallery: "#1a1a2e" } },
  { name: "Warm Paper", dark: false, theme: { bg: "#faf7f2", bgSurface: "#f3ede3", bgCard: "#ebe3d5", accent: "#b45309", text: "#2c1a0e", textMuted: "#78614a", headingName: "#2c1a0e", labelAbout: "#b8a090", labelSkills: "#b8a090", labelExperience: "#b8a090", labelEducation: "#b8a090", labelProjects: "#b8a090", labelGallery: "#b8a090", lineColor: "rgba(180,83,9,0.15)", sectionAbout: "#78614a", sectionSkills: "#2c1a0e", sectionExperience: "#2c1a0e", sectionEducation: "#2c1a0e", sectionProjects: "#2c1a0e", sectionGallery: "#2c1a0e" } },
  { name: "Soft Lavender", dark: false, theme: { bg: "#f5f3ff", bgSurface: "#ede9fe", bgCard: "#ddd6fe", accent: "#7c3aed", text: "#1e1b4b", textMuted: "#6d6a8a", headingName: "#1e1b4b", labelAbout: "#a5b4fc", labelSkills: "#a5b4fc", labelExperience: "#a5b4fc", labelEducation: "#a5b4fc", labelProjects: "#a5b4fc", labelGallery: "#a5b4fc", lineColor: "rgba(124,58,237,0.2)", sectionAbout: "#6d6a8a", sectionSkills: "#1e1b4b", sectionExperience: "#1e1b4b", sectionEducation: "#1e1b4b", sectionProjects: "#1e1b4b", sectionGallery: "#1e1b4b" } },
  { name: "Mint Fresh", dark: false, theme: { bg: "#f0fdf4", bgSurface: "#dcfce7", bgCard: "#bbf7d0", accent: "#16a34a", text: "#14532d", textMuted: "#4a7c59", headingName: "#14532d", labelAbout: "#86efac", labelSkills: "#86efac", labelExperience: "#86efac", labelEducation: "#86efac", labelProjects: "#86efac", labelGallery: "#86efac", lineColor: "rgba(22,163,74,0.2)", sectionAbout: "#4a7c59", sectionSkills: "#14532d", sectionExperience: "#14532d", sectionEducation: "#14532d", sectionProjects: "#14532d", sectionGallery: "#14532d" } },
  { name: "Rose Light", dark: false, theme: { bg: "#fff1f2", bgSurface: "#ffe4e6", bgCard: "#fecdd3", accent: "#e11d48", text: "#4c0519", textMuted: "#8a4a55", headingName: "#4c0519", labelAbout: "#fda4af", labelSkills: "#fda4af", labelExperience: "#fda4af", labelEducation: "#fda4af", labelProjects: "#fda4af", labelGallery: "#fda4af", lineColor: "rgba(225,29,72,0.2)", sectionAbout: "#8a4a55", sectionSkills: "#4c0519", sectionExperience: "#4c0519", sectionEducation: "#4c0519", sectionProjects: "#4c0519", sectionGallery: "#4c0519" } },
];

const DEFAULT_THEME = {
  bg: "#0a0a0b", bgSurface: "#111114", bgCard: "#16161a",
  accent: "#5dcaa5", text: "#f0efe8", textMuted: "#6b6a65",
  headingName: "#f0efe8", lineColor: "rgba(255,255,255,0.07)",
  labelAbout: "#3a3a38", labelSkills: "#3a3a38", labelExperience: "#3a3a38",
  labelEducation: "#3a3a38", labelProjects: "#3a3a38", labelGallery: "#3a3a38",
  sectionAbout: "#6b6a65", sectionSkills: "#6b6a65",
  sectionExperience: "#f0efe8", sectionEducation: "#f0efe8",
  sectionProjects: "#f0efe8", sectionGallery: "#f0efe8",
};

export default function ThemeTab({ theme, onSave, saving }) {
  const [t, setT] = useState({ ...DEFAULT_THEME, ...theme });
  const set = (k, v) => setT(p => ({ ...p, [k]: v }));
  const applyPreset = (preset) => setT({ ...DEFAULT_THEME, ...preset.theme });

  const bgColors = [
    { key: "bg", label: "Page Background" },
    { key: "bgSurface", label: "Surface Background" },
    { key: "bgCard", label: "Card Background" },
    { key: "accent", label: "Accent Color" },
    { key: "lineColor", label: "Section Line Color" },
  ];
  const textColors = [
    { key: "headingName", label: "Name Heading" },
    { key: "text", label: "Body Text" },
    { key: "textMuted", label: "Muted Text" },
  ];
  const sectionLabelColors = [
    { key: "labelAbout", label: "ABOUT label" },
    { key: "labelSkills", label: "SKILLS label" },
    { key: "labelExperience", label: "EXPERIENCE label" },
    { key: "labelEducation", label: "EDUCATION label" },
    { key: "labelProjects", label: "PROJECTS label" },
    { key: "labelCertifications", label: "CERTIFICATIONS label" },
    { key: "labelGallery", label: "GALLERY label" },
  ];
  const sectionContentColors = [
    { key: "sectionAbout", label: "About content" },
    { key: "sectionSkills", label: "Skills content" },
    { key: "sectionExperience", label: "Experience content" },
    { key: "sectionEducation", label: "Education content" },
    { key: "sectionProjects", label: "Projects content" },
    { key: "sectionCertifications", label: "Certifications content" },
    { key: "sectionGallery", label: "Gallery content" },
  ];

  return (
    <TabCard title="Theme" onSave={() => onSave({ theme: t })} saving={saving}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>Presets</p>
        <p style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em", marginBottom: 8 }}>DARK</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {PRESETS.filter(p => p.dark).map(preset => (
            <button key={preset.name} onClick={() => applyPreset(preset)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", borderRadius: 9, border: "1px solid var(--border)", background: preset.theme.bgCard, cursor: "pointer", transition: "border-color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = preset.theme.accent}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
            >
              <div style={{ display: "flex", gap: 3 }}>{[preset.theme.bg, preset.theme.accent, preset.theme.text].map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}</div>
              <span style={{ fontSize: 12, color: preset.theme.text, fontFamily: "var(--font-display)" }}>{preset.name}</span>
            </button>
          ))}
        </div>
        <p style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em", marginBottom: 8 }}>LIGHT</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {PRESETS.filter(p => !p.dark).map(preset => (
            <button key={preset.name} onClick={() => applyPreset(preset)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", borderRadius: 9, border: "1px solid #e2e8f0", background: preset.theme.bgCard, cursor: "pointer", transition: "border-color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = preset.theme.accent}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}
            >
              <div style={{ display: "flex", gap: 3 }}>{[preset.theme.bg, preset.theme.accent, preset.theme.text].map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c, border: "1px solid rgba(0,0,0,0.1)" }} />)}</div>
              <span style={{ fontSize: 12, color: preset.theme.text }}>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>
      <Divider />
      <GroupLabel>Background & Accent</GroupLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
        {bgColors.map(({ key, label }) => <ColorPicker key={key} label={label} value={t[key] || "#000000"} onChange={v => set(key, v)} />)}
      </div>
      <Divider />
      <GroupLabel>Text Colors</GroupLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
        {textColors.map(({ key, label }) => <ColorPicker key={key} label={label} value={t[key] || "#ffffff"} onChange={v => set(key, v)} />)}
      </div>
      <Divider />
      <GroupLabel>Section Label Colors (ABOUT, SKILLS...)</GroupLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
        {sectionLabelColors.map(({ key, label }) => <ColorPicker key={key} label={label} value={t[key] || "#3a3a38"} onChange={v => set(key, v)} />)}
      </div>
      <Divider />
      <GroupLabel>Section Content Colors</GroupLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {sectionContentColors.map(({ key, label }) => <ColorPicker key={key} label={label} value={t[key] || "#f0efe8"} onChange={v => set(key, v)} />)}
      </div>
      <Divider />
      <GroupLabel>Open to Work Badge</GroupLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <ColorPicker label="Badge background" value={t.openToWorkBg || "#16a34a"} onChange={v => set("openToWorkBg", v)} />
        <ColorPicker label="Badge text" value={t.openToWorkText || "#ffffff"} onChange={v => set("openToWorkText", v)} />
        <ColorPicker label="Badge border" value={t.openToWorkBorder || "rgba(255,255,255,0.2)"} onChange={v => set("openToWorkBorder", v)} />
      </div>
      <Divider />
      <GroupLabel>Expired Certifications</GroupLabel>
      <ColorPicker label="Expired cert background" value={t.expiredCertBg || "#2d1515"} onChange={v => set("expiredCertBg", v)} />
      <Divider />
      <GroupLabel>JD Match Banner (For Recruiters)</GroupLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <ColorPicker label="Banner background" value={t.bannerBg || t.bgCard || "#16161a"} onChange={v => set("bannerBg", v)} />
        <ColorPicker label="Banner border" value={t.bannerBorder || t.accent + "4d" || "#5dcaa54d"} onChange={v => set("bannerBorder", v)} />
        <ColorPicker label='"FOR RECRUITERS" label' value={t.bannerLabel || t.accent || "#5dcaa5"} onChange={v => set("bannerLabel", v)} />
        <ColorPicker label="Title color" value={t.bannerTitle || t.text || "#f0efe8"} onChange={v => set("bannerTitle", v)} />
        <ColorPicker label="Body text color" value={t.bannerText || t.textMuted || "#6b6a65"} onChange={v => set("bannerText", v)} />
        <ColorPicker label="Button text color" value={t.bannerBtnText || t.accent || "#5dcaa5"} onChange={v => set("bannerBtnText", v)} />
        <ColorPicker label="Match color ≥50% (% & skills)" value={t.bannerMatchColor || "#16a34a"} onChange={v => set("bannerMatchColor", v)} />
        <ColorPicker label="Low match color <50% (% & skills)" value={t.bannerMissingColor || "#dc2626"} onChange={v => set("bannerMissingColor", v)} />
      </div>
    </TabCard>
  );
}
