import React, { useState } from 'react';
import UrlInput from './UrlInput';
import SummaryDisplay from './SummaryDisplay';
import ErrorMessage from './ErrorMessage';

// URL de tu API backend con proxy
// const API_URL = '/api/scrapagent/scrap';
const API_URL = `${import.meta.env.VITE_BACKEND_URL}/scrapagent/scrap`;

const UpdatedScraperAgentPage = () => {
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
      {/* Panel lateral izquierdo */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Encabezado del agente */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="h-6 w-6 text-blue-600 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            </div>
            <h1 className="text-lg font-semibold">Scraper Agent</h1>
          </div>
        </div>

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
        <div className="mt-auto p-4">
          <button 
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm flex items-center justify-center"
            onClick={() => {
              setSummary('');
              setProcessedUrls([]);
              setErrorMessage('');
              // No limpiamos el historial
            }}
          >
            <span className="mr-1">+</span> Nueva Consulta
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

export default UpdatedScraperAgentPage;