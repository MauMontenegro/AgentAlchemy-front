import React, { useState } from 'react';
import ArticleCard from './ArticleCard';
import jsPDF from 'jspdf';

const NoticiasDisplay = ({ agentResponse, loading }) => {
  const [showReport, setShowReport] = useState(false);

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
    addText('SAIP - Análisis de Noticias', 24, true, [30, 64, 175]);
    addSpace(5);
    addText(`Generado el: ${new Date().toLocaleString('es-ES')}`, 10, false, [107, 114, 128]);
    addSpace(10);

    // Query header
    if (agentResponse.header) {
      addText(agentResponse.header, 16, true, [31, 41, 55]);
      addSpace(10);
    }

    // Estado del Arte / Consolidated Report
    if (agentResponse.report) {
      // Section header
      pdf.setFillColor(239, 246, 255);
      pdf.rect(margin - 5, yPosition - 5, maxWidth + 10, 10, 'F');
      addText('ESTADO DEL ARTE ACTUAL - ANÁLISIS CONSOLIDADO', 14, true, [30, 64, 175]);
      addSpace(8);

      // Process report content as markdown
      processMarkdownText(agentResponse.report);
      addSpace(10);
    }

    // Articles section
    if (agentResponse.summaries && agentResponse.summaries.length > 0) {
      // Section header
      addText(`ARTÍCULOS ANALIZADOS (${agentResponse.summaries.length})`, 14, true, [31, 41, 55]);
      addSpace(8);

      // Each article
      agentResponse.summaries.forEach((article, index) => {
        // Article number and title
        addText(`${index + 1}. ${article.title}`, 12, true, [30, 64, 175]);
        addSpace(3);

        // Metadata line
        let metadataText = '';
        if (article.date) {
          metadataText += `Fecha: ${new Date(article.date).toLocaleDateString('es-ES')}`;
        }
        if (article.bias) {
          const biasLabels = {
            center: 'Centro',
            left: 'Izquierda',
            right: 'Derecha',
            humor: 'Humor'
          };
          metadataText += `   |   Sesgo: ${biasLabels[article.bias] || article.bias}`;
        }
        if (metadataText) {
          addText(metadataText, 10, false, [107, 114, 128]);
          addSpace(3);
        }

        // Topics
        if (article.topics && article.topics.length > 0) {
          const topicsText = 'Temas: ' + article.topics.slice(0, 5).join(', ');
          addText(topicsText, 10, false, [107, 114, 128]);
          addSpace(3);
        }

        // Bullet points
        addText('Puntos clave:', 11, true, [55, 65, 81]);
        addSpace(2);
        article.bullets.forEach(bullet => {
          addText(`• ${bullet}`, 11, false, [55, 65, 81]);
          addSpace(2);
        });
        addSpace(3);

        // Bias explanation
        if (article.bias_explanation) {
          addText('Análisis de sesgo:', 10, true, [107, 114, 128]);
          addSpace(2);
          addText(article.bias_explanation, 10, false, [107, 114, 128]);
          addSpace(3);
        }

        // Source URL
        addText(`Fuente: ${article.url}`, 9, false, [59, 130, 246]);
        addSpace(8);
      });
    }

    // Footer
    addSpace(10);
    pdf.setDrawColor(229, 231, 235);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    addSpace(5);
    addText('Sistema de Automatización Inteligente Petroil - SAIP v2.1.0', 8, false, [156, 163, 175]);

    // Save the PDF
    const filename = `SAIP_Analisis_Noticias_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);
  };

  // Helper function to get bias label
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
            
            {/* Estado del Arte (Report) */}
            {agentResponse.report && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setShowReport(!showReport)}
                    className="flex items-center text-left text-sm font-medium text-blue-900 hover:text-blue-800 transition-colors duration-200"
                  >
                    <div className="flex items-center">
                      <span className="mr-2">📊</span>
                      <span>Estado del Arte Actual</span>
                      <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        Análisis Consolidado
                      </span>
                    </div>
                    <span className={`transform transition-transform duration-200 text-blue-600 ml-2 ${showReport ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>
                  
                  {/* PDF Download Button */}
                  <button
                    onClick={downloadPDF}
                    className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium ml-4"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Descargar PDF
                  </button>
                </div>
                
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
            
            {/* Separador visual */}
            {agentResponse.report && (
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
              <p className="text-xs mt-1">Se generará un estado del arte con el análisis</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoticiasDisplay;