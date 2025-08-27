import React from "react";
import { Routes, Route } from "react-router-dom";
import "./app.css";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";

function App() {
  return (
    <div className="app-root">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
