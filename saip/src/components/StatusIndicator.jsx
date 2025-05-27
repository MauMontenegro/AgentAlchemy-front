// StatusIndicator.jsx - Versión para producción (EC2 + Vercel)
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
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
      
      // Hacer una petición real pero pequeña al endpoint que sabemos que funciona
      const response = await fetch(`${baseUrl}/newsagent/agent`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          query: "connection test",
          agent_type: "news", 
          model: "gpt-4",
          articles: 1
        }),
        // Timeout para evitar que se cuelgue
        signal: AbortSignal.timeout(10000) // 10 segundos
      });
      
      // Cualquier respuesta del servidor (incluso errores 422, 400) significa que está conectado
      if (response.status >= 200 && response.status < 600) {
        setStatus('connected');
        console.log(`✅ Backend conectado (Status: ${response.status})`);
      } else {
        setStatus('error');
        console.log(`❌ Backend error (Status: ${response.status})`);
      }
      
      setLastChecked(new Date());
      
    } catch (error) {
      console.error('❌ Error checking connection:', error);
      
      // Diferentes tipos de error
      if (error.name === 'AbortError') {
        console.log('⏱️ Timeout - El servidor tardó demasiado en responder');
      } else if (error.message.includes('fetch')) {
        console.log('🌐 Error de red - Servidor no alcanzable');
      }
      
      setStatus('error');
      setLastChecked(new Date());
    } finally {
      setIsCheckingAgain(false);
    }
  };
  
  // Verificar la conexión al cargar el componente
  useEffect(() => {
    // Pequeño delay inicial para no interferir con la carga de la página
    const initialTimeout = setTimeout(() => {
      checkConnection();
    }, 2000);
    
    // Verificar cada 3 minutos (menos frecuente en producción)
    const interval = setInterval(() => {
      checkConnection();
    }, 180000);
    
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);
  
  // Determinar el color del indicador
  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-yellow-500 animate-pulse';
    }
  };
  
  // Determinar el texto del estado
  const getStatusText = () => {
    switch (status) {
      case 'connected': return 'API Activa';
      case 'error': return 'API Inactiva';
      default: return 'Verificando...';
    }
  };
  
  // Determinar detalles adicionales
  const getStatusDetails = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    
    switch (status) {
      case 'connected': 
        return `✅ Servidor EC2 respondiendo`;
      case 'error': 
        return `❌ Servidor EC2 no responde`;
      default: 
        return `🔄 Probando conexión...`;
    }
  };
  
  return (
    <div className="fixed bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg border border-gray-200 text-xs z-50 max-w-sm">
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
        <span className="font-medium text-gray-900">{getStatusText()}</span>
        <button 
          onClick={checkConnection}
          disabled={isCheckingAgain}
          className={`text-blue-600 hover:text-blue-800 disabled:text-gray-400 transition-all duration-200 ${
            isCheckingAgain ? 'animate-spin' : 'hover:scale-110'
          }`}
          title="Verificar conexión ahora"
        >
          {isCheckingAgain ? '⟳' : '↻'}
        </button>
      </div>
      
      <div className="mt-2 text-gray-600 space-y-1">
        <div className="text-xs">
          {getStatusDetails()}
        </div>
        <div className="text-xs text-gray-500">
          🌐 {import.meta.env.VITE_BACKEND_URL || 'Backend no configurado'}
        </div>
        {lastChecked && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Última verificación:</span>
            <span className="text-gray-700 font-mono">
              {lastChecked.toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>
      
      {/* Indicador de ambiente */}
      <div className="mt-2 pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Ambiente:</span>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
            Producción
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatusIndicator;