import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { LocaleProvider } from "./contexts/LocaleContext.tsx";
import { ThemeProvider } from "./contexts/ThemeContext.tsx";
import { ToastProvider } from "./contexts/ToastContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <LocaleProvider>
        <ToastProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ToastProvider>
      </LocaleProvider>
    </ThemeProvider>
  </StrictMode>
);
