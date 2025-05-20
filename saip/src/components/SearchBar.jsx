import React, { useState } from 'react';

const SearchBar = ({ value, onChange, onSubmit, articles, setArticles, model, setModel }) => {
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
        
        {/* Parámetros adicionales */}
        <div className="flex space-x-4">
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Modelo LLM
            </label>
            <select 
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="claude-3">Claude 3</option>
            </select>
          </div>
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de artículos
            </label>
            <select 
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={articles}
              onChange={(e) => setArticles(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;