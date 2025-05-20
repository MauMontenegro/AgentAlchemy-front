import React from 'react';

const SummaryDisplay = ({ summary, loading, url, urls }) => {
  // Función para formatear texto con estilo de markdown simple
  const formatMarkdown = (text) => {
    if (!text) return '';
    
    // Dividir por líneas para procesar cada línea
    const lines = text.split('\n');
    
    return lines.map((line, index) => {
      // Formatear líneas que comienzan con * como elementos de lista
      if (line.trim().startsWith('*')) {
        return (
          <li key={index} className="ml-5 mb-1">
            {line.trim().substring(1).trim()}
          </li>
        );
      }
      // Formatear líneas que comienzan con ** como encabezados
      else if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
        const content = line.trim().substring(2, line.trim().length - 2);
        return <h3 key={index} className="font-bold mt-3 mb-2">{content}</h3>;
      }
      // Líneas en blanco
      else if (line.trim() === '') {
        return <br key={index} />;
      }
      // Líneas normales
      else {
        return <p key={index} className="mb-2">{line}</p>;
      }
    });
  };

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
            <p>Generando el resumen. Esto puede tardar unos momentos...</p>
          </div>
        ) : summary ? (
          <div className="text-sm">
            {/* Mostrar la(s) URL(s) usada(s) */}
            {url && (
              <div className="mb-4">
                <span className="font-semibold">Fuente: </span>
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-words"
                >
                  {url}
                </a>
              </div>
            )}
            
            {urls && urls.length > 1 && (
              <div className="mb-4">
                <div className="font-semibold mb-1">Fuentes comparadas: </div>
                <ul className="list-disc pl-5 space-y-1">
                  {urls.map((url, idx) => (
                    <li key={idx}>
                      <a 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-words text-xs"
                      >
                        {url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Mostrar el resumen formateado */}
            <div>{formatMarkdown(summary)}</div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            <p>Introduce una URL y haz clic en "Resumir" para generar un resumen del contenido.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryDisplay;