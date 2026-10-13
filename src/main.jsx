import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, Login, Signup, ProtectedRoute } from "./Auth";
import { JournalProvider } from "./JournalContext";
import App from "./Shell";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<ProtectedRoute />}>
          <Route
            path="/*"
            element={
              <JournalProvider>
                <App />
              </JournalProvider>
            }
          />
        </Route>
      </Routes>
    </AuthProvider>
  </BrowserRouter>,
);
