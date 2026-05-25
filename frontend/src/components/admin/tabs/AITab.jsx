import { useState, useEffect } from "react";
import { authHeaders, Divider, GroupLabel, Field, inputStyle } from "../shared";

export default function AITab({ token }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newModel, setNewModel] = useState("");

  useEffect(() => {
    fetch("/api/admin/ai-settings", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setSettings(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  const persist = async (updates) => {
    setSaving(true);
    try {
      await fetch("/api/admin/ai-settings", { method: "PUT", headers: authHeaders(token), body: JSON.stringify(updates) });
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch (e) { alert("Save failed: " + e.message); }
    setSaving(false);
  };

  const selectModel = (model) => {
    const updated = { ...settings, active_model: model };
    setSettings(updated);
    persist({ active_model: model });
  };

  const removeModel = (model) => {
    if (settings.available_models.length <= 1) return;
    const models = settings.available_models.filter(m => m !== model);
    const active = model === settings.active_model ? models[0] : settings.active_model;
    const updated = { ...settings, available_models: models, active_model: active };
    setSettings(updated);
    persist({ available_models: models, active_model: active });
  };

  const addModel = () => {
    const m = newModel.trim();
    if (!m || settings.available_models.includes(m)) return;
    const models = [...settings.available_models, m];
    setSettings(prev => ({ ...prev, available_models: models }));
    persist({ available_models: models });
    setNewModel("");
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid var(--accent)", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
    </div>
  );
  if (!settings) return <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Failed to load AI settings.</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }}>AI Models</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {saving && <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Saving...</span>}
          {saved && <span style={{ fontSize: 12, color: "var(--accent)", fontFamily: "var(--font-mono)" }}>✓ Saved</span>}
        </div>
      </div>

      {/* Active model display */}
      <div style={{ background: "var(--accent-dim)", border: "1px solid var(--accent-border)", borderRadius: 14, padding: "16px 20px", marginBottom: 24 }}>
        <p style={{ fontSize: 10, color: "var(--accent)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em", marginBottom: 6 }}>ACTIVE MODEL</p>
        <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", fontFamily: "var(--font-mono)" }}>{settings.active_model}</p>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Used for chatbot replies and JD analysis</p>
      </div>

      {/* Model list */}
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>Click a model to set it as active:</p>
      <div style={{ display: "grid", gap: 8, marginBottom: 24 }}>
        {settings.available_models.map(model => (
          <div key={model}
            onClick={() => selectModel(model)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "13px 16px", borderRadius: 12, cursor: "pointer",
              border: `1px solid ${settings.active_model === model ? "var(--accent-border)" : "var(--border)"}`,
              background: settings.active_model === model ? "var(--accent-dim)" : "var(--bg-card)",
              transition: "all 0.15s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                border: `2px solid ${settings.active_model === model ? "var(--accent)" : "var(--border)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {settings.active_model === model && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)" }} />}
              </div>
              <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: settings.active_model === model ? "var(--accent)" : "var(--text)" }}>{model}</span>
            </div>
            {settings.available_models.length > 1 && (
              <button
                onClick={e => { e.stopPropagation(); removeModel(model); }}
                style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid var(--border)", background: "none", color: "#f87171", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                title="Remove model"
              >✕</button>
            )}
          </div>
        ))}
      </div>

      <Divider />
      <GroupLabel>Add New Model</GroupLabel>
      <Field label="Model ID (e.g. gemini-2.5-pro-exp)">
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={newModel}
            onChange={e => setNewModel(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addModel()}
            placeholder="gemini-..."
            style={{ ...inputStyle, flex: 1, fontFamily: "var(--font-mono)" }}
          />
          <button onClick={addModel} style={{ padding: "8px 16px", borderRadius: 9, border: "none", background: "var(--accent)", color: "#0a0a0b", fontSize: 13, cursor: "pointer", fontFamily: "var(--font-display)", flexShrink: 0 }}>Add</button>
        </div>
      </Field>
    </div>
  );
}
