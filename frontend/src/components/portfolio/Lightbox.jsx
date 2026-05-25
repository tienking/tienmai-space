import { useState, useEffect, useCallback } from "react";
import { galleryUrl, galleryCaption } from "../../lib/gallery";

export default function Lightbox({ images, index, onClose }) {
  const [current, setCurrent] = useState(index);
  const goPrev = useCallback(() => setCurrent(i => (i - 1 + images.length) % images.length), [images.length]);
  const goNext = useCallback(() => setCurrent(i => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    const handleKey = e => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, goPrev, goNext]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const caption = galleryCaption(images[current]);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.92)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", animation: "fadeUp 0.2s ease" }}>
      <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "50%", width: 40, height: 40, color: "#fff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
      <div style={{ position: "absolute", top: 24, left: "50%", transform: "translateX(-50%)", fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-mono)" }}>{current + 1} / {images.length}</div>
      {images.length > 1 && <button onClick={e => { e.stopPropagation(); goPrev(); }} style={{ position: "absolute", left: 20, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "50%", width: 44, height: 44, color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>}
      <img src={galleryUrl(images[current])} onClick={e => e.stopPropagation()} style={{ maxWidth: "88vw", maxHeight: caption ? "80vh" : "88vh", objectFit: "contain", borderRadius: 12, boxShadow: "0 24px 80px rgba(0,0,0,0.8)" }} alt={caption || `Gallery ${current + 1}`} />
      {caption && (
        <p onClick={e => e.stopPropagation()} style={{ marginTop: 16, fontSize: 14, color: "rgba(255,255,255,0.75)", textAlign: "center", maxWidth: "60vw", lineHeight: 1.5 }}>{caption}</p>
      )}
      {images.length > 1 && <button onClick={e => { e.stopPropagation(); goNext(); }} style={{ position: "absolute", right: 20, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "50%", width: 44, height: 44, color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>}
    </div>
  );
}
