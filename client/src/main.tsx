import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ToastProvider } from "@/context/ToastContext";
import { DashboardProvider } from "@/context/DashboardContext";

createRoot(document.getElementById("root")!).render(
  <DashboardProvider>
    <ToastProvider>
      <App />
    </ToastProvider>
  </DashboardProvider>
);
