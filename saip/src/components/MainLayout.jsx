// MainLayout.jsx - Versión mejorada con persistencia
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import MainSidebar from './MainSidebar';
import StatusIndicator from './StatusIndicator';

const MainLayout = () => {
  const location = useLocation();
  
  // Cargar estado del sidebar desde localStorage para sincronizar
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved !== null ? JSON.parse(saved) : false;
  });
  
  // Determinar si estamos en la página principal
  const isHomePage = location.pathname === '/';
  
  // Determinar si estamos en un módulo
  const isInModule = location.pathname.startsWith('/modules/');

  // Función para manejar el toggle del sidebar
  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  // Escuchar cambios en localStorage para sincronizar entre pestañas
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'sidebar-collapsed') {
        setIsSidebarCollapsed(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar principal con callback para toggle */}
      <MainSidebar onToggle={handleSidebarToggle} />
      
      {/* Overlay para móviles cuando el sidebar está expandido */}
      {!isSidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => handleSidebarToggle(true)}
        />
      )}
      
      {/* Contenido principal con margen ajustable para el sidebar */}
      <main 
        className={`transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'ml-16' : 'ml-64'
        } ${isHomePage ? 'overflow-y-auto' : 'h-screen overflow-hidden'}`}
        style={{
          // Asegurar que el contenido se ajuste correctamente en dispositivos móviles
          marginLeft: window.innerWidth < 1024 ? (isSidebarCollapsed ? '4rem' : '16rem') : undefined
        }}
      >
        <Outlet />
      </main>
      
      {/* Indicador de estado (solo visible fuera de la página principal) */}
      {!isHomePage && (
        <StatusIndicator 
          style={{
            right: '1rem',
            bottom: '1rem',
            transition: 'all 0.3s ease-in-out',
            transform: isSidebarCollapsed ? 'translateX(0)' : 'translateX(-12rem)'
          }}
        />
      )}
    </div>
  );
};

export default MainLayout;