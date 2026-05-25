import { useState } from "react";
import { TabCard, Field, SmallBtn, inputStyle } from "../shared";

export default function GalleryTab({ gallery, experiences, galleryVisible, onSave, onSaveProfile, saving }) {
  // Normalize incoming items: legacy strings → {url, caption, year} objects
  const normalize = (items) =>
    (items || []).map(item =>
      typeof item === "string"
        ? { url: item, caption: "", year: null }
        : { url: item.url || "", caption: item.caption || "", year: item.year || null }
    );

  const [images, setImages] = useState(() => normalize(gallery));
  const [newUrl, setNewUrl] = useState("");

  // Drag-and-drop state
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Build year options: currentYear down to earliest year from Experiences
  const currentYear = new Date().getFullYear();
  const earliestYear = (() => {
    const years = (experiences || []).flatMap(exp => {
      const matches = (exp.period || "").match(/\d{4}/g) || [];
      return matches.map(Number);
    });
    return years.length > 0 ? Math.min(...years) : currentYear - 10;
  })();
  const yearOptions = Array.from({ length: currentYear - earliestYear + 1 }, (_, i) => currentYear - i);

  const add = () => {
    if (!newUrl.trim()) return;
    setImages(p => [...p, { url: newUrl.trim(), caption: "", year: null }]);
    setNewUrl("");
  };
  const remove = i => setImages(p => p.filter((_, idx) => idx !== i));
  const updateCaption = (i, v) => setImages(p => p.map((item, idx) => idx === i ? { ...item, caption: v } : item));
  const updateYear = (i, v) => setImages(p => p.map((item, idx) => idx === i ? { ...item, year: v } : item));

  // Drag handlers — skip drag when the user clicks inside a form control
  const handleDragStart = (e, i) => {
    if (["INPUT", "SELECT", "TEXTAREA"].includes(e.target.tagName)) { e.preventDefault(); return; }
    setDragIndex(i);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = (e, i) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== i) setDragOverIndex(i);
  };
  const handleDrop = (e, i) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === i) { setDragIndex(null); setDragOverIndex(null); return; }
    const next = [...images];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(i, 0, moved);
    setImages(next);
    setDragIndex(null);
    setDragOverIndex(null);
  };
  const handleDragEnd = () => { setDragIndex(null); setDragOverIndex(null); };

  const [visible, setVisible] = useState(galleryVisible);
  const toggleVisible = () => {
    const next = !visible;
    setVisible(next);
    onSaveProfile({ galleryVisible: next });
  };

  return (
    <TabCard title="Gallery" onSave={() => onSave(images)} saving={saving}>

      {/* Visibility toggle */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-card)", border: `1px solid ${visible ? "var(--accent-border)" : "var(--border)"}`, borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 500 }}>Show Gallery on profile</p>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
            {visible ? "Visible to visitors" : "Hidden from visitors"}
          </p>
        </div>
        <button onClick={toggleVisible} disabled={saving} style={{ width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", background: visible ? "var(--accent)" : "var(--border)", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
          <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: visible ? 23 : 3, transition: "left 0.2s" }} />
        </button>
      </div>

      <Field label="Add image URL (Cloudinary)">
        <div style={{ display: "flex", gap: 8 }}>
          <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://res.cloudinary.com/..." style={{ ...inputStyle, flex: 1 }} onKeyDown={e => e.key === "Enter" && add()} />
          <button onClick={add} style={{ padding: "8px 16px", borderRadius: 9, border: "none", background: "var(--accent)", color: "#0a0a0b", fontSize: 13, cursor: "pointer", fontFamily: "var(--font-display)", flexShrink: 0 }}>Add</button>
        </div>
      </Field>
      <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
        {images.map((item, i) => {
          const isDragging = dragIndex === i;
          const isOver = dragOverIndex === i && dragIndex !== i;
          return (
            <div
              key={i}
              draggable
              onDragStart={e => handleDragStart(e, i)}
              onDragOver={e => handleDragOver(e, i)}
              onDrop={e => handleDrop(e, i)}
              onDragEnd={handleDragEnd}
              style={{
                background: "var(--bg-card)",
                border: `1px solid ${isOver ? "var(--accent)" : "var(--border)"}`,
                borderRadius: 10,
                padding: "10px 12px",
                opacity: isDragging ? 0.4 : 1,
                transition: "border-color 0.15s, opacity 0.15s",
                boxShadow: isOver ? "0 0 0 2px var(--accent-border)" : "none",
              }}
            >
              {/* Row 1: grip handle + thumbnail + URL + remove */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                {/* Drag handle — ⠿ is a 2×3 dot grid, classic "grip" icon */}
                <div
                  title="Drag to reorder"
                  style={{ color: "var(--text-muted)", fontSize: 18, cursor: isDragging ? "grabbing" : "grab", flexShrink: 0, userSelect: "none", lineHeight: 1, padding: "0 2px" }}
                >⠿</div>
                <img src={item.url} alt="" draggable={false} style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
                <p style={{ flex: 1, fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.url}</p>
                <SmallBtn onClick={() => remove(i)} danger>✕</SmallBtn>
              </div>
              {/* Row 2: year dropdown + caption input */}
              <div style={{ display: "flex", gap: 8 }}>
                <select
                  value={item.year ?? ""}
                  onChange={e => updateYear(i, e.target.value ? parseInt(e.target.value) : null)}
                  style={{ ...inputStyle, width: 110, flexShrink: 0, fontSize: 12, padding: "7px 10px" }}
                >
                  <option value="">No year</option>
                  {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <input
                  value={item.caption}
                  onChange={e => updateCaption(i, e.target.value)}
                  placeholder="Caption (optional)"
                  style={{ ...inputStyle, flex: 1, fontSize: 12, padding: "7px 10px" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </TabCard>
  );
}
