import React from 'react';
import jsPDF from 'jspdf';

const SummaryDisplay = ({ summary, loading, url, urls }) => {
  // Function to generate text-based PDF with formatted text from markdown
  const downloadPDF = () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - (2 * margin);
    let yPosition = margin;

    // Helper function to add text with automatic page breaks
    const addText = (text, fontSize = 12, isBold = false, color = [0, 0, 0]) => {
      pdf.setFontSize(fontSize);
      pdf.setFont("helvetica", isBold ? "bold" : "normal");
      pdf.setTextColor(...color);
      
      const lines = pdf.splitTextToSize(text, maxWidth);
      
      for (const line of lines) {
        if (yPosition + fontSize/2 > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += fontSize * 0.4;
      }
      
      return yPosition;
    };

    // Helper function to add spacing
    const addSpace = (space = 5) => {
      yPosition += space;
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
    };

    // Helper function to process markdown text
    const processMarkdownText = (text) => {
      const lines = text.split('\n');
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        
        if (trimmedLine === '') {
          addSpace(3);
        } else if (trimmedLine.startsWith('####')) {
          // H4 headers
          addSpace(2);
          addText(trimmedLine.substring(4).trim(), 11, true, [75, 85, 99]);
          addSpace(3);
        } else if (trimmedLine.startsWith('###')) {
          // H3 headers
          addSpace(3);
          addText(trimmedLine.substring(3).trim(), 13, true, [55, 65, 81]);
          addSpace(4);
        } else if (trimmedLine.startsWith('##')) {
          // H2 headers
          addSpace(4);
          addText(trimmedLine.substring(2).trim(), 15, true, [31, 41, 55]);
          addSpace(5);
        } else if (trimmedLine.startsWith('#')) {
          // H1 headers
          addSpace(5);
          addText(trimmedLine.substring(1).trim(), 18, true, [30, 64, 175]);
          addSpace(6);
        } else if (trimmedLine.startsWith('*') || trimmedLine.startsWith('-')) {
          // Bullet points
          const bulletText = '• ' + trimmedLine.substring(1).trim();
          addText(bulletText, 11, false, [55, 65, 81]);
          addSpace(2);
        } else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
          // Bold text
          const boldText = trimmedLine.substring(2, trimmedLine.length - 2);
          addText(boldText, 11, true, [55, 65, 81]);
          addSpace(3);
        } else {
          // Regular text
          addText(trimmedLine, 11, false, [55, 65, 81]);
          addSpace(3);
        }
      });
    };

    // Header
    addText('SAIP - Resumen de Contenido', 24, true, [30, 64, 175]);
    addSpace(5);
    addText(`Generado el: ${new Date().toLocaleString('es-ES')}`, 10, false, [107, 114, 128]);
    addSpace(10);

    // Source URLs
    if (url) {
      addText('Fuente:', 12, true, [55, 65, 81]);
      addSpace(2);
      addText(url, 10, false, [59, 130, 246]);
      addSpace(10);
    }

    if (urls && urls.length > 1) {
      addText('Fuentes comparadas:', 12, true, [55, 65, 81]);
      addSpace(3);
      urls.forEach((url, index) => {
        addText(`${index + 1}. ${url}`, 10, false, [59, 130, 246]);
        addSpace(2);
      });
      addSpace(8);
    }

    // Summary content - process markdown and format properly
    addText('RESUMEN', 16, true, [31, 41, 55]);
    addSpace(8);

    // Process the summary text as markdown
    if (summary) {
      processMarkdownText(summary);
    }

    // Footer
    addSpace(10);
    pdf.setDrawColor(229, 231, 235);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    addSpace(5);
    addText('Sistema de Automatización Inteligente Petroil - SAIP v2.1.0', 8, false, [156, 163, 175]);

    // Save the PDF
    const filename = `SAIP_Resumen_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);
  };

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
            {/* Botón de descarga PDF */}
            <div className="mb-4 flex justify-end">
              <button
                onClick={downloadPDF}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Descargar PDF
              </button>
            </div>
            
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