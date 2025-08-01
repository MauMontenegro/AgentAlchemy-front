import React, { useState, useRef, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useAuthenticatedFetch from './useAuthenticatedFetch';
import DocumentPreview from './DocumentPreview';

// Initial field template
const initialField = {
  name: '',
  type: 'string',
  required: false,
  description: ''
};

// Available field types
const FIELD_TYPES = ['str', 'int', 'float', 'bool', 'date','list','dict'];

const OCRAgentPage = () => {
  const authenticatedFetch = useAuthenticatedFetch();
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filesToProcess, setFilesToProcess] = useState([]);
  const [fields, setFields] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState([]);
  const [extractedData, setExtractedData] = useState([]);
  const [downloadFormat, setDownloadFormat] = useState('json'); // 'json' or 'csv'
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'json'
  const [newField, setNewField] = useState({ ...initialField });
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [schemaName, setSchemaName] = useState('');
  const [schemaDescription, setSchemaDescription] = useState('');
  const [savedSchemas, setSavedSchemas] = useState([]);
  const [showSchemaList, setShowSchemaList] = useState(false);
  const [currentSchemaId, setCurrentSchemaId] = useState(null);
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      const newFiles = [...selectedFiles, ...files];
      setSelectedFiles(newFiles);
      // Auto-select new files for processing
      setFilesToProcess(prev => [...prev, ...files]);
    }
  };

  // Handle field changes for new field form
  const handleNewFieldChange = (field, value) => {
    setNewField(prev => ({ ...prev, [field]: value }));
  };

  // Add new field
  const addField = () => {
    if (newField.name.trim()) {
      setFields([...fields, { ...newField }]);
      setNewField({ ...initialField }); // Reset the form
    }
  };

  // Remove field
  const removeField = (index) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);
  };

  // Remove file
  const removeFile = (index) => {
    const updatedFiles = [...selectedFiles];
    const removedFile = updatedFiles[index];
    updatedFiles.splice(index, 1);
    setSelectedFiles(updatedFiles);
    // Also remove from files to process if it's there
    setFilesToProcess(prev => prev.filter(file => file !== removedFile));
  };

  // Toggle file selection for processing
  const toggleFileSelection = (file, isSelected) => {
    if (isSelected) {
      setFilesToProcess(prev => [...prev, file]);
    } else {
      setFilesToProcess(prev => prev.filter(f => f !== file));
    }
  };

  // Toggle select all files
  const toggleSelectAll = (shouldSelectAll) => {
    if (shouldSelectAll) {
      setFilesToProcess([...selectedFiles]);
    } else {
      setFilesToProcess([]);
    }
  };

  // Build schema object
  const buildSchema = () => {
    const schema = {};
    fields.forEach(field => {
      if (field.name) {
        schema[field.name] = [
          field.type,
          field.required ? 'required' : 'optional',
          field.description || ''
        ];
      }
    });
    return JSON.stringify(schema);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    console.log('Form submit triggered');
    e.preventDefault();
    
    console.log('Selected files:', selectedFiles);
    if (filesToProcess.length === 0) {
      console.log('No files selected for processing, showing error');
      toast.error('Por favor selecciona al menos un archivo para procesar');
      return;
    }

    const schema = buildSchema();
    const schemaObj = JSON.parse(schema);
    console.log('Schema object:', schemaObj);
    
    if (Object.keys(schemaObj).length === 0) {
      console.log('No fields in schema, showing error');
      toast.error('Por favor agrega al menos un campo al esquema');
      return;
    }

    console.log('Setting loading state');
    setIsLoading(true);
    setResult([]); // Initialize as array to store multiple results
    setExtractedData([]);

    try {
      const formData = new FormData();
      
      // Verify we have files to process
      if (!filesToProcess || filesToProcess.length === 0) {
        throw new Error('No hay archivos seleccionados para procesar');
      }
      
      // Append all selected files to form data with the field name 'files' (plural)
      console.log('Appending selected files to form data');
      filesToProcess.forEach((file, index) => {
        if (!file) {
          console.warn(`Skipping null/undefined file at index ${index}`);
          return;
        }
        console.log(`Appending file [${index}]:`, 
          'Name:', file.name, 
          'Type:', file.type, 
          'Size:', file.size, 
          'Is File:', file instanceof File ? 'Yes' : 'No');
          
        formData.append('files', file);
      });
      
      // Verify files were added to form data
      const fileEntries = Array.from(formData.entries())
        .filter(([key]) => key === 'files');
        
      console.log(`Added ${fileEntries.length} files to form data`);
      if (fileEntries.length === 0) {
        throw new Error('No se agregaron archivos válidos al formulario');
      }
      
      // Build the schema object
      console.log('Preparing schema');
      const formattedSchema = {};
      fields.forEach(field => {
        if (field.name && field.name.trim() !== '') {
          formattedSchema[field.name] = [
            field.type || 'str',  // Default to string if type is not specified
            field.required ? 'required' : 'optional',
            field.description || ''
          ];
        }
      });
      
      // Ensure we have at least one field in the schema
      if (Object.keys(formattedSchema).length === 0) {
        throw new Error('El esquema debe contener al menos un campo válido');
      }
      
      const schemaString = JSON.stringify(formattedSchema);
      console.log('Schema string:', schemaString);
      
      // Verify schema is valid JSON
      try {
        JSON.parse(schemaString);
      } catch (e) {
        console.error('Invalid JSON schema:', e);
        throw new Error('Error al crear un esquema JSON válido');
      }
      
      // Add schema to form data
      formData.append('schema', schemaString);
      
      // Log the form data before sending
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const url = '/ocragent/extract';
      console.log('Sending request to:', url);
      
      const response = await authenticatedFetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/x-ndjson',
        },
        body: formData,
      });

      console.log('Response status:', response.status);
      
      // Log response headers
      console.log('Response headers:');
      response.headers.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response text:', errorText);
        
        try {
          // Try to parse the error as JSON
          const errorJson = JSON.parse(errorText);
          throw new Error(`Server error (${response.status}): ${JSON.stringify(errorJson)}`);
        } catch (e) {
          throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        }
      }
      
      if (!response.body) {
        throw new Error('No hay cuerpo de respuesta');
      }

      // Process the streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      const results = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // Decode the chunk and add to buffer
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        
        // Process complete JSON objects in the buffer
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);
          
          if (!line) continue; // Skip empty lines
          
          try {
            const data = JSON.parse(line);
            console.log('Received data chunk:', data);
            
            // Add to results array
            results.push(data);
            
            // Update state with new results
            setResult(prevResults => {
              const newResults = [...prevResults, data];
              return newResults;
            });
            
            // Update extracted data with the full result object
            if (data.structured) {
              setExtractedData(prev => {
                const newData = [...prev, data];
                return newData;
              });
            }
            
            // Show success toast for each processed file
            if (data.file && data.structured) {
              toast.success(`Procesado: ${data.file}`);
            } else if (data.error) {
              toast.error(`Error procesando ${data.file || 'archivo'}: ${data.error}`);
            }
          } catch (e) {
            console.error('Error parsing JSON:', e, 'Raw data:', line);
          }
        }
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error(`Error al procesar documento: ${error.message}`);
    } finally {
      console.log('Cleaning up, setting loading to false');
      setIsLoading(false);
    }
  };

  // Convert data to CSV format
  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';
    
    // Get all unique keys from all objects
    const allKeys = new Set();
    data.forEach(item => {
      if (item.structured) {
        Object.keys(item.structured).forEach(key => allKeys.add(key));
      }
    });
    
    const headers = ['file', ...Array.from(allKeys)];
    
    // Create CSV rows
    const rows = data.map(item => {
      if (!item.structured) return '';
      
      const row = [item.file];
      headers.slice(1).forEach(header => {
        const value = item.structured[header];
        // Convert arrays/objects to string
        const cellValue = Array.isArray(value) || (value && typeof value === 'object')
          ? JSON.stringify(value)
          : value || '';
        // Escape quotes and wrap in quotes if contains comma or newline
        const escaped = String(cellValue).replace(/"/g, '""');
        row.push(`"${escaped}"`);
      });
      return row.join(',');
    });
    
    return [headers.join(','), ...rows].join('\n');
  };

  // Handle download
  const handleDownload = () => {
    if (!result || result.length === 0) {
      toast.error('No hay datos para descargar');
      return;
    }

    let content, mimeType, extension;
    
    if (downloadFormat === 'json') {
      content = JSON.stringify(result, null, 2);
      mimeType = 'application/json';
      extension = 'json';
    } else {
      content = convertToCSV(result);
      mimeType = 'text/csv';
      extension = 'csv';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted_data_${new Date().toISOString().slice(0, 10)}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Load saved schemas
  const loadSavedSchemas = async () => {
    try {
      const response = await authenticatedFetch('/esquemas/');
      if (response.ok) {
        const schemas = await response.json();
        setSavedSchemas(schemas);
      } else {
        console.error('Failed to load schemas, status:', response.status);
        toast.error('Endpoint de esquemas no disponible');
      }
    } catch (error) {
      console.error('Error loading schemas:', error);
      toast.error('Error al cargar esquemas guardados');
    }
  };

  // Load schema into current form
  const loadSchema = (schema) => {
    try {
      const schemaData = JSON.parse(schema.schema_data);
      const loadedFields = Object.entries(schemaData).map(([name, config]) => ({
        name,
        type: config[0],
        required: config[1] === 'required',
        description: config[2] || ''
      }));
      
      setFields(loadedFields);
      setCurrentSchemaId(schema.id);
      setSchemaName(schema.name);
      setSchemaDescription(schema.description || '');
      setShowSchemaList(false);
      toast.success(`Esquema "${schema.name}" cargado exitosamente!`);
    } catch (error) {
      console.error('Error loading schema:', error);
      toast.error('Error al cargar esquema');
    }
  };

  // Delete schema
  const deleteSchema = async (schemaId, schemaName) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el esquema "${schemaName}"?`)) {
      return;
    }

    try {
      const response = await authenticatedFetch(`/esquemas/${schemaId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar esquema');
      }

      toast.success(`Esquema "${schemaName}" eliminado exitosamente!`);
      loadSavedSchemas(); // Refresh the list
    } catch (error) {
      console.error('Error deleting schema:', error);
      toast.error('Error al eliminar esquema');
    }
  };

  // Save schema
  const saveSchema = async () => {
    if (!schemaName.trim()) {
      toast.error('Por favor ingresa un nombre para el esquema');
      return;
    }
    
    if (fields.length === 0) {
      toast.error('Por favor agrega al menos un campo al esquema');
      return;
    }

    try {
      const schemaData = {};
      fields.forEach(field => {
        if (field.name) {
          schemaData[field.name] = [
            field.type,
            field.required ? 'required' : 'optional',
            field.description || ''
          ];
        }
      });

      const payload = {
        name: schemaName,
        description: schemaDescription,
        schema_data: JSON.stringify(schemaData)
      };

      let response;
      if (currentSchemaId) {
        // Update existing schema
        response = await authenticatedFetch(`/esquemas/${currentSchemaId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new schema
        response = await authenticatedFetch('/esquemas/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        throw new Error('Error al guardar esquema');
      }

      toast.success(currentSchemaId ? '¡Esquema actualizado exitosamente!' : '¡Esquema guardado exitosamente!');
      setShowSaveModal(false);
      setSchemaName('');
      setSchemaDescription('');
      setCurrentSchemaId(null);
      loadSavedSchemas(); // Refresh the list
    } catch (error) {
      console.error('Error saving schema:', error);
      toast.error('Error al guardar esquema');
    }
  };

  // Reset form
  const resetForm = () => {
    setSelectedFiles([]);
    setFields([{ ...initialField }]);
    setResult([]);
    setExtractedData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const tabs = [
    {
      id: 'upload',
      name: 'Subir Documento',
      description: 'Subir documentos para procesamiento OCR'
    },
    {
      id: 'history',
      name: 'Historial',
      description: 'Ver documentos procesados anteriormente'
    },
    {
      id: 'settings',
      name: 'Configuración',
      description: 'Configurar opciones de procesamiento OCR'
    }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-4 px-6 py-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 overflow-auto bg-gray-50">
        {activeTab === 'upload' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Procesamiento de Documentos</h2>
                <p className="mt-1 text-sm text-gray-500">Sube documentos y define el esquema de salida</p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left side - File Upload */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Subir Documentos</h3>
                    <FileUploadArea 
                      selectedFiles={selectedFiles}
                      onFileSelect={handleFileSelect}
                      onRemoveFile={removeFile}
                      onToggleFileSelection={toggleFileSelection}
                      filesToProcess={filesToProcess}
                      toggleSelectAll={toggleSelectAll}
                      fileInputRef={fileInputRef}
                    />
                  </div>
                  
                  {/* Right side - Preview */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Vista Previa del Documento</h3>
                    <DocumentPreviewWrapper selectedFiles={selectedFiles} />
                  </div>
                </div>
                
                {/* Output Schema Section */}
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Esquema de Salida</h3>
                  
                  {/* Fields List - Read Only */}
                  {fields.length > 0 && (
                    <div className="mb-6 overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Nombre del Campo</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tipo</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Requerido</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Descripción</th>
                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                              <span className="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {fields.map((field, index) => (
                            <tr key={index}>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                {field.name}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {field.type}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {field.required ? 'Sí' : 'No'}
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-500">
                                {field.description || '-'}
                              </td>
                              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                <button
                                  type="button"
                                  onClick={() => removeField(index)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Eliminar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  
                  {/* Schema Actions */}
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-medium text-gray-700">Campos del Esquema</h4>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          loadSavedSchemas();
                          setShowSchemaList(true);
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cargar Esquema
                      </button>
                      {fields.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowSaveModal(true)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          {currentSchemaId ? 'Actualizar Esquema' : 'Guardar Esquema'}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Add Field Form */}
                  <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Agregar Nuevo Campo</h4>
                    <div className="grid grid-cols-12 gap-4">
                      {/* Labels row */}
                      <div className="col-span-3">
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre del Campo</label>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</label>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Requerido</label>
                      </div>
                      <div className="col-span-3">
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</label>
                      </div>
                      <div className="col-span-2"></div>
                      
                      {/* Inputs row */}
                      <div className="col-span-3">
                        <input
                          type="text"
                          value={newField.name}
                          onChange={(e) => handleNewFieldChange('name', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          placeholder="ej., numero_factura"
                        />
                      </div>
                      <div className="col-span-2">
                        <select
                          value={newField.type}
                          onChange={(e) => handleNewFieldChange('type', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          {FIELD_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2 flex items-start">
                        <div className="mt-2">
                          <input
                            id="new-field-required"
                            type="checkbox"
                            checked={newField.required}
                            onChange={(e) => handleNewFieldChange('required', e.target.checked)}
                            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="col-span-3">
                        <input
                          type="text"
                          value={newField.description}
                          onChange={(e) => handleNewFieldChange('description', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          placeholder="Descripción del campo (opcional)"
                        />
                      </div>
                      <div className="col-span-2 flex items-center h-10">
                        <div className="ml-auto">
                          <button
                            type="button"
                            onClick={addField}
                            disabled={!newField.name.trim()}
                            className="inline-flex justify-center items-center w-8 h-8 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Agregar campo"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                  {/* Download Section - Only show when there are results */}
                  {extractedData.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <select
                        value={downloadFormat}
                        onChange={(e) => setDownloadFormat(e.target.value)}
                        className="block pl-3 pr-8 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="json">JSON</option>
                        <option value="csv">CSV</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleDownload}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <svg className="-ml-0.5 mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Descargar
                      </button>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Reiniciar
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || selectedFiles.length === 0}
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                        isLoading || selectedFiles.length === 0
                          ? 'bg-blue-300 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    >
                      {isLoading ? 'Procesando...' : 'Procesar Documentos'}
                    </button>
                  </div>
                </div>
                
                {/* Results Section */}
                {result && result.length > 0 && (
                  <div className="mt-8 bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Datos Extraídos</h3>
                        <p className="mt-1 text-sm text-gray-500">Datos estructurados extraídos de tu documento</p>
                      </div>
                      <div className="inline-flex rounded-md shadow-sm">
                        <button
                          type="button"
                          onClick={() => setViewMode('table')}
                          className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                            viewMode === 'table'
                              ? 'bg-blue-100 text-blue-700 border border-blue-300'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          Vista de Tabla
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewMode('json')}
                          className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                            viewMode === 'json'
                              ? 'bg-blue-100 text-blue-700 border border-blue-300'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          Vista JSON
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      {viewMode === 'table' ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Archivo
                                </th>
                                {extractedData[0]?.structured && Object.keys(extractedData[0].structured).map((key) => (
                                  <th key={key} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {key}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {extractedData.map((item, idx) => {
                                if (!item.structured) return null;
                                return (
                                  <tr key={idx}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {item.file || `Documento ${idx + 1}`}
                                    </td>
                                    {Object.entries(item.structured).map(([key, value], i) => (
                                      <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {value === null || value === undefined
                                          ? '-'
                                          : Array.isArray(value) || typeof value === 'object'
                                            ? JSON.stringify(value)
                                            : String(value)}
                                      </td>
                                    ))}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 overflow-auto max-h-96">
                          <pre className="text-sm text-gray-800">
                            {JSON.stringify(extractedData, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Historial de Procesamiento</h2>
              <p className="mt-1 text-sm text-gray-500">Ver documentos procesados anteriormente</p>
            </div>
            <div className="p-6">
              <p className="text-gray-500 text-center py-8">No hay historial de procesamiento disponible</p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Configuración OCR</h2>
              <p className="mt-1 text-sm text-gray-500">Configura tus preferencias de procesamiento OCR</p>
            </div>
            <div className="p-6">
              <p className="text-gray-500 text-center py-8">La configuración estará disponible pronto</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Save Schema Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{currentSchemaId ? 'Actualizar Esquema' : 'Guardar Esquema'}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Esquema *
                  </label>
                  <input
                    type="text"
                    value={schemaName}
                    onChange={(e) => setSchemaName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ingresa el nombre del esquema"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={schemaDescription}
                    onChange={(e) => setSchemaDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Ingresa la descripción del esquema (opcional)"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowSaveModal(false);
                    if (!currentSchemaId) {
                      setSchemaName('');
                      setSchemaDescription('');
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={saveSchema}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {currentSchemaId ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Load Schema Modal */}
      {showSchemaList && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-2/3 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Cargar Esquema Guardado</h3>
                <button
                  onClick={() => setShowSchemaList(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {savedSchemas.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No se encontraron esquemas guardados</p>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  <div className="grid gap-3">
                    {savedSchemas.map((schema) => (
                      <div key={schema.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{schema.name}</h4>
                            {schema.description && (
                              <p className="text-sm text-gray-600 mt-1">{schema.description}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              Creado: {new Date(schema.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="ml-4 flex space-x-2">
                            <button
                              onClick={() => loadSchema(schema)}
                              className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                            >
                              Cargar
                            </button>
                            <button
                              onClick={() => deleteSchema(schema.id, schema.name)}
                              className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// FileUploadArea Component
const FileUploadArea = ({ selectedFiles, onFileSelect, onRemoveFile, fileInputRef, onToggleFileSelection, filesToProcess, toggleSelectAll }) => {
  // Check if a file is selected for processing
  const isFileSelected = (file) => {
    return filesToProcess.some(selectedFile => 
      selectedFile.name === file.name && 
      selectedFile.size === file.size &&
      selectedFile.lastModified === file.lastModified
    );
  };
  
  // Check if all files are selected
  const allFilesSelected = selectedFiles.length > 0 && 
    selectedFiles.every(file => isFileSelected(file));
  const [isDragging, setIsDragging] = useState(false);
  const dropAreaRef = useRef(null);

  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if leaving the drop area
    if (e.relatedTarget === null || !dropAreaRef.current.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileSelect({ target: { files } });
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      onFileSelect(e);
    }
  };

  return (
    <div className="space-y-4">
      <div
        ref={dropAreaRef}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept="image/*,.pdf"
          multiple
        />
        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex justify-center text-sm text-gray-600">
            <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
              <span>Subir archivos</span>
            </label>
            <p className="pl-1">o arrastra y suelta</p>
          </div>
          <p className="text-xs text-gray-500">
            Soporta imágenes (JPG, PNG, GIF, etc.) y PDFs hasta 10MB
          </p>
        </div>
      </div>

      {/* Selected files list */}
      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center mb-2">
            <h4 className="text-sm font-medium text-gray-700">Archivos Seleccionados ({selectedFiles.length})</h4>
            {selectedFiles.length > 0 && (
              <label className="flex items-center ml-4 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={allFilesSelected}
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2">Seleccionar Todo</span>
              </label>
            )}
          </div>
          <ul className="border border-gray-200 rounded-md divide-y divide-gray-200 max-h-60 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                <div className="w-0 flex-1 flex items-center">
                  <span className="flex-shrink-0 h-5 w-5 text-gray-400">
                    {file.type.startsWith('image/') ? (
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </span>
                  <div className="flex items-center ml-2 flex-1">
                    <input
                      type="checkbox"
                      checked={isFileSelected(file)}
                      onChange={(e) => onToggleFileSelection(file, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="ml-2 truncate" title={file.name}>
                      {file.name}
                    </span>
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFile(index);
                    }}
                    className="font-medium text-red-600 hover:text-red-500"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Simple DocumentPreview wrapper
const DocumentPreviewWrapper = ({ selectedFiles }) => {
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  if (selectedFiles.length === 0) {
    return <DocumentPreview file={null} />;
  }

  const currentFile = selectedFiles[currentFileIndex];

  return (
    <div className="h-full flex flex-col">
      {/* File selector */}
      {selectedFiles.length > 1 && (
        <div className="mb-4">
          <label htmlFor="file-selector" className="block text-sm font-medium text-gray-700 mb-1">
            Selecciona archivo para previsualizar
          </label>
          <select
            id="file-selector"
            value={currentFileIndex}
            onChange={(e) => setCurrentFileIndex(parseInt(e.target.value))}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            {selectedFiles.map((file, index) => (
              <option key={index} value={index}>
                {file.name}
              </option>
            ))}
          </select>
        </div>
      )}
      
      <DocumentPreview file={currentFile} />
    </div>
  );
};

export default OCRAgentPage;