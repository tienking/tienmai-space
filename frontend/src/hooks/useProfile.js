import { useState, useEffect } from "react";

export function applyTheme(theme) {
  const root = document.documentElement;
  const map = { bg: "--bg", bgSurface: "--bg-surface", bgCard: "--bg-card", accent: "--accent", text: "--text", textMuted: "--text-muted" };
  Object.entries(map).forEach(([key, cssVar]) => { if (theme[key]) root.style.setProperty(cssVar, theme[key]); });
  if (theme.accent) {
    root.style.setProperty("--accent-dim", theme.accent + "1a");
    root.style.setProperty("--accent-border", theme.accent + "4d");
    root.style.setProperty("--user-bg", theme.accent + "1a");
  }
}

export function applyFonts(fonts) {
  const root = document.documentElement;
  // Load Google Fonts dynamically
  const displayFont = fonts.display || "Syne";
  const monoFont = fonts.mono || "DM Mono";
  const googleFontsUrl = `https://fonts.googleapis.com/css2?family=${displayFont.replace(/ /g, "+")}:wght@400;500;700&family=${monoFont.replace(/ /g, "+")}:wght@400;500&display=swap`;

  // Remove old font link if exists
  const oldLink = document.getElementById("google-fonts");
  if (oldLink) oldLink.remove();

  const link = document.createElement("link");
  link.id = "google-fonts";
  link.rel = "stylesheet";
  link.href = googleFontsUrl;
  document.head.appendChild(link);

  // Apply CSS variables
  root.style.setProperty("--font-display", `'${displayFont}', sans-serif`);
  root.style.setProperty("--font-mono", `'${monoFont}', monospace`);
}

export function useProfile() {
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    fetch("/api/profile")
      .then(r => r.json())
      .then(data => {
        setProfile(data);
        if (data.theme) applyTheme(data.theme);
        if (data.fonts) applyFonts(data.fonts);
        if (data.name && data.title) {
          document.title = `${data.name} – ${data.title}`;
          const metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc) metaDesc.setAttribute("content", `Personal portfolio of ${data.name} — ${data.title}. ${data.about?.slice(0, 120) ?? ""}`);
        }
      })
      .catch(err => console.error("Failed to load profile:", err));
  }, []);
  return profile;
}
