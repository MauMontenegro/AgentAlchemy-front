import React, { useState, useEffect } from 'react';
import ConsultasList from './ConsultasList';
import NoticiasDisplay from './NoticiasDisplay';
import SearchBar from './SearchBar';
import ErrorMessage from './ErrorMessage';

// URL de tu API backend
const API_URL = `${import.meta.env.VITE_BACKEND_URL}/newsagent/agent`;

// Key para localStorage
const SEARCH_HISTORY_KEY = 'newsAgent_searchHistory';

const NewsAgentPage = () => {
  // Estado para el texto de búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estado para parámetros adicionales
  const [articles, setArticles] = useState(2);
  
  // Estado para el modo del agente
  const [mode, setMode] = useState('advanced'); // 'simple' or 'advanced'
  
  // Estados para los nuevos campos opcionales
  const [selectedCountry, setSelectedCountry] = useState('');
  const [displayLanguage, setDisplayLanguage] = useState('español'); // Default to Spanish
  const [selectedSources, setSelectedSources] = useState([]);
  
  // Estado para la respuesta del agente
  const [agentResponse, setAgentResponse] = useState(null);
  
  // Estado para indicar carga
  const [loading, setLoading] = useState(false);

  // Estado para mensajes de error
  const [errorMessage, setErrorMessage] = useState('');
  
  // Estado para el historial de búsquedas con localStorage
  const [searchHistory, setSearchHistory] = useState(() => {
    try {
      const savedHistory = localStorage.getItem(SEARCH_HISTORY_KEY);
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
      console.error('Error loading search history:', error);
      return [];
    }
  });

  // Guardar historial en localStorage cuando cambie
  useEffect(() => {
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }, [searchHistory]);

  // Maneja el cambio en el campo de búsqueda
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Función para actualizar el historial de búsquedas
  const updateSearchHistory = (query, articlesCount, modeUsed, country, language, sources) => {
    // Evitar duplicados: si la misma búsqueda ya existe en las últimas 3, no la agregamos
    const isDuplicate = searchHistory
      .slice(0, 3)
      .some(item => 
        item.query === query && 
        item.articles === articlesCount && 
        item.mode === modeUsed &&
        item.country === country &&
        item.language === language &&
        JSON.stringify(item.sources || []) === JSON.stringify(sources || [])
      );
    
    if (isDuplicate) return;

    // Creamos un identificador único para esta búsqueda
    const historyItem = {
      id: Date.now(), // ID único basado en timestamp
      query: query,
      articles: articlesCount,
      mode: modeUsed,
      country: country || null,
      language: language,
      sources: sources || [],
      timestamp: new Date().toLocaleString('es-ES', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
    
    // Añadimos al historial (limitando a las 15 búsquedas más recientes)
    setSearchHistory(prevHistory => [historyItem, ...prevHistory].slice(0, 15));
  };

  // Función para limpiar el historial
  const clearHistory = () => {
    if (confirm('¿Estás seguro de que quieres limpiar todo el historial de búsquedas?')) {
      setSearchHistory([]);
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    }
  };

  // Función para eliminar un elemento específico del historial
  const removeFromHistory = (itemId, event) => {
    event.stopPropagation(); // Evitar que se ejecute el click del li
    setSearchHistory(prevHistory => prevHistory.filter(item => item.id !== itemId));
  };

  // Función para ejecutar la búsqueda
  const executeSearch = async (query) => {
    if (!query || query.trim() === '') return;
    
    setLoading(true);
    setAgentResponse(null);
    setErrorMessage('');
    
    try {
      // Preparamos el payload según tu modelo Pydantic actualizado
      const payload = {
        query: query,
        articles: articles,
        mode: mode,
        language: [displayLanguage] // Always send display language
      };
      
      // Agregar país si está seleccionado
      if (selectedCountry) {
        payload.country = [selectedCountry]; // Backend expects array
      }
      
      // Agregar fuentes si están seleccionadas
      if (selectedSources && selectedSources.length > 0) {
        payload.source = selectedSources; // Backend expects 'source' not 'sources'
      }
      
      console.log('Enviando petición a:', API_URL);
      console.log('Payload completo:', JSON.stringify(payload, null, 2));
      
      // Hacemos la petición POST al backend
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.detail || `Error: ${response.status} ${response.statusText}`
        );
      }
      
      // Parseamos la respuesta
      const data = await response.json();
      setAgentResponse(data);
      
      // Actualizamos el historial de búsquedas después de una búsqueda exitosa
      updateSearchHistory(query, articles, mode, selectedCountry, displayLanguage, selectedSources);
      
    } catch (error) {
      console.error('Error al buscar noticias:', error);
      setErrorMessage(error.message || 'Ocurrió un error al buscar noticias. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Maneja el envío del formulario de búsqueda
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    await executeSearch(searchQuery);
  };

  // Maneja clic en un elemento del historial
  const handleHistoryItemClick = async (historyItem) => {
    // Cargamos todos los parámetros de la búsqueda anterior
    setSearchQuery(historyItem.query);
    setArticles(historyItem.articles);
    setMode(historyItem.mode);
    setSelectedCountry(historyItem.country || '');
    setDisplayLanguage(historyItem.language);
    setSelectedSources(historyItem.sources || []);
    
    // Ejecutamos la búsqueda con un pequeño delay para que se actualicen los estados
    setTimeout(async () => {
      await executeSearch(historyItem.query);
    }, 100);
  };

  return (
    <div className="flex h-full bg-white">
      {/* Panel lateral para consultas */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Lista de búsquedas recientes */}
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-gray-500">Consultas Recientes</h2>
            {searchHistory.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                title="Limpiar historial"
              >
                Limpiar
              </button>
            )}
          </div>
          
          {searchHistory.length > 0 ? (
            <ul className="space-y-2">
              {searchHistory.map((item) => (
                <li 
                  key={item.id}
                  className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors duration-150 group relative"
                  onClick={() => handleHistoryItemClick(item)}
                  title={item.sources && item.sources.length > 1 ? `Fuentes: ${item.sources.join(', ')}` : ''}
                >
                  {/* Botón de eliminar */}
                  <button
                    onClick={(e) => removeFromHistory(item.id, e)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-red-500"
                    title="Eliminar del historial"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  
                  <div className="text-xs text-gray-500 mb-1">{item.timestamp}</div>
                  <div className="text-sm text-gray-700 font-medium group-hover:text-blue-600 transition-colors line-clamp-2 pr-6">
                    {item.query}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">
                      {item.articles} artículo{item.articles !== 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">
                      {item.mode === 'advanced' ? 'Avanzado' : 'Simple'}
                    </span>
                    {item.country && (
                      <>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-400">{item.country}</span>
                      </>
                    )}
                    {item.sources && item.sources.length > 0 && (
                      <>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-400 font-medium">
                          {item.sources.length === 1 
                            ? item.sources[0] 
                            : `${item.sources.length} fuentes`}
                        </span>
                      </>
                    )}
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">{item.language}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs text-gray-500">
                No hay búsquedas recientes
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Tus búsquedas aparecerán aquí
              </p>
            </div>
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
              setSearchQuery('');
              setAgentResponse(null);
              setErrorMessage('');
              // Reset filters to defaults
              setSelectedCountry('');
              setSelectedSources([]);
              setMode('advanced');
              // Note: Not resetting displayLanguage as it's a user preference
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
        {/* Barra de búsqueda usando el componente SearchBar */}
        <SearchBar 
          value={searchQuery} 
          onChange={handleSearchChange} 
          onSubmit={handleSearchSubmit}
          articles={articles}
          setArticles={setArticles}
          selectedCountry={selectedCountry}
          setSelectedCountry={setSelectedCountry}
          displayLanguage={displayLanguage}
          setDisplayLanguage={setDisplayLanguage}
          mode={mode}
          setMode={setMode}
          selectedSources={selectedSources}
          setSelectedSources={setSelectedSources}
        />

        {/* Mensaje de error */}
        <ErrorMessage message={errorMessage} />

        {/* Sección de Noticias Relevantes */}
        <div>
          <h2 className="text-sm font-medium text-gray-700 mb-3">Noticias Relevantes:</h2>
          
          {/* Componente para mostrar las noticias */}
          <NoticiasDisplay 
            agentResponse={agentResponse} 
            loading={loading}
            mode={mode}
          />
        </div>
      </div>
    </div>
  );
};

export default NewsAgentPage;