import { useState, useEffect } from "react";
import { useProfile } from "./hooks/useProfile";
import { computeGallery, galleryUrl, galleryCaption } from "./lib/gallery";
import { Avatar, Section, Card, linkStyle } from "./components/portfolio/shared";
import Lightbox from "./components/portfolio/Lightbox";
import JDMatchBanner from "./components/portfolio/JDMatchBanner";
import { ChatPopup, FloatingButton } from "./components/portfolio/ChatPopup";
import ResumePopup from "./components/portfolio/ResumePopup";
import CertificationsSection from "./components/portfolio/CertificationsSection";

export default function App() {
  const profile = useProfile();
  const [chatOpen, setChatOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [hasResume, setHasResume] = useState(false);

  useEffect(() => {
    fetch("/api/resume/exists")
      .then(r => r.json())
      .then(data => setHasResume(data.exists))
      .catch(() => setHasResume(false));
  }, []);

  if (!profile) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid var(--accent)", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const t = profile.theme || {};
  const { groups: galleryGroups, flat: sortedGallery } = computeGallery(profile.gallery || []);

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {/* Admin button */}
      <a href="/admin" style={{ position: "fixed", top: 16, right: 16, zIndex: 100, fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--font-mono)", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: "5px 10px", textDecoration: "none", letterSpacing: "0.06em", transition: "all 0.2s" }}
        onMouseEnter={e => { e.target.style.color = "var(--accent)"; e.target.style.borderColor = "var(--accent-border)"; }}
        onMouseLeave={e => { e.target.style.color = "var(--text-dim)"; e.target.style.borderColor = "var(--border)"; }}
      >⚙</a>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px 120px" }}>

        {/* Hero - full width */}
        <div className="hero-section" style={{ display: "flex", gap: 20, alignItems: "flex-start", marginBottom: 40, animation: "fadeUp 0.4s ease" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <Avatar name={profile.name} avatar={profile.avatar} />
            {profile.openToWork && (
              <div style={{
                fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
                color: t.openToWorkText || "#fff",
                background: t.openToWorkBg || "#16a34a",
                border: `1px solid ${t.openToWorkBorder || "rgba(255,255,255,0.2)"}`,
                borderRadius: 20, padding: "4px 0",
                width: 176, textAlign: "center",
                fontFamily: "var(--font-display)",
                whiteSpace: "nowrap",
                boxShadow: `0 0 12px ${t.openToWorkBg || "#16a34a"}55`,
              }}>
                ✦ Open to Work
              </div>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4, color: t.headingName || "var(--text)", fontFamily: "var(--font-display)" }}>{profile.name}</h1>
            <p style={{ fontSize: 12, color: "var(--accent)", fontFamily: "var(--font-mono)", marginBottom: 8 }}>{profile.title}</p>
            <p style={{ fontSize: 13, color: t.textMuted || "var(--text-muted)", marginBottom: 14 }}>📍 {profile.location}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {profile.phone && <a href={`tel:${profile.phone}`} style={linkStyle}>📞 {profile.phone}</a>}
              {profile.email && <a href={`mailto:${profile.email}`} style={linkStyle}>✉ Email</a>}
              {profile.github && <a href={profile.github} target="_blank" rel="noreferrer" style={linkStyle}>⌥ GitHub</a>}
              {profile.gitlab && <a href={profile.gitlab} target="_blank" rel="noreferrer" style={linkStyle}>⌦ GitLab</a>}
              {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noreferrer" style={linkStyle}>in LinkedIn</a>}
              {hasResume && profile.resumeVisible !== false && (
                <button onClick={() => setResumeOpen(true)} style={{ ...linkStyle, cursor: "pointer", border: "1px solid var(--accent-border)", color: "var(--accent)", background: "var(--accent-dim)" }}>
                  ↓ Resume
                </button>
              )}
            </div>
          </div>
        </div>

        <JDMatchBanner theme={t} />

        {/* Two column layout on desktop */}
        <style>{`
          .two-col { display: grid; grid-template-columns: 1fr; gap: 0; }
          @media (min-width: 768px) { .two-col { grid-template-columns: 1fr 1fr; gap: 0 40px; } }
        `}</style>
        <div className="two-col">

          {/* Left column: About, Skills, Experience */}
          <div>
            {/* About */}
            {profile.about && (
              <Section title="About" labelColor={t.labelAbout} lineColor={t.lineColor}>
                <p style={{ fontSize: 14, color: t.sectionAbout || "var(--text-muted)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{profile.about}</p>
              </Section>
            )}

            {/* Skills */}
            {profile.skills?.length > 0 && (
              <Section title="Skills" labelColor={t.labelSkills} lineColor={t.lineColor}>
                {profile.skills[0]?.group !== undefined ? (
                  // Grouped skills
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {profile.skills.map((group, gi) => (
                      <div key={gi}>
                        <p style={{ fontSize: 11, color: "var(--accent)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em", marginBottom: 8, textTransform: "uppercase" }}>{group.group}</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {(group.items || []).map((s, si) => (
                            <span key={si} style={{ fontSize: 12, color: t.sectionSkills || "var(--text-muted)", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: "5px 12px", fontFamily: "var(--font-mono)" }}>{s}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Flat skills (backward compatible)
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {profile.skills.map((s, i) => (
                      <span key={i} style={{ fontSize: 12, color: t.sectionSkills || "var(--text-muted)", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: "5px 12px", fontFamily: "var(--font-mono)" }}>{s}</span>
                    ))}
                  </div>
                )}
              </Section>
            )}

            {/* Experience */}
            {profile.experiences?.length > 0 && (
              <Section title="Experience" labelColor={t.labelExperience} lineColor={t.lineColor}>
                {profile.experiences.map((exp, i) => (
                  <Card key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 500, color: t.sectionExperience || "var(--text)" }}>{exp.role}</p>
                        <p style={{ fontSize: 13, color: "var(--accent)", fontFamily: "var(--font-mono)", marginTop: 2 }}>{exp.company}</p>
                      </div>
                      <span style={{ fontSize: 11, color: t.textMuted || "var(--text-dim)", fontFamily: "var(--font-mono)", flexShrink: 0, marginLeft: 12 }}>{exp.period}</span>
                    </div>
                    {exp.description && <p style={{ fontSize: 13, color: t.sectionExperience || "var(--text-muted)", lineHeight: 1.65, marginTop: 8 }}>{exp.description}</p>}
                  </Card>
                ))}
              </Section>
            )}
          </div>

          {/* Right column: Education, Projects, Certifications, Gallery */}
          <div>
            {/* Education */}
            {profile.educations?.length > 0 && (
              <Section title="Education" labelColor={t.labelEducation} lineColor={t.lineColor}>
                {profile.educations.map((edu, i) => (
                  <Card key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 500, color: t.sectionEducation || "var(--text)" }}>{edu.school}</p>
                        <p style={{ fontSize: 13, color: t.sectionEducation || "var(--text-muted)", marginTop: 2 }}>{edu.degree}</p>
                      </div>
                      <span style={{ fontSize: 11, color: t.textMuted || "var(--text-dim)", fontFamily: "var(--font-mono)", flexShrink: 0, marginLeft: 12 }}>{edu.period}</span>
                    </div>
                  </Card>
                ))}
              </Section>
            )}

            {/* Projects */}
            {profile.projects?.length > 0 && (
              <Section title="Projects" labelColor={t.labelProjects} lineColor={t.lineColor}>
                {profile.projects.map((p, i) => (
                  <Card key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <p style={{ fontSize: 14, fontWeight: 500, color: t.sectionProjects || "var(--text)" }}>{p.title}</p>
                      {p.tag && <span style={{ fontSize: 10, color: "var(--accent)", fontFamily: "var(--font-mono)", background: "var(--accent-dim)", border: "1px solid var(--accent-border)", borderRadius: 6, padding: "3px 8px", flexShrink: 0, marginLeft: 12 }}>{p.tag}</span>}
                    </div>
                    <p style={{ fontSize: 13, color: t.sectionProjects || "var(--text-muted)", lineHeight: 1.65 }}>{p.description}</p>
                    {p.link && <a href={p.link} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "var(--accent)", marginTop: 8, display: "inline-block" }}>View project →</a>}
                  </Card>
                ))}
              </Section>
            )}

            {/* Certifications */}
            {profile.certifications?.length > 0 && (
              <CertificationsSection certifications={profile.certifications} t={t} />
            )}

            {/* Gallery — grouped by year, newest first; hidden when galleryVisible === false */}
            {sortedGallery.length > 0 && profile.galleryVisible !== false && (
              <Section title="Gallery" labelColor={t.labelGallery} lineColor={t.lineColor}>
                {galleryGroups.map(({ year, items }, gIdx) => (
                  <div key={year ?? "noyear"} style={{ marginBottom: gIdx < galleryGroups.length - 1 ? 20 : 0 }}>
                    {/* Year label — shown only when at least one item has a year */}
                    {year && (
                      <p style={{
                        fontSize: 11, fontFamily: "var(--font-mono)",
                        color: "var(--text-muted)", letterSpacing: "0.08em",
                        marginBottom: 8,
                      }}>{year}</p>
                    )}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                      {items.map((item) => {
                        const url = galleryUrl(item);
                        const caption = galleryCaption(item);
                        const flatIdx = sortedGallery.indexOf(item);
                        return (
                          <div key={flatIdx} onClick={() => setLightboxIndex(flatIdx)} style={{ cursor: "pointer" }}>
                            {/* Image — fixed square */}
                            <div
                              style={{ width: "100%", aspectRatio: "1", borderRadius: 10, overflow: "hidden", border: "1px solid var(--border)", transition: "border-color 0.2s, transform 0.2s" }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent-border)"; e.currentTarget.style.transform = "scale(1.03)"; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "scale(1)"; }}
                            >
                              <img src={url} alt={caption || `Gallery ${flatIdx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                            </div>
                            {/* Caption — always rendered; wraps up to 2 lines for equal row heights */}
                            <p style={{
                              fontSize: 10, color: "var(--text-muted)", marginTop: 5,
                              textAlign: "center", lineHeight: 1.4, minHeight: "1.4em",
                              overflow: "hidden", display: "-webkit-box",
                              WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                            }}>{caption}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </Section>
            )}
          </div>

        </div>
      </div>

      {resumeOpen && <ResumePopup onClose={() => setResumeOpen(false)} />}
      {lightboxIndex !== null && <Lightbox images={sortedGallery} index={lightboxIndex} onClose={() => setLightboxIndex(null)} />}
      {chatOpen && <ChatPopup onClose={() => setChatOpen(false)} />}
      <FloatingButton onClick={() => setChatOpen(p => !p)} isOpen={chatOpen} />
    </>
  );
}
