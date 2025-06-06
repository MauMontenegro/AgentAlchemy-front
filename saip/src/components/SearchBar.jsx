import React, { useState } from 'react';

const SearchBar = ({ 
  value, 
  onChange, 
  onSubmit, 
  articles, 
  setArticles, 
  selectedCountry,
  setSelectedCountry,
  displayLanguage,
  setDisplayLanguage,
  mode,
  setMode 
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const languageOptions = [
    { code: 'español', label: 'Español' },
    { code: 'inglés', label: 'Inglés' }
  ];

  const countryOptions = [
    { code: 'MX', label: 'México' },
    { code: 'US', label: 'Estados Unidos' },
    { code: 'CN', label: 'China' },
    { code: 'CA', label: 'Canadá' },
    { code: 'RU', label: 'Rusia' },
    { code: 'GB', label: 'Inglaterra' },
    { code: 'JP', label: 'Japón' },
    { code: 'AU', label: 'Australia' },
    { code: 'ES', label: 'España' },
    { code: 'BR', label: 'Brasil' }
  ];

  // Obtener label del país seleccionado
  const getSelectedCountryLabel = () => {
    const country = countryOptions.find(c => c.code === selectedCountry);
    return country ? country.label : 'Todos los países';
  };

  // Obtener label del idioma seleccionado
  const getSelectedLanguageLabel = () => {
    const language = languageOptions.find(l => l.code === displayLanguage);
    return language ? language.label : '';
  };

  return (
    <div className="mb-3">
      <form onSubmit={(e) => {
        e.preventDefault();
        onSubmit(e);
      }} className="space-y-2">
        {/* Campo principal de búsqueda */}
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="¿Sobre qué temas quieres informarte hoy?"
            value={value}
            onChange={onChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            className="px-3 py-2 border border-gray-300 bg-white text-gray-600 rounded-md hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200 flex items-center justify-center"
            title="Buscar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
        
        {/* Controles principales en una línea */}
        <div className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          {/* Toggle de Modo */}
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Modo:</span>
            <div className="flex bg-gray-200 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setMode('simple')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                  mode === 'simple'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Simple</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setMode('advanced')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                  mode === 'advanced'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Avanzado</span>
                </div>
              </button>
            </div>
          </div>

          {/* Separador vertical */}
          <div className="h-6 w-px bg-gray-300"></div>

          {/* Selector de número de artículos */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Artículos:
            </label>
            <select 
              className="px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              value={articles}
              onChange={(e) => setArticles(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          {/* Separador vertical */}
          <div className="h-6 w-px bg-gray-300"></div>

          {/* Botón de filtros avanzados */}
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors px-3 py-1.5 rounded-md hover:bg-blue-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span>{showAdvancedFilters ? 'Ocultar filtros' : 'Filtros avanzados'}</span>
            <span className={`transform transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {/* Indicador de descripción del modo (ahora más compacto) */}
          <div className="flex-1 text-right">
            <span className="text-xs text-gray-500 italic">
              {mode === 'simple' 
                ? 'Resúmenes simples' 
                : 'Con estado del arte'}
            </span>
          </div>
        </div>

        {/* Filtros avanzados */}
        {showAdvancedFilters && (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
            {/* País e Idioma en la misma línea */}
            <div className="grid grid-cols-2 gap-4">
              {/* País */}
              <div className="border-r border-gray-300 pr-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  País de origen
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">Todos los países</option>
                  {countryOptions.map(country => (
                    <option key={country.code} value={country.code}>
                      {country.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Idioma de visualización */}
              <div className="pl-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Idioma de visualización
                </label>
                <select
                  value={displayLanguage}
                  onChange={(e) => setDisplayLanguage(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  {languageOptions.map(language => (
                    <option key={language.code} value={language.code}>
                      {language.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Información de configuración actual */}
            <div className="text-xs text-gray-600 italic pt-2">
              Visualización: {getSelectedLanguageLabel()}
              {selectedCountry && ` • Filtro: País: ${getSelectedCountryLabel()}`}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;