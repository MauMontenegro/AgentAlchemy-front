import React, { useState } from 'react';
import ArticleCard from './ArticleCard';

const NoticiasDisplay = ({ agentResponse, loading, mode }) => {
  const [showReport, setShowReport] = useState(false);

  return (
    <div className="border border-gray-300 rounded-md h-96">
      <div className="h-full overflow-y-auto p-4">
        {loading ? (
          // Estado de carga
          <div className="h-full flex items-center justify-center text-gray-400">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p>Buscando noticias...</p>
          </div>
        ) : agentResponse ? (
          <div className="space-y-6">
            {/* Encabezado de la respuesta */}
            <div className="font-medium text-lg border-b pb-2 border-gray-200">
              {agentResponse.header}
            </div>
            
            {/* Estado del Arte (Report) - Solo mostrar en modo avanzado */}
            {mode === 'advanced' && agentResponse.report && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <button
                  onClick={() => setShowReport(!showReport)}
                  className="flex items-center justify-between w-full text-left text-sm font-medium text-blue-900 hover:text-blue-800 transition-colors duration-200"
                >
                  <div className="flex items-center">
                    <span className="mr-2">📊</span>
                    <span>Estado del Arte Actual</span>
                    <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      Análisis Consolidado
                    </span>
                  </div>
                  <span className={`transform transition-transform duration-200 text-blue-600 ${showReport ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                
                {showReport && (
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <div className="bg-white p-4 rounded-md border border-blue-100">
                      <div className="text-sm text-gray-800 leading-relaxed">
                        <div className="prose prose-sm max-w-none">
                          {/* Formatear el report con saltos de línea */}
                          {agentResponse.report.split('\n').map((paragraph, index) => (
                            paragraph.trim() ? (
                              <p key={index} className="mb-3 last:mb-0">
                                {paragraph.trim()}
                              </p>
                            ) : (
                              <br key={index} />
                            )
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Metadata del análisis */}
                    <div className="mt-3 flex items-center justify-between text-xs text-blue-600">
                      <span className="flex items-center">
                        <span className="mr-1">🔍</span>
                        Basado en {agentResponse.summaries?.length || 0} artículo(s) analizado(s)
                      </span>
                      <span className="flex items-center">
                        <span className="mr-1">⏱️</span>
                        {new Date().toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Separador visual - Solo mostrar si hay report en modo avanzado */}
            {mode === 'advanced' && agentResponse.report && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-medium text-gray-900 flex items-center mb-4">
                  <span className="mr-2">📰</span>
                  <span>Artículos Analizados</span>
                  <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                    {agentResponse.summaries?.length || 0}
                  </span>
                </h3>
              </div>
            )}
            
            {/* Indicador de modo simple */}
            {mode === 'simple' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center text-sm text-amber-800">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Modo Simple</span>
                  <span className="ml-2 text-amber-600">• Solo resúmenes individuales</span>
                </div>
              </div>
            )}
            
            {/* Lista de artículos */}
            <div className="space-y-4">
              {agentResponse.summaries.map((article, index) => (
                <ArticleCard key={index} article={article} />
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">🔍</div>
              <p>Escribe tu consulta para ver noticias relevantes</p>
              <p className="text-xs mt-1">
                {mode === 'advanced' 
                  ? 'Se generará un estado del arte con el análisis'
                  : 'Se mostrarán resúmenes individuales de los artículos'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoticiasDisplay;