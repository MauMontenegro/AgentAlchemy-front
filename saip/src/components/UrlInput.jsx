import React, { useState } from 'react';

const UrlInput = ({ onSubmit, isLoading }) => {
  // Estado para las URLs
  const [url1, setUrl1] = useState('');
  const [url2, setUrl2] = useState('');
  
  // Estado para el modo de comparación
  const [compareMode, setCompareMode] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!url1) return;
    
    // En modo comparación, se requieren ambas URLs
    if (compareMode && !url2) {
      alert('Por favor ingresa ambas URLs para comparar');
      return;
    }
    
    // Crear una lista de URLs según el modo
    const urls = compareMode ? [url1, url2] : [url1];
    
    // Llamar a la función onSubmit con la lista de URLs
    onSubmit(urls);
  };
  
  return (
    <div className="mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Switch para activar/desactivar modo de comparación */}
        <div className="flex items-center mb-2">
          <div className="form-control">
            <label className="flex items-center cursor-pointer">
              <span className="text-sm font-medium text-gray-700 mr-3">Modo comparación</span>
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only"
                  checked={compareMode}
                  onChange={() => setCompareMode(!compareMode)}
                />
                <div className={`block w-10 h-6 rounded-full ${compareMode ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${compareMode ? 'transform translate-x-4' : ''}`}></div>
              </div>
            </label>
          </div>
        </div>
        
        {/* Primera URL (siempre visible) */}
        <div>
          <label htmlFor="url1" className="block text-sm font-medium text-gray-700 mb-1">
            URL principal:
          </label>
          <input
            id="url1"
            type="url"
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="https://ejemplo.com/articulo1"
            value={url1}
            onChange={(e) => setUrl1(e.target.value)}
            required
          />
        </div>
        
        {/* Segunda URL (visible solo en modo comparación) */}
        {compareMode && (
          <div>
            <label htmlFor="url2" className="block text-sm font-medium text-gray-700 mb-1">
              URL para comparar:
            </label>
            <input
              id="url2"
              type="url"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="https://ejemplo2.com/articulo2"
              value={url2}
              onChange={(e) => setUrl2(e.target.value)}
              required
            />
          </div>
        )}
        
        {/* Botón de envío */}
        <div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </span>
            ) : compareMode ? 'Comparar artículos' : 'Resumir artículo'}
          </button>
        </div>
      </form>
      
      {/* Texto de ayuda */}
      <p className="mt-2 text-xs text-gray-500">
        {compareMode 
          ? "Introduce dos URLs para generar un análisis comparativo entre ambos artículos." 
          : "Introduce la URL de un artículo para generar un resumen."}
      </p>
    </div>
  );
};

export default UrlInput;