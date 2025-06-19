import React, { useState } from 'react';
import ArticleCard from './ArticleCard';
import jsPDF from 'jspdf';

const NoticiasDisplay = ({ agentResponse, loading }) => {
  const [showReport, setShowReport] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  
  // Toggle report visibility with loading animation
  const toggleReport = () => {
    if (!showReport) {
      setReportLoading(true);
      // Simulate loading for better UX
      setTimeout(() => {
        setShowReport(true);
        setReportLoading(false);
      }, 300);
    } else {
      setShowReport(false);
    }
  };

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
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center mb-3 sm:mb-0">
                    <div className="bg-blue-600 rounded-full p-2 mr-3 shadow-sm">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-blue-900 text-lg">Estado del Arte</h3>
                      <p className="text-xs text-blue-700">Análisis consolidado de la información</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={toggleReport}
                      disabled={reportLoading}
                      className="flex items-center px-3 py-1.5 bg-white border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 transition-colors duration-200 text-sm font-medium"
                    >
                      {showReport ? (
                        <>
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                          </svg>
                          Ocultar
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                          Mostrar
                        </>
                      )}
                    </button>
                    
                    {/* PDF Download Button */}
                    <button
                      onClick={downloadPDF}
                      className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      Descargar PDF
                    </button>
                  </div>
                </div>
                
                {reportLoading && (
                  <div className="mt-3 bg-white p-6 rounded-md border border-blue-100 flex flex-col items-center justify-center">
                    <div className="animate-pulse flex space-x-4 w-full">
                      <div className="flex-1 space-y-4 py-1">
                        <div className="h-4 bg-blue-100 rounded w-3/4"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-blue-50 rounded"></div>
                          <div className="h-4 bg-blue-50 rounded w-5/6"></div>
                          <div className="h-4 bg-blue-50 rounded w-4/6"></div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-blue-600 flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Cargando análisis...
                    </div>
                  </div>
                )}
                
                {!showReport && !reportLoading && (
                  <div className="mt-3 bg-white p-3 rounded-md border border-blue-100 flex items-center justify-between">
                    <div className="flex items-center text-sm text-blue-700">
                      <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Haga clic en "Mostrar" para ver el análisis completo
                    </div>
                    <div className="text-xs text-blue-600">
                      {agentResponse.summaries?.length || 0} artículos analizados
                    </div>
                  </div>
                )}
                
                {showReport && (
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <div className="bg-white p-4 rounded-md border border-blue-100 shadow-sm">
                      <div className="text-sm text-gray-800 leading-relaxed">
                        <div className="prose prose-sm max-w-none">
                          {/* Procesamiento mejorado del contenido markdown */}
                          {agentResponse.report.split('\n').map((paragraph, index) => {
                            // Detectar encabezados
                            if (paragraph.trim().startsWith('# ')) {
                              return (
                                <h2 key={index} className="text-xl font-bold text-blue-800 mb-3 pb-1 border-b border-blue-100">
                                  {paragraph.trim().substring(2)}
                                </h2>
                              );
                            } else if (paragraph.trim().startsWith('## ')) {
                              return (
                                <h3 key={index} className="text-lg font-semibold text-blue-700 mb-2 mt-4">
                                  {paragraph.trim().substring(3)}
                                </h3>
                              );
                            } else if (paragraph.trim().startsWith('### ')) {
                              return (
                                <h4 key={index} className="text-base font-medium text-blue-600 mb-2 mt-3">
                                  {paragraph.trim().substring(4)}
                                </h4>
                              );
                            } 
                            // Detectar listas
                            else if (paragraph.trim().startsWith('- ') || paragraph.trim().startsWith('* ')) {
                              return (
                                <div key={index} className="flex mb-2 pl-2">
                                  <span className="text-blue-500 mr-2">•</span>
                                  <span>{paragraph.trim().substring(2)}</span>
                                </div>
                              );
                            }
                            // Detectar texto en negrita
                            else if (paragraph.trim().match(/\*\*(.*?)\*\*/)) {
                              const parts = paragraph.trim().split(/(\*\*.*?\*\*)/g);
                              return (
                                <p key={index} className="mb-3 last:mb-0">
                                  {parts.map((part, i) => {
                                    if (part.startsWith('**') && part.endsWith('**')) {
                                      return <strong key={i} className="font-medium text-blue-900">{part.substring(2, part.length - 2)}</strong>;
                                    }
                                    return <span key={i}>{part}</span>;
                                  })}
                                </p>
                              );
                            }
                            // Párrafos normales o líneas en blanco
                            else {
                              return paragraph.trim() ? (
                                <p key={index} className="mb-3 last:mb-0">
                                  {paragraph.trim()}
                                </p>
                              ) : (
                                <br key={index} />
                              );
                            }
                          })}
                        </div>
                      </div>
                      
                      {/* Indicadores visuales y estadísticas */}
                      <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 p-3 rounded-md flex items-center">
                          <div className="bg-blue-100 p-2 rounded-full mr-3">
                            <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                          </div>
                          <div>
                            <div className="text-xs text-blue-600 font-medium">Artículos analizados</div>
                            <div className="text-lg font-semibold text-blue-900">{agentResponse.summaries?.length || 0}</div>
                          </div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-md flex items-center">
                          <div className="bg-blue-100 p-2 rounded-full mr-3">
                            <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                          </div>
                          <div>
                            <div className="text-xs text-blue-600 font-medium">Generado el</div>
                            <div className="text-sm font-medium text-blue-900">{new Date().toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Acciones adicionales */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-xs text-blue-600 flex items-center">
                        <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Análisis basado en información pública disponible
                      </div>
                      <button className="text-xs flex items-center text-blue-700 hover:text-blue-800 font-medium">
                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        Actualizar análisis
                      </button>
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