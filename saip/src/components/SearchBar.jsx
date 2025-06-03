import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const SearchBar = ({ 
  value, 
  onChange, 
  onSubmit, 
  articles, 
  setArticles, 
  selectedLanguages,
  setSelectedLanguages,
  selectedCountries,
  setSelectedCountries,
  sources,
  setSources,
  mode,
  setMode 
}) => {
  const [currentSource, setCurrentSource] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Opciones disponibles
  const languageOptions = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' }
  ];

  const countryOptions = [
    { code: 'US', label: 'Estados Unidos' },
    { code: 'MX', label: 'México' }
  ];

  // Manejar agregar fuente
  const handleAddSource = (e) => {
    if (e.key === 'Enter' && currentSource.trim()) {
      e.preventDefault();
      if (!sources.includes(currentSource.trim())) {
        setSources([...sources, currentSource.trim()]);
      }
      setCurrentSource('');
    }
  };

  // Manejar eliminar fuente
  const handleRemoveSource = (sourceToRemove) => {
    setSources(sources.filter(source => source !== sourceToRemove));
  };

  // Toggle idioma
  const toggleLanguage = (langCode) => {
    if (selectedLanguages.includes(langCode)) {
      setSelectedLanguages(selectedLanguages.filter(lang => lang !== langCode));
    } else {
      setSelectedLanguages([...selectedLanguages, langCode]);
    }
  };

  // Toggle país
  const toggleCountry = (countryCode) => {
    if (selectedCountries.includes(countryCode)) {
      setSelectedCountries(selectedCountries.filter(country => country !== countryCode));
    } else {
      setSelectedCountries([...selectedCountries, countryCode]);
    }
  };

  return (
    <div className="mb-6">
      <form onSubmit={onSubmit} className="space-y-3">
        {/* Campo principal de búsqueda */}
        <div>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="¿Sobre qué temas quieres informarte hoy?"
            value={value}
            onChange={onChange}
          />
        </div>
        
        {/* Controles principales en una línea */}
        <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
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
          <div className="h-8 w-px bg-gray-300"></div>

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
          <div className="h-8 w-px bg-gray-300"></div>

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
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
            {/* Idiomas y Países en la misma línea */}
            <div className="grid grid-cols-2 gap-6">
              {/* Idiomas */}
              <div className="border-r border-gray-300 pr-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Idioma de las noticias
                </label>
                <div className="space-y-2">
                  {languageOptions.map(lang => (
                    <label key={lang.code} className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedLanguages.includes(lang.code)}
                        onChange={() => toggleLanguage(lang.code)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{lang.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Países */}
              <div className="pl-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  País de origen
                </label>
                <div className="space-y-2">
                  {countryOptions.map(country => (
                    <label key={country.code} className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedCountries.includes(country.code)}
                        onChange={() => toggleCountry(country.code)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{country.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Fuentes específicas */}
            <div className="border-t border-gray-200 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fuentes específicas (opcional)
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={currentSource}
                  onChange={(e) => setCurrentSource(e.target.value)}
                  onKeyDown={handleAddSource}
                  placeholder="Ej: bbc.com, reuters.com (presiona Enter para agregar)"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                />
                {sources.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {sources.map((source, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {source}
                        <button
                          type="button"
                          onClick={() => handleRemoveSource(source)}
                          className="ml-2 inline-flex items-center justify-center w-4 h-4 text-blue-400 hover:text-blue-600"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Indicador de filtros activos */}
            {(selectedLanguages.length > 0 || selectedCountries.length > 0 || sources.length > 0) && (
              <div className="text-xs text-gray-600 italic">
                Filtros activos: 
                {selectedLanguages.length > 0 && ` ${selectedLanguages.length} idioma(s)`}
                {selectedCountries.length > 0 && ` ${selectedCountries.length} país(es)`}
                {sources.length > 0 && ` ${sources.length} fuente(s)`}
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;