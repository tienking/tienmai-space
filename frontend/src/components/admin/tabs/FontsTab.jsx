import { useState, useEffect } from "react";
import { TabCard, GroupLabel, Divider, loadGoogleFont } from "../shared";

const DISPLAY_FONTS = [
  { name: "Syne", label: "Syne", desc: "Current — bold & geometric" },
  { name: "Inter", label: "Inter", desc: "Clean & modern, great readability" },
  { name: "Plus Jakarta Sans", label: "Plus Jakarta Sans", desc: "Friendly & professional" },
  { name: "DM Sans", label: "DM Sans", desc: "Minimal & elegant" },
  { name: "Outfit", label: "Outfit", desc: "Contemporary & versatile" },
  { name: "Raleway", label: "Raleway", desc: "Stylish with elegant thin weights" },
  { name: "Poppins", label: "Poppins", desc: "Rounded & approachable" },
  { name: "Space Grotesk", label: "Space Grotesk", desc: "Technical & distinctive" },
];

const MONO_FONTS = [
  { name: "DM Mono", label: "DM Mono", desc: "Current — clean monospace" },
  { name: "JetBrains Mono", label: "JetBrains Mono", desc: "Developer favorite" },
  { name: "Fira Code", label: "Fira Code", desc: "With ligatures" },
  { name: "IBM Plex Mono", label: "IBM Plex Mono", desc: "Classic & readable" },
  { name: "Space Mono", label: "Space Mono", desc: "Quirky & distinctive" },
  { name: "Roboto Mono", label: "Roboto Mono", desc: "Neutral & familiar" },
];

export default function FontsTab({ fonts, onSave, saving }) {
  const [selectedDisplay, setSelectedDisplay] = useState(fonts.display || "Syne");
  const [selectedMono, setSelectedMono] = useState(fonts.mono || "DM Mono");

  // Load all fonts for preview
  useEffect(() => {
    [...DISPLAY_FONTS, ...MONO_FONTS].forEach(f => loadGoogleFont(f.name));
  }, []);

  return (
    <TabCard title="Fonts" onSave={() => onSave({ fonts: { display: selectedDisplay, mono: selectedMono } })} saving={saving}>

      {/* Display Font */}
      <div style={{ marginBottom: 32 }}>
        <GroupLabel>Display Font — headings & body text</GroupLabel>
        <div style={{ display: "grid", gap: 8 }}>
          {DISPLAY_FONTS.map(font => (
            <button key={font.name} onClick={() => setSelectedDisplay(font.name)} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 16px", borderRadius: 12, cursor: "pointer", textAlign: "left",
              border: `1px solid ${selectedDisplay === font.name ? "var(--accent-border)" : "var(--border)"}`,
              background: selectedDisplay === font.name ? "var(--accent-dim)" : "var(--bg-card)",
              transition: "all 0.15s",
            }}>
              <div>
                <p style={{ fontSize: 20, fontFamily: `'${font.name}', sans-serif`, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>
                  Tien Mai Duc
                </p>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{font.name} — {font.desc}</p>
              </div>
              {selectedDisplay === font.name && (
                <span style={{ fontSize: 12, color: "var(--accent)", fontFamily: "var(--font-mono)", flexShrink: 0, marginLeft: 12 }}>✓ Selected</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <Divider />

      {/* Mono Font */}
      <div>
        <GroupLabel>Mono Font — labels, tags & code</GroupLabel>
        <div style={{ display: "grid", gap: 8 }}>
          {MONO_FONTS.map(font => (
            <button key={font.name} onClick={() => setSelectedMono(font.name)} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 16px", borderRadius: 12, cursor: "pointer", textAlign: "left",
              border: `1px solid ${selectedMono === font.name ? "var(--accent-border)" : "var(--border)"}`,
              background: selectedMono === font.name ? "var(--accent-dim)" : "var(--bg-card)",
              transition: "all 0.15s",
            }}>
              <div>
                <p style={{ fontSize: 16, fontFamily: `'${font.name}', monospace`, fontWeight: 500, color: "var(--accent)", marginBottom: 2 }}>
                  ABOUT · SKILLS · EXPERIENCE
                </p>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{font.name} — {font.desc}</p>
              </div>
              {selectedMono === font.name && (
                <span style={{ fontSize: 12, color: "var(--accent)", fontFamily: "var(--font-mono)", flexShrink: 0, marginLeft: 12 }}>✓ Selected</span>
              )}
            </button>
          ))}
        </div>
      </div>

    </TabCard>
  );
}
