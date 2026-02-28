/**
 * Entry point for the React app. Mounts the App component into the DOM root.
 * Uses: @/App
 * Exports: nothing — side-effect only entry file
 * Author: Haukur — example/scaffold, use as template
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/App";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
