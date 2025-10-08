import React from "react";
import PricePredictor from "./components/PricePredictor";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header>
        <h1>PriceOptima Dashboard</h1>
      </header>
      <main>
        <PricePredictor />
      </main>
      <footer>
        <p>© 2025 PriceOptima - Dynamic Pricing AI</p>
      </footer>
    </div>
  );
}

export default App;
