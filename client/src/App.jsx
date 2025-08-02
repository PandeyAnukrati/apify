import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import Header from "./components/Layout/Header";
import Home from "./pages/Home";
import ActorList from "./pages/ActorList";
import ActorDetail from "./pages/ActorDetail";
import RunResults from "./pages/RunResults";
import { ApiKeyProvider } from "./context/ApiKeyContext";

function App() {
  return (
    <ApiKeyProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/actors"
              element={
                <div className="container mx-auto px-4 py-8">
                  <ActorList />
                </div>
              }
            />
            <Route
              path="/actors/:actorId"
              element={
                <div className="container mx-auto px-4 py-8">
                  <ActorDetail />
                </div>
              }
            />
            <Route
              path="/runs/:runId/results"
              element={
                <div className="container mx-auto px-4 py-8">
                  <RunResults />
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </ApiKeyProvider>
  );
}

export default App;
