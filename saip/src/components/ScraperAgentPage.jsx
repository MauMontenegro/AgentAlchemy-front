import React, { useState } from 'react';
import UrlInput from './UrlInput';
import SummaryDisplay from './SummaryDisplay';
import ErrorMessage from './ErrorMessage';

// URL de tu API backend
const API_URL = `${import.meta.env.VITE_BACKEND_URL}/scrapagent/scrap`;

const ScraperAgentPage = () => {
  // Estado para el resumen
  const [summary, setSummary] = useState('');
  
  // Estado para URLs procesadas (para mostrar en la visualización)
  const [processedUrls, setProcessedUrls] = useState([]);
  
  // Estado para indicar carga
  const [loading, setLoading] = useState(false);
  
  // Estado para mensajes de error
  const [errorMessage, setErrorMessage] = useState('');
  
  // Historial de URLs procesadas
  const [urlHistory, setUrlHistory] = useState([]);

  // Maneja el envío del formulario con múltiples URLs
  const handleSubmit = async (urls) => {
    if (!urls || urls.length === 0) return;
    
    setLoading(true);
    setSummary('');
    setProcessedUrls(urls);
    setErrorMessage('');
    
    try {
      // Preparamos el payload según tu modelo Pydantic actualizado
      const payload = {
        urls: urls
      };
      
      console.log('Enviando petición a:', API_URL);
      console.log('Payload:', payload);
      
      // Hacemos la petición POST al backend
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      console.log('Código de estado:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.detail || `Error: ${response.status} ${response.statusText}`
        );
      }
      
      // Parseamos la respuesta
      const data = await response.json();
      console.log('Respuesta recibida:', data);
      
      // Actualizamos el estado con el resumen
      setSummary(data.summary);
      
      // Añadimos las URLs al historial
      updateUrlHistory(urls);
      
    } catch (error) {
      console.error('Error al procesar las URLs:', error);
      setErrorMessage(error.message || 'Ocurrió un error al procesar las URLs. Por favor, verifica que las URLs sean válidas e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  
  // Función para actualizar el historial de URLs
  const updateUrlHistory = (urls) => {
    // Creamos un identificador único para esta consulta
    const historyItem = {
      id: Date.now(), // ID único basado en timestamp
      urls: urls,
      timestamp: new Date().toLocaleString()
    };
    
    // Añadimos al historial (limitando a las 5 consultas más recientes)
    setUrlHistory(prevHistory => [historyItem, ...prevHistory].slice(0, 5));
  };
  
  // Función para cargar URLs del historial
  const handleHistoryItemClick = (historyItem) => {
    // Simplemente cargamos las URLs en el formulario y ejecutamos
    handleSubmit(historyItem.urls);
  };

  return (
    <div className="flex h-full bg-white">
      {/* Panel lateral para historial (sin header del agente) */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Historial de URLs */}
        <div className="p-4 flex-1 overflow-y-auto">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Historial de consultas</h2>
          {urlHistory.length > 0 ? (
            <ul className="space-y-4">
              {urlHistory.map((item) => (
                <li 
                  key={item.id}
                  className="p-2 bg-gray-50 hover:bg-gray-100 rounded cursor-pointer transition"
                  onClick={() => handleHistoryItemClick(item)}
                >
                  <div className="text-xs text-gray-500">{item.timestamp}</div>
                  <div>
                    {item.urls.map((url, idx) => (
                      <div key={idx} className="text-xs truncate text-blue-600">
                        {url}
                      </div>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-500">No hay historial disponible.</p>
          )}
        </div>

        {/* Botón de Nueva Consulta */}
        <div className="p-4 border-t border-gray-200">
          <button
            className="
              w-full 
              bg-blue-600 
              hover:bg-blue-700 
              active:bg-blue-800
              text-white 
              px-4 py-2.5 
              rounded-lg 
              text-sm font-medium
              flex items-center justify-center
              shadow-sm hover:shadow-md
              transform transition-all duration-200 ease-in-out
              hover:-translate-y-0.5
              active:translate-y-0
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              group
            "
            onClick={() => {
              setSummary('');
              setProcessedUrls([]);
              setErrorMessage('');
            }}
          >
            <span className="
              mr-2 
              text-lg
              transition-transform duration-200 
              group-hover:rotate-90
            ">
              +
            </span>
            <span>Nueva Consulta</span>
          </button>
        </div>
      </div>

      {/* Área principal de contenido */}
      <div className="flex-1 p-6 bg-gray-50">
        {/* Componente de entrada de múltiples URLs */}
        <UrlInput 
          onSubmit={handleSubmit}
          isLoading={loading}
        />

        {/* Mensaje de error */}
        <ErrorMessage message={errorMessage} />

        {/* Sección de Resumen */}
        <div>
          <h2 className="text-sm font-medium text-gray-700 mb-3">
            {processedUrls.length > 1 ? 'Comparación de artículos:' : 'Resumen del artículo:'}
          </h2>
          
          {/* Componente para mostrar el resumen */}
          <SummaryDisplay 
            summary={summary}
            loading={loading}
            url={processedUrls.length === 1 ? processedUrls[0] : null}
            urls={processedUrls.length > 1 ? processedUrls : null}
          />
        </div>
      </div>
    </div>
  );
};

export default ScraperAgentPage;