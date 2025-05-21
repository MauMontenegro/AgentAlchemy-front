import React, { useState } from 'react';
import ConsultasList from './ConsultasList';
import NoticiasDisplay from './NoticiasDisplay';
import SearchBar from './SearchBar';
import ErrorMessage from './ErrorMessage';

// URL de tu API backend con proxy
const API_URL = '/api/newsagent/agent'; // Usa el proxy configurado en vite.config.js

const NewsAgentPage = () => {
  // Estado para el texto de búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estado para parámetros adicionales
  const [articles, setArticles] = useState(2);
  const [model, setModel] = useState('gpt-4');
  const [agentType, setAgentType] = useState('news');
  
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

  // Maneja el envío del formulario de búsqueda
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    
    if (searchQuery.trim() === '') return;
    
    setLoading(true);
    setAgentResponse(null);
    setErrorMessage('');
    
    try {
      // Preparamos el payload según tu modelo Pydantic
      const payload = {
        query: searchQuery,
        agent_type: agentType,
        model: model,
        articles: articles
      };
      console.log(payload)
      // Hacemos la petición POST al backend
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Parseamos la respuesta
      const data = await response.json();
      setAgentResponse(data);
      
    } catch (error) {
      console.error('Error al buscar noticias:', error);
      // Podrías mostrar un mensaje de error al usuario
    } finally {
      setLoading(false);
    }
  };

  // Maneja clic en una consulta previa
  const handleConsultaClick = (consulta) => {
    setSearchQuery(consulta.query);
    // Llamamos a handleSearchSubmit manualmente pasando un evento simulado
    handleSearchSubmit({ preventDefault: () => {} });
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Panel lateral izquierdo */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Encabezado del agente */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="h-6 w-6 text-blue-600 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
              </svg>
            </div>
            <h1 className="text-lg font-semibold">News Agent</h1>
          </div>
        </div>

        {/* Lista de consultas usando el componente ConsultasList */}
        <ConsultasList 
          consultas={consultas} 
          onConsultaClick={handleConsultaClick} 
        />

        {/* Botón de Nuevo Agente */}
        <div className="mt-auto p-4">
          <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm flex items-center justify-center">
            <span className="mr-1">+</span> Nuevo Agente
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
          model={model}
          setModel={setModel}
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
          />
        </div>
      </div>
    </div>
  );
};

export default NewsAgentPage;