import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/authContext.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import App from "./App.tsx";
import Chatbot from "./components/Chatbot/Chatbot";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <App />

          <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={12}
            containerStyle={{ zIndex: 9999 }}
            toastOptions={{
              duration: 4000,
              style: {
                background: "#18181b", // zinc-900
                color: "#fff",
                fontSize: "14px",
                fontWeight: "500",
                borderRadius: "8px",
                padding: "12px 16px",
                border: "1px solid #27272a", // zinc-800
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              },
              success: {
                iconTheme: {
                  primary: "#f97316", // orange-500
                  secondary: "#fff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444", // red-500
                  secondary: "#fff",
                },
              },
              loading: {
                iconTheme: {
                  primary: "#f97316", // orange-500
                  secondary: "#fff",
                },
              },
            }}
          />
          <Chatbot />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
