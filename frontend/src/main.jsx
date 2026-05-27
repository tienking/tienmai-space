import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

// index.css is not imported here — App.jsx injects its own GLOBAL_CSS
// which includes the full reset, keyframes, and responsive grid classes.
// admin.jsx still imports index.css for the dark-themed admin panel.

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
