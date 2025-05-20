import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AgentNavigation = () => {
  const location = useLocation();
  
  // Verifica si una ruta está activa
  const isActive = (path) => {
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  };
  
  console.log('Current path:', location.pathname);
  
  return (
    <div className="bg-blue-700 text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-12">
          <div className="font-bold mr-6">SAIP Agentes</div>
          <nav className="flex space-x-4">
            <Link
              to="/agents/news"
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                isActive('/agents/news') 
                  ? 'bg-blue-800 text-white' 
                  : 'text-blue-100 hover:bg-blue-600'
              }`}
            >
              News Agent
            </Link>
            <Link
              to="/agents/scraper"
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                isActive('/agents/scraper') 
                  ? 'bg-blue-800 text-white' 
                  : 'text-blue-100 hover:bg-blue-600'
              }`}
            >
              Scraper Agent
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default AgentNavigation;

