import React, { useState } from 'react';
import ConsultasList from './ConsultasList';
import NoticiasDisplay from './NoticiasDisplay';
import SearchBar from './SearchBar';
import ErrorMessage from './ErrorMessage';

// URL de tu API backend
const API_URL = `${import.meta.env.VITE_BACKEND_URL}/newsagent/agent`;

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
  
  // Estado para la respuesta del agente
  const [agentResponse, setAgentResponse] = useState(null);
  
  // Estado para indicar carga
  const [loading, setLoading] = useState(false);

  // Estado para mensajes de error
  const [errorMessage, setErrorMessage] = useState('');
  
  // Datos simulados de consultas previas
  const [consultas] = useState([
    { id: 1, nombre: 'Consulta 1', query: 'inteligencia artificial' },
    { id: 2, nombre: 'Consulta 2', query: 'cambio climático' },
    { id: 3, nombre: 'Consulta 3', query: 'energías renovables' }
  ]);

  // Maneja el cambio en el campo de búsqueda
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
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
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.detail || `Error: ${response.status} ${response.statusText}`
        );
      }
      
      // Parseamos la respuesta
      const data = await response.json();
      setAgentResponse(data);
      
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

  // Maneja clic en una consulta previa
  const handleConsultaClick = async (consulta) => {
    setSearchQuery(consulta.query);
    // Reset country filter when selecting from history
    setSelectedCountry('');
    // Note: Not resetting displayLanguage as it's a user preference
    await executeSearch(consulta.query);
  };

  return (
    <div className="flex h-full bg-white">
      {/* Panel lateral para consultas (sin header del agente) */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Lista de consultas usando el componente ConsultasList */}
        <div className="p-4 flex-1">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Consultas Recientes</h2>
          <ConsultasList 
            consultas={consultas} 
            onConsultaClick={handleConsultaClick} 
          />
        </div>

        {/* Botón de Nueva Consulta */}
        <div className="p-4 border-t border-gray-200">
          <button 
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm flex items-center justify-center"
            onClick={() => {
              setSearchQuery('');
              setAgentResponse(null);
              setErrorMessage('');
              setSelectedCountry('');
              // Note: Not resetting displayLanguage as it's a user preference
            }}
          >
            <span className="mr-1">+</span> Nueva Consulta
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