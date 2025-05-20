import React from 'react';

const ArticleCard = ({ article }) => {
  return (
    <div className="p-4 border border-gray-200 rounded-md bg-white shadow-sm">
      {/* Título del artículo con enlace */}
      <h3 className="font-medium text-blue-600 hover:underline">
        <a href={article.url} target="_blank" rel="noopener noreferrer">
          {article.title}
        </a>
      </h3>
      
      {/* Bullets de resumen */}
      <ul className="mt-2 list-disc list-inside space-y-1">
        {article.bullets.map((bullet, idx) => (
          <li key={idx} className="text-sm text-gray-600">
            {bullet}
          </li>
        ))}
      </ul>
      
      {/* Enlace a la fuente */}
      <div className="mt-3 text-xs text-gray-500">
        <a 
          href={article.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:underline"
        >
          Ver fuente original
        </a>
      </div>
    </div>
  );
};

export default ArticleCard;