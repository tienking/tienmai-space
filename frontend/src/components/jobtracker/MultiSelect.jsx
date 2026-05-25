import { useState, useEffect, useRef } from "react";

export const MODE_OPTIONS = [
  { value: "On-site", label: "On-site" },
  { value: "Hybrid",  label: "Hybrid"  },
  { value: "Remote",  label: "Remote"  },
];

export const STATUS_OPTIONS = [
  { value: "not_applied",  label: "Chưa apply"     },
  { value: "applied",      label: "Đã apply"        },
  { value: "viewed",       label: "Đã xem CV"       },
  { value: "downloaded",   label: "Đã tải CV"       },
  { value: "interviewing", label: "Đang phỏng vấn"  },
  { value: "waiting",      label: "Chờ kết quả"     },
  { value: "rejected",     label: "Đã từ chối"      },
  { value: "failed",       label: "Rớt"             },
];

export default function MultiSelect({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const allSelected = selected === null || selected.size === options.length;
  const someSelected = !allSelected && selected !== null && selected.size > 0;
  const isChecked = (val) => selected === null || selected.has(val);

  const toggleAll = () => onChange(allSelected ? new Set() : null);

  const toggle = (val) => {
    const base = selected === null ? new Set(options.map(o => o.value)) : new Set(selected);
    if (base.has(val)) base.delete(val); else base.add(val);
    onChange(base.size === options.length ? null : base);
  };

  let btnLabel;
  if (allSelected || (selected !== null && selected.size === 0)) btnLabel = `Tất cả ${label}`;
  else if (selected.size === 1) {
    const opt = options.find(o => String(o.value) === String([...selected][0]));
    btnLabel = opt ? opt.label : label;
  } else btnLabel = `${selected.size} ${label}`;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ fontSize: 12, padding: "5px 8px", borderRadius: 6, border: "0.5px solid #ccc", background: open ? "#f5f5f3" : "#fff", color: "#333", fontFamily: "inherit", cursor: "pointer", whiteSpace: "nowrap" }}>
        {btnLabel} {open ? "▴" : "▾"}
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 200, background: "#fff", border: "0.5px solid #e0e0dc", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", padding: "6px 0", minWidth: 160 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 14px", cursor: "pointer", fontSize: 12, userSelect: "none" }}>
            <input type="checkbox" checked={allSelected} ref={el => { if (el) el.indeterminate = someSelected; }} onChange={toggleAll} />
            Tất cả
          </label>
          <div style={{ height: "0.5px", background: "#f0f0ec", margin: "4px 0" }} />
          {options.map(opt => (
            <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 14px", cursor: "pointer", fontSize: 12, userSelect: "none" }}>
              <input type="checkbox" checked={isChecked(opt.value)} onChange={() => toggle(opt.value)} />
              {opt.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
