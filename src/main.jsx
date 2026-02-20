import "leaflet/dist/leaflet.css";
import "./lib/leafletIconFix";

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { bootstrapAuth } from "./lib/auth.js";

bootstrapAuth();

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
