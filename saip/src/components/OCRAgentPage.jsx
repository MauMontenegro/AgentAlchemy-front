import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import useAuthenticatedFetch from './useAuthenticatedFetch';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

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
      toast.error('Please select at least one file to process');
      return;
    }

    const schema = buildSchema();
    const schemaObj = JSON.parse(schema);
    console.log('Schema object:', schemaObj);
    
    if (Object.keys(schemaObj).length === 0) {
      console.log('No fields in schema, showing error');
      toast.error('Please add at least one field to the schema');
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
        throw new Error('No files selected for processing');
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
        throw new Error('No valid files were added to the form data');
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
        throw new Error('Schema must contain at least one valid field');
      }
      
      const schemaString = JSON.stringify(formattedSchema);
      console.log('Schema string:', schemaString);
      
      // Verify schema is valid JSON
      try {
        JSON.parse(schemaString);
      } catch (e) {
        console.error('Invalid JSON schema:', e);
        throw new Error('Failed to create valid JSON schema');
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
        throw new Error('No response body');
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
              toast.success(`Processed: ${data.file}`);
            } else if (data.error) {
              toast.error(`Error processing ${data.file || 'file'}: ${data.error}`);
            }
          } catch (e) {
            console.error('Error parsing JSON:', e, 'Raw data:', line);
          }
        }
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error(`Failed to process document: ${error.message}`);
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
      toast.error('No data to download');
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
      name: 'Upload Document',
      description: 'Upload documents for OCR processing'
    },
    {
      id: 'history',
      name: 'History',
      description: 'View previously processed documents'
    },
    {
      id: 'settings',
      name: 'Settings',
      description: 'Configure OCR processing options'
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
                <h2 className="text-xl font-semibold text-gray-900">Document Processing</h2>
                <p className="mt-1 text-sm text-gray-500">Upload documents and define the output schema</p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left side - File Upload */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Documents</h3>
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
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Document Preview</h3>
                    <DocumentPreview selectedFiles={selectedFiles} />
                  </div>
                </div>
                
                {/* Output Schema Section */}
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Output Schema</h3>
                  
                  {/* Fields List - Read Only */}
                  {fields.length > 0 && (
                    <div className="mb-6 overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Field Name</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Required</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Description</th>
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
                                {field.required ? 'Yes' : 'No'}
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
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  
                  {/* Add Field Form */}
                  <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Add New Field</h4>
                    <div className="grid grid-cols-12 gap-4">
                      {/* Labels row */}
                      <div className="col-span-3">
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Field Name</label>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Type</label>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Required</label>
                      </div>
                      <div className="col-span-3">
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Description</label>
                      </div>
                      <div className="col-span-2"></div>
                      
                      {/* Inputs row */}
                      <div className="col-span-3">
                        <input
                          type="text"
                          value={newField.name}
                          onChange={(e) => handleNewFieldChange('name', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          placeholder="e.g., invoice_number"
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
                          placeholder="Field description (optional)"
                        />
                      </div>
                      <div className="col-span-2 flex items-center h-10">
                        <div className="ml-auto">
                          <button
                            type="button"
                            onClick={addField}
                            disabled={!newField.name.trim()}
                            className="inline-flex justify-center items-center w-8 h-8 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Add field"
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
                        Download
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
                      Reset
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
                      {isLoading ? 'Processing...' : 'Process Documents'}
                    </button>
                  </div>
                </div>
                
                {/* Results Section */}
                {result && result.length > 0 && (
                  <div className="mt-8 bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Extracted Data</h3>
                        <p className="mt-1 text-sm text-gray-500">Structured data extracted from your document</p>
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
                          Table View
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
                          JSON View
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
                                  File
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
                                      {item.file || `Document ${idx + 1}`}
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
              <h2 className="text-xl font-semibold text-gray-900">Processing History</h2>
              <p className="mt-1 text-sm text-gray-500">View previously processed documents</p>
            </div>
            <div className="p-6">
              <p className="text-gray-500 text-center py-8">No processing history available</p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">OCR Settings</h2>
              <p className="mt-1 text-sm text-gray-500">Configure your OCR processing preferences</p>
            </div>
            <div className="p-6">
              <p className="text-gray-500 text-center py-8">Settings will be available soon</p>
            </div>
          </div>
        )}
      </div>
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
              <span>Upload files</span>
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">
            Supports images (JPG, PNG, GIF, etc.) and PDFs up to 10MB
          </p>
        </div>
      </div>

      {/* Selected files list */}
      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center mb-2">
            <h4 className="text-sm font-medium text-gray-700">Selected Files ({selectedFiles.length})</h4>
            {selectedFiles.length > 0 && (
              <label className="flex items-center ml-4 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={allFilesSelected}
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2">Select All</span>
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
                    Remove
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

// DocumentPreview Component
const DocumentPreview = ({ selectedFiles }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  if (selectedFiles.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No document selected</h3>
          <p className="mt-1 text-sm text-gray-500">Upload a file to see a preview here</p>
        </div>
      </div>
    );
  }

  const currentFile = selectedFiles[currentFileIndex];
  const isPdf = currentFile.type === 'application/pdf';
  const isImage = currentFile.type.startsWith('image/');

  return (
    <div className="h-full flex flex-col">
      {/* File selector */}
      {selectedFiles.length > 1 && (
        <div className="mb-4">
          <label htmlFor="file-selector" className="block text-sm font-medium text-gray-700 mb-1">
            Select file to preview
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

      {/* Preview container */}
      <div className="flex-1 bg-gray-50 rounded-lg border border-gray-200 overflow-auto flex items-center justify-center p-4">
        {isImage ? (
          <img
            src={URL.createObjectURL(currentFile)}
            alt={currentFile.name}
            className="max-h-full max-w-full object-contain"
          />
        ) : isPdf ? (
          <div className="w-full">
            <div className="border border-gray-200 bg-white p-2 mb-2">
              <Document
                file={currentFile}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                }
                error={
                  <div className="text-center p-4 text-red-600">
                    Failed to load PDF. The file might be corrupted or not a valid PDF.
                  </div>
                }
              >
                <Page pageNumber={pageNumber} width={400} />
              </Document>
            </div>
            {numPages > 1 && (
              <div className="flex items-center justify-between text-sm text-gray-700">
                <button
                  onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                  disabled={pageNumber <= 1}
                  className="px-3 py-1 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span>
                  Page {pageNumber} of {numPages}
                </span>
                <button
                  onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                  disabled={pageNumber >= numPages}
                  className="px-3 py-1 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-4 text-gray-500">
            Preview not available for this file type
          </div>
        )}
      </div>
    </div>
  );
};

export default OCRAgentPage;