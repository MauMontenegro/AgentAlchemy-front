// MainSidebar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { 
  MagnifyingGlassIcon, 
  DocumentTextIcon, 
  BeakerIcon, 
  ChartBarIcon,
  CogIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowLeftOnRectangleIcon,
  UserCircleIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import cifIcon from '../assets/cif.png';

const MainSidebar = ({ onToggle }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };
  
  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    if (onToggle) {
      onToggle(newCollapsedState);
    }
  };
  
  const modules = [
    {
      id: 'home',
      name: 'Inicio',
      path: '/',
      icon: cifIcon,
      exact: true
    },   
    {
      id: 'admin',
      name: 'Administración',
      path: '/admin',
      icon: CogIcon,
      adminOnly: true
    },
     {
      id: 'chat',
      name: 'Petroil-GPT',
      path: '/modules/ocr/chat',
      icon: ChatBubbleLeftRightIcon,
      agentCount: 1
    },
    {
      id: 'research',
      name: 'Research & News',
      path: '/modules/research',
      icon: MagnifyingGlassIcon,
      agentCount: 2
    },
    {
      id: 'ocr',
      name: 'OCR & Documents',
      path: '/modules/ocr',
      icon: DocumentTextIcon,
      agentCount: 1
    },
    {
      id: 'rd',
      name: 'Módulo Financiero',
      path: '/modules/rd',
      icon: BeakerIcon,
      agentCount: 1,
      disabled: false
    },
    {
      id: 'monitoring',
      name: 'Monitoring',
      path: '/modules/monitoring',
      icon: ChartBarIcon,
      agentCount: 2,
      disabled: true
    }
  ];

  // Filter modules based on user role
  const filteredModules = modules.filter(module => {
    if (module.adminOnly && user?.role !== 'admin') return false;
    return true;
  });

  return (
    <div className={`h-screen bg-white border-r border-gray-200 flex flex-col fixed transition-all duration-300 ease-in-out z-30 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Logo y título */}
      <div className="p-4 border-b border-gray-200 relative">
        <Link to="/" className="flex items-center">
          <img 
            src="https://grupopetroil.com.mx/wp-content/uploads/thegem-logos/logo_3a06f2ca39ac6fe743ad22119d09384b_3x.webp" 
            alt="Petroil Logo" 
            className={`${isCollapsed ? 'h-8 w-8' : 'h-8 w-auto mr-2'} object-contain`}
          />
          {!isCollapsed && (
            <span className="text-blue-600 font-bold text-xl">
              
            </span>
          )}
        </Link>
        
        {/* Botón de colapsar/expandir discreto */}
        <button
          onClick={toggleSidebar}
          className={`absolute top-3 ${isCollapsed ? 'right-1' : 'right-3'} p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200 group`}
          title={isCollapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
        >
          {isCollapsed ? (
            <ChevronRightIcon className="h-4 w-4 transform transition-transform duration-300 group-hover:scale-110" />
          ) : (
            <ChevronLeftIcon className="h-4 w-4 transform transition-transform duration-300 group-hover:scale-110" />
          )}
        </button>
        
        {/* Workspace with user info */}
        {!isCollapsed && (
          <div className="mt-2">
            <p className="text-sm text-gray-500">Workspace</p>
            <div className="flex items-center mt-1">
              <div className="flex items-center flex-1">
                <div className="h-6 w-6 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-800 truncate">
                  {user?.username || 'Usuario'}
                </span>
              </div>
              {/* Avatar de usuario con menú */}
              <div className="ml-2 relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="h-8 w-8 rounded-full bg-purple-700 flex items-center justify-center text-white text-sm hover:ring-2 hover:ring-purple-500 transition-all"
                >
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </button>
                {showUserMenu && !isCollapsed && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <ArrowLeftOnRectangleIcon className="h-4 w-4 mr-2" />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {isCollapsed && (
          <div className="mt-2 flex justify-center relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="h-8 w-8 rounded-full bg-purple-700 flex items-center justify-center text-white text-sm hover:ring-2 hover:ring-purple-500 transition-all"
            >
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </button>
            {showUserMenu && (
              <div className="absolute left-full ml-2 mt-0 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b">
                  <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <ArrowLeftOnRectangleIcon className="h-4 w-4 mr-2" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Menú de navegación */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {filteredModules.map((module) => {
            const IconComponent = module.icon;
            const isCurrentlyActive = module.exact 
              ? location.pathname === module.path 
              : isActive(module.path);
            
            return (
              <li key={module.id}>
                {module.disabled ? (
                  <div 
                    className="flex items-center px-3 py-2 text-sm text-gray-400 cursor-not-allowed relative group"
                    title={isCollapsed ? `${module.name} - Próximamente` : undefined}
                  >
                    {typeof IconComponent === 'string' ? (
                      <img src={IconComponent} alt={module.name} className="h-5 w-5 flex-shrink-0" />
                    ) : (
                      <IconComponent className="h-5 w-5 flex-shrink-0" />
                    )}
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 ml-3">{module.name}</span>
                        {module.agentCount && (
                          <span className="bg-gray-200 text-gray-500 text-xs px-2 py-1 rounded-full">
                            {module.agentCount}
                          </span>
                        )}
                        <span className="ml-2 text-xs text-gray-400">Próximamente</span>
                      </>
                    )}
                    
                    {/* Tooltip para modo colapsado */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                        {module.name} - Próximamente
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={module.path}
                    className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors duration-200 relative group ${
                      isCurrentlyActive
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    title={isCollapsed ? module.name : undefined}
                  >
                    {typeof IconComponent === 'string' ? (
                      <img src={IconComponent} alt={module.name} className="h-5 w-5 flex-shrink-0" />
                    ) : (
                      <IconComponent className="h-5 w-5 flex-shrink-0" />
                    )}
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 ml-3">{module.name}</span>
                        {module.agentCount && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isCurrentlyActive 
                              ? 'bg-blue-200 text-blue-800' 
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {module.agentCount}
                          </span>
                        )}
                      </>
                    )}
                    
                    {/* Tooltip para modo colapsado */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                        {module.name}
                        {module.agentCount && ` (${module.agentCount})`}
                      </div>
                    )}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Información adicional */}
      <div className="p-4 border-t border-gray-200">
        <div className={`flex items-center text-xs text-gray-500 relative group ${
          isCollapsed ? 'justify-center' : 'justify-between'
        }`}>
          {isCollapsed ? (
            <>
              <CogIcon className="h-4 w-4 cursor-pointer hover:text-gray-700" title="Configuración" />
              {/* Tooltip para versión */}
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                Sistema v2.1.0
              </div>
            </>
          ) : (
            <>
              <span>Sistema v2.1.0</span>
              <CogIcon className="h-4 w-4 cursor-pointer hover:text-gray-700" />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainSidebar;