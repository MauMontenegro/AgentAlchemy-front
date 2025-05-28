import React, { useState, useEffect } from 'react';

/**
 * Componente inteligente que muestra el estado de la conexión con el backend
 * Se oculta automáticamente cuando todo está bien
 */
const StatusIndicator = () => {
  const [status, setStatus] = useState('checking');
  const [isCheckingAgain, setIsCheckingAgain] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const checkConnection = async () => {
    setIsCheckingAgain(true);
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
      
      // Usar el endpoint de health check
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(5000) // Reducido a 5 segundos para health check
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Verificar que la respuesta contenga el mensaje esperado
        if (data.message === "Agente Operativo") {
          setStatus('connected');
          console.log('✅ Health check exitoso:', data.message);
          
          // Auto-hide después de 3 segundos si está conectado
          setTimeout(() => {
            setIsVisible(false);
          }, 3000);
        } else {
          setStatus('error');
          console.log('⚠️ Health check respuesta inesperada:', data);
          setIsVisible(true);
        }
      } else {
        setStatus('error');
        console.log(`❌ Health check falló (Status: ${response.status})`);
        setIsVisible(true);
      }
      
      setLastChecked(new Date());
      
    } catch (error) {
      console.error('❌ Error en health check:', error);
      
      if (error.name === 'AbortError') {
        console.log('⏱️ Timeout en health check - El servidor tardó demasiado');
      } else if (error.message.includes('fetch')) {
        console.log('🌐 Error de red - Servidor no alcanzable');
      }
      
      setStatus('error');
      setLastChecked(new Date());
      setIsVisible(true);
    } finally {
      setIsCheckingAgain(false);
    }
  };
  
  useEffect(() => {
    const initialTimeout = setTimeout(() => {
      checkConnection();
    }, 2000);
    
    const interval = setInterval(() => {
      checkConnection();
    }, 180000);
    
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  // Auto-mostrar si hay error
  useEffect(() => {
    if (status === 'error') {
      setIsVisible(true);
      setIsMinimized(false);
    }
  }, [status]);
  
  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-yellow-500 animate-pulse';
    }
  };
  
  const getStatusText = () => {
    switch (status) {
      case 'connected': return 'API Activa';
      case 'error': return 'API Inactiva';
      default: return 'Verificando...';
    }
  };

  // Si no es visible, mostrar solo un pequeño indicador
  if (!isVisible) {
    return (
      <button
        onClick={() => {
          setIsVisible(true);
          setIsMinimized(false);
        }}
        className="fixed bottom-4 right-4 w-3 h-3 bg-green-500 rounded-full shadow-lg hover:scale-125 transition-all duration-200 z-50"
        title="Estado de la API - Click para mostrar detalles"
      />
    );
  }

  // Version minimizada
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-white rounded-full shadow-lg border border-gray-200 p-2 flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
          <button
            onClick={() => setIsMinimized(false)}
            className="text-gray-400 hover:text-gray-600 text-xs"
            title="Expandir"
          >
            ↗
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600 text-xs"
            title="Ocultar"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  // Version completa
  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-w-xs">
      {/* Header con controles */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
          <span className="font-medium text-gray-900 text-sm">{getStatusText()}</span>
        </div>
        <div className="flex items-center space-x-1">
          <button 
            onClick={checkConnection}
            disabled={isCheckingAgain}
            className={`text-blue-600 hover:text-blue-800 disabled:text-gray-400 transition-all duration-200 ${
              isCheckingAgain ? 'animate-spin' : 'hover:scale-110'
            }`}
            title="Verificar conexión"
          >
            {isCheckingAgain ? '⟳' : '↻'}
          </button>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-gray-400 hover:text-gray-600 text-xs"
            title={showDetails ? "Ocultar detalles" : "Mostrar detalles"}
          >
            {showDetails ? '▼' : '▶'}
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="text-gray-400 hover:text-gray-600 text-xs"
            title="Minimizar"
          >
            ─
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600 text-xs"
            title="Ocultar"
          >
            ✕
          </button>
        </div>
      </div>
      
      {/* Detalles (opcional) */}
      {showDetails && (
        <div className="p-3 text-xs text-gray-600 space-y-2 border-t border-gray-100">
          <div className="text-xs">
            {status === 'connected' ? '✅ Agente Operativo - Servidor funcionando' : '❌ Agente Inoperativo - Servidor no responde'}
          </div>
          <div className="text-xs text-gray-500 truncate" title={import.meta.env.VITE_BACKEND_URL}>
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
      )}

      {/* Barra de auto-hide cuando está conectado */}
      {status === 'connected' && (
        <div className="px-3 pb-2">
          <div className="text-xs text-gray-500 text-center">
            Se ocultará automáticamente en 3s
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusIndicator;