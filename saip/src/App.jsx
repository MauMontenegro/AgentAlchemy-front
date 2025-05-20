import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NewsAgentPage from './components/NewsAgentPage';
import ScraperAgentPage from './components/ScraperAgentPage';
import AgentNavigation from './components/AgentNavigation';

function App() {
  console.log('App component rendered');
  
  return (
    <Router>
      <div className="flex flex-col h-screen">
        <AgentNavigation />
        <div className="flex-1">
          <Routes>
            {/* Ruta raíz */}
            <Route path="/" element={<Navigate to="/agents/news" />} />
            
            {/* Rutas para los agentes */}
            <Route path="/agents/news" element={<NewsAgentPage />} />
            <Route path="/agents/scraper" element={<ScraperAgentPage />} />
            
            {/* Ruta de fallback */}
            <Route path="*" element={
              <div className="p-8">
                <h1 className="text-2xl font-bold mb-4">Página no encontrada</h1>
                <p>La página que estás buscando no existe.</p>
              </div>
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;