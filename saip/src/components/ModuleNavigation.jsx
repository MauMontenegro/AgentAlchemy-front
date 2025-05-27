import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const ModuleNavigation = ({ moduleTitle, agents }) => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{moduleTitle}</h1>
            <p className="text-sm text-gray-600 mt-1">
              {agents.length} agente{agents.length !== 1 ? 's' : ''} disponible{agents.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>
      
      {/* Navegación de agentes */}
      <div className="px-6">
        <nav className="flex space-x-8">
          {agents.map((agent) => (
            <Link
              key={agent.id}
              to={agent.path}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                isActive(agent.path)
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {agent.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default ModuleNavigation;