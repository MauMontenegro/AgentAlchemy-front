import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const AgentNavigation = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  // Verifica si una ruta está activa
  const isActive = (path) => {
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  };
  
  return (
    <div className="bg-blue-700 text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center">
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
          
          {/* User info and logout */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-blue-100">
              {user?.username} {user?.role === 'admin' && '(Admin)'}
            </span>
            <button
              onClick={logout}
              className="text-sm text-blue-100 hover:text-white hover:bg-blue-600 px-2 py-1 rounded"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentNavigation;

