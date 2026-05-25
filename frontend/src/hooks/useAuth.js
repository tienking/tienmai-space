import { useState } from "react";

export function getTokenExpiry(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000;
  } catch { return null; }
}

export function useAuth() {
  const [token, setToken] = useState(() => {
    const t = localStorage.getItem("admin_token");
    if (!t) return null;
    const exp = getTokenExpiry(t);
    if (exp && Date.now() > exp) {
      localStorage.removeItem("admin_token");
      return null;
    }
    return t;
  });
  const login = async (username, password) => {
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const err = new Error(typeof data.detail === "object" ? data.detail.message : (data.detail || "Invalid credentials"));
      if (res.status === 429 && data.detail?.locked_until) err.lockedUntil = data.detail.locked_until * 1000;
      throw err;
    }
    const data = await res.json();
    localStorage.setItem("admin_token", data.access_token);
    setToken(data.access_token);
  };
  const logout = () => { localStorage.removeItem("admin_token"); setToken(null); };
  return { token, login, logout };
}
