import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import JobTrackerApp from "./JobTrackerApp.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <JobTrackerApp />
  </StrictMode>
);
