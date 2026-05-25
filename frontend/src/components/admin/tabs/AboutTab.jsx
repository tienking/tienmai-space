import { useState } from "react";
import { TabCard, Field, inputStyle } from "../shared";

export default function AboutTab({ profile, onSave, saving }) {
  const [about, setAbout] = useState(profile.about || "");
  return (
    <TabCard title="About" onSave={() => onSave({ about })} saving={saving}>
      <Field label="About / Bio"><textarea value={about} onChange={e => setAbout(e.target.value)} rows={8} style={{ ...inputStyle, resize: "vertical" }} /></Field>
    </TabCard>
  );
}
