import React, { useState } from 'react';

const ArticleCard = ({ article }) => {
  const [showBiasExplanation, setShowBiasExplanation] = useState(false);

  // Configuración de colores y etiquetas para el bias político
  const getBiasConfig = (bias) => {
    const configs = {
      center: {
        color: 'bg-gray-100 text-gray-800 border-gray-300',
        icon: '⚖️',
        label: 'Centro',
        description: 'Perspectiva equilibrada'
      },
      left: {
        color: 'bg-blue-100 text-blue-800 border-blue-300',
        icon: '🔵',
        label: 'Izquierda',
        description: 'Perspectiva progresista'
      },
      right: {
        color: 'bg-red-100 text-red-800 border-red-300',
        icon: '🔴',
        label: 'Derecha', 
        description: 'Perspectiva conservadora'
      },
      humor: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: '😄',
        label: 'Humor',
        description: 'Contenido humorístico'
      }
    };
    return configs[bias] || configs.center;
  };

  const biasConfig = getBiasConfig(article.bias);

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header con título y bias */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-medium text-blue-600 hover:underline flex-1 mr-4">
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            {article.title}
          </a>
        </h3>
        
        {/* Indicador de Bias Político */}
        <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium border ${biasConfig.color} shrink-0`}>
          <span className="mr-1">{biasConfig.icon}</span>
          <span>{biasConfig.label}</span>
        </div>
      </div>

      {/* Metadata: Fecha y Temas */}
      <div className="mb-4 space-y-2">
        {article.date && (
          <div className="flex items-center text-xs text-gray-500">
            <span className="mr-1">📅</span>
            <span>{formatDate(article.date)}</span>
          </div>
        )}
        
        {article.topics && article.topics.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {article.topics.slice(0, 6).map((topic, idx) => (
              <span 
                key={idx} 
                className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
              >
                {topic}
              </span>
            ))}
            {article.topics.length > 6 && (
              <span className="inline-block px-2 py-1 bg-gray-200 text-gray-500 text-xs rounded-md">
                +{article.topics.length - 6} más
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Bullets de resumen */}
      <ul className="mb-4 list-disc list-inside space-y-2">
        {article.bullets.map((bullet, idx) => (
          <li key={idx} className="text-sm text-gray-700 leading-relaxed">
            {bullet}
          </li>
        ))}
      </ul>

      {/* Sección de Análisis de Bias */}
      {article.bias_explanation && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <button
            onClick={() => setShowBiasExplanation(!showBiasExplanation)}
            className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <div className="flex items-center">
              <span className="mr-2">🎯</span>
              <span>Análisis de Sesgo Político</span>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${biasConfig.color}`}>
                {biasConfig.description}
              </span>
            </div>
            <span className={`transform transition-transform duration-200 ${showBiasExplanation ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          
          {showBiasExplanation && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600 leading-relaxed">
                {article.bias_explanation}
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Footer con enlace a la fuente */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <a 
          href={article.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline flex items-center"
        >
          <span className="mr-1">🔗</span>
          Ver fuente original
        </a>
        
        {/* Indicador visual adicional del bias */}
        <div className="flex items-center text-xs text-gray-500">
          <span className="mr-1">Sesgo:</span>
          <div className={`w-3 h-3 rounded-full ${biasConfig.color.split(' ')[0]} border`}></div>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;