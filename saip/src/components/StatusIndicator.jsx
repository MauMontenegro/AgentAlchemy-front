import React, { useState, useEffect } from 'react';

/**
 * Componente que muestra el estado de la conexión con el backend
 */
const StatusIndicator = () => {
  const [status, setStatus] = useState('checking');
  const [isCheckingAgain, setIsCheckingAgain] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);
  
  const checkConnection = async () => {
    setIsCheckingAgain(true);
    try {
      // Usar la misma URL que usan tus componentes
      const testUrl = `${import.meta.env.VITE_BACKEND_URL}/newsagent/agent`;
      
      const response = await fetch(testUrl, { 
        method: 'OPTIONS',
        headers: { 'Content-Type': 'application/json' }
      }).catch(() => null);
      
      if (response && response.ok) {
        setStatus('connected');
      } else {
        setStatus('error');
      }
      setLastChecked(new Date());
    } catch (error) {
      setStatus('error');
    } finally {
      setIsCheckingAgain(false);
    }
  };
  
  // Verificar la conexión al cargar el componente
  useEffect(() => {
    checkConnection();
    
    // Verificar cada 60 segundos
    const interval = setInterval(() => {
      checkConnection();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Determinar el color del indicador
  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };
  
  // Determinar el texto del estado
  const getStatusText = () => {
    switch (status) {
      case 'connected': return 'Conectado';
      case 'error': return 'Error de conexión';
      default: return 'Verificando...';
    }
  };
  
  return (
    <div className="fixed bottom-4 right-4 bg-white p-2 rounded-md shadow-md border border-gray-200 text-xs">
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
        <span className="font-medium">{getStatusText()}</span>
        <button 
          onClick={checkConnection}
          disabled={isCheckingAgain}
          className="text-blue-600 hover:text-blue-800 disabled:text-gray-400"
        >
          {isCheckingAgain ? '...' : '↻'}
        </button>
      </div>
      
      <div className="mt-1 text-gray-500">
        <div>Backend: {import.meta.env.VITE_BACKEND_URL || 'No configurado'}</div>
        {lastChecked && (
          <div>Última verificación: {lastChecked.toLocaleTimeString()}</div>
        )}
      </div>
    </div>
  );
};

export default StatusIndicator;