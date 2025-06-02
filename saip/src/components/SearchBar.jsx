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
  setSources
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
        
        {/* Parámetros básicos */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de artículos
              </label>
              <select 
                className="px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={articles}
                onChange={(e) => setArticles(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Botón para mostrar/ocultar filtros avanzados */}
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
          >
            {showAdvancedFilters ? 'Ocultar filtros' : 'Mostrar filtros avanzados'}
            <span className={`ml-1 transform transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
        </div>

        {/* Filtros avanzados */}
        {showAdvancedFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
            {/* Idiomas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Idioma de las noticias
              </label>
              <div className="flex space-x-4">
                {languageOptions.map(lang => (
                  <label key={lang.code} className="flex items-center cursor-pointer">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                País de origen
              </label>
              <div className="flex space-x-4">
                {countryOptions.map(country => (
                  <label key={country.code} className="flex items-center cursor-pointer">
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

            {/* Fuentes específicas */}
            <div>
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