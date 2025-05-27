import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ModuleNavigation from './ModuleNavigation';
import NewsAgentPage from './NewsAgentPage'; // Tu componente existente
import ScraperAgentPage from './ScraperAgentPage'; // Tu componente existente

const ResearchModulePage = () => {
  const agents = [
    {
      id: 'news',
      name: 'News Agent',
      path: '/modules/research/news',
      description: 'Búsqueda y análisis de noticias relevantes'
    },
    {
      id: 'scraper',
      name: 'Scraper Agent',
      path: '/modules/research/scraper',
      description: 'Análisis y resumen de contenido web'
    }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Navegación del módulo */}
      <ModuleNavigation 
        moduleTitle="Research & News" 
        agents={agents}
      />
      
      {/* Contenido de los agentes */}
      <div className="flex-1 overflow-hidden">
        <Routes>
          {/* Redirección por defecto al News Agent */}
          <Route path="/" element={<Navigate to="/modules/research/news" replace />} />
          <Route path="/news" element={<NewsAgentPage />} />
          <Route path="/scraper" element={<ScraperAgentPage />} />
        </Routes>
      </div>
    </div>
  );
};

export default ResearchModulePage;