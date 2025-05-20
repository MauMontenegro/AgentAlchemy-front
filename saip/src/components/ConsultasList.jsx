import React from 'react';

const ConsultasList = ({ consultas, onConsultaClick }) => {
  return (
    <div className="p-4">
      <h2 className="text-sm font-medium text-gray-500 mb-2">Consultas</h2>
      <ul className="space-y-1">
        {consultas.map((consulta, index) => (
          <li 
            key={index}
            className="px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
            onClick={() => onConsultaClick(consulta)}
          >
            {consulta.nombre}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConsultasList;