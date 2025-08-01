import React, { useState, useRef, useEffect, useCallback } from 'react';
import useAuthenticatedFetch from './useAuthenticatedFetch';
import { toast } from 'react-toastify';

const DocumentManager = ({ contexts, activeContext, onContextChange, onUpload, onCreateContext, onRemoveDocument }) => {
  const [newContextName, setNewContextName] = useState('');
  const [showNewContext, setShowNewContext] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0 && activeContext) {
      onUpload(activeContext, files);
    }
  };

  const handleCreateContext = (e) => {
    e.preventDefault();
    if (newContextName.trim()) {
      onCreateContext(newContextName.trim());
      setNewContextName('');
      setShowNewContext(false);
    }
  };

  const currentContext = contexts.find(ctx => ctx.id === activeContext);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50">
      {/* Header Section */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Contextos de Documentos</h2>
            <button
              onClick={() => setShowNewContext(!showNewContext)}
              className="px-3 py-1.5 text-xs font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors shadow-sm flex items-center"
            >
              {showNewContext ? (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancelar
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nuevo Contexto
                </>
              )}
            </button>
          </div>

          {/* New Context Form */}
          {showNewContext && (
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <form onSubmit={handleCreateContext} className="space-y-2">
                <div className="flex flex-col space-y-2">
                  <input
                    type="text"
                    value={newContextName}
                    onChange={(e) => setNewContextName(e.target.value)}
                    placeholder="Ingresa un nombre para el nuevo contexto"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="w-full py-2 px-3 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-md transition-colors flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Crear Contexto
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Context Selector */}
          <div className="space-y-1">
            <label htmlFor="context-select" className="block text-xs font-medium text-gray-700">
              Contexto Actual
            </label>
            <select
              id="context-select"
              value={activeContext || ''}
              onChange={(e) => onContextChange(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">Selecciona un contexto</option>
              {contexts.map((context) => (
                <option key={context.id} value={context.id}>
                  {context.name} ({context.files?.length || 0} files)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="h-full bg-white rounded-lg border-2 border-dashed border-gray-300 p-6 text-center flex flex-col items-center justify-center transition-colors hover:border-blue-400">
          <div className="space-y-3 max-w-xs">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="flex text-sm text-gray-600 justify-center">
              <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                <span>Subir archivos</span>
                <input
                  type="file"
                  className="sr-only"
                  multiple
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  disabled={!activeContext}
                />
              </label>
              <p className="pl-1">o arrastra y suelta</p>
            </div>
            <p className="text-xs text-gray-500">
              PDF, DOCX, TXT hasta 10MB
            </p>
          </div>
        </div>
      </div>

      {currentContext && (
        <div className="border-t border-gray-200 p-4">
          <h4 className="text-md font-medium mb-2">Documentos en este contexto</h4>
          <div className="bg-white shadow overflow-hidden rounded-md">
            <ul className="divide-y divide-gray-200">
              {currentContext.files?.length > 0 ? (
                currentContext.files.map((file, idx) => (
                  <li key={idx} className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <span className="px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded">
                        {file.type}
                      </span>
                    </div>
                    <div className="mt-1 flex justify-between text-xs text-gray-500">
                      <span>{Math.round(file.size / 1024)} KB</span>
                      <button 
                        onClick={() => onRemoveDocument(activeContext, file.name)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Eliminar
                      </button>
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-4 py-4 text-center text-gray-500">
                  No hay documentos en este contexto
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

const ChatAgent = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState('chat');
  
  // Chat state
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: 'Hola! Soy M.I.A.! tu asistente virtual de Petroil! Selecciona un contexto para comenzar una conversación :)',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Initialize with empty contexts
  const [contexts, setContexts] = useState([]);
  const [activeContext, setActiveContext] = useState(null);
  const [isLoadingContexts, setIsLoadingContexts] = useState(true);
  const [showDocumentMenu, setShowDocumentMenu] = useState(true);
  const authenticatedFetch = useAuthenticatedFetch();
  const fetchInProgress = useRef(false);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Fetch contexts from the server
  const fetchContexts = useCallback(async (force = false) => {
    // Prevent concurrent fetches
    if (fetchInProgress.current && !force) {
      console.log('Fetch already in progress, skipping...');
      return contexts;
    }
    
    console.log('Fetching contexts...');
    fetchInProgress.current = true;
    
    try {
      setIsLoadingContexts(true);
      const response = await authenticatedFetch('/contexts/');
      const userContexts = await response.json();
      
      const formattedContexts = userContexts.map(context => ({
        id: context.id.toString(),
        name: context.name,
        description: context.description,
        files: [],
        createdAt: context.created_at
      }));

      console.log('Fetched contexts:', formattedContexts);
      
      // Only update if contexts have actually changed
      setContexts(prevContexts => {
        const contextsEqual = JSON.stringify(prevContexts) === JSON.stringify(formattedContexts);
        if (contextsEqual) {
          console.log('Contexts unchanged, skipping update');
          return prevContexts;
        }
        return formattedContexts;
      });
      
      return formattedContexts;
    } catch (error) {
      console.error('Error fetching contexts:', error);
      toast.error('Error al cargar los contextos');
      return contexts; // Return current contexts on error
    } finally {
      setIsLoadingContexts(false);
      fetchInProgress.current = false;
    }
  }, [authenticatedFetch, contexts]);

  // Memoized function to update contexts after creation
  const updateContextsAfterCreation = useCallback(async (name) => {
    console.log('Refreshing contexts after creation...');
    const updatedContexts = await fetchContexts();
    
    if (updatedContexts.length > 0) {
      const newContext = updatedContexts.find(ctx => 
        ctx.name === name && 
        ctx.description.includes('Contexto creado el')
      );
      
      if (newContext) {
        console.log('Activating new context:', newContext.id);
        setActiveContext(newContext.id);
        toast.success(`Contexto "${name}" creado exitosamente`);
        return newContext;
      }
    }
    return null;
  }, [fetchContexts]);
  
  // Handler for creating a new context
  const handleCreateContext = useCallback(async (name) => {
    console.log('Creating new context:', name);
    console.log('Current location:', window.location.pathname);
    console.log('Auth token exists:', !!localStorage.getItem('token'));
    try {
      // Create the new context
      const response = await authenticatedFetch('/contexts/', {
        method: 'POST',
        body: JSON.stringify({
          name: name,
          description: `Contexto creado el ${new Date().toLocaleString()}`
        })
      });
      console.log('Context creation response:', response.status);
      
      console.log('Context created, refreshing list...');
      // Force a refresh of contexts after creation
      const updatedContexts = await fetchContexts(true);
      
      // Find and activate the new context
      if (updatedContexts.length > 0) {
        const newContext = updatedContexts.find(ctx => 
          ctx.name === name && 
          ctx.description.includes('Contexto creado el')
        );
        
        if (newContext) {
          console.log('Activating new context:', newContext.id);
          setActiveContext(newContext.id);
          toast.success(`Contexto "${name}" creado exitosamente`);
          return newContext;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error creating context:', error);
      toast.error(`Error al crear el contexto: ${error.message}`);
      throw error;
    }
  }, [authenticatedFetch]);

  // Initial fetch on component mount only
  useEffect(() => {
    console.log('Component mounted, loading initial contexts');
    
    const loadInitialContexts = async () => {
      try {
        const loadedContexts = await fetchContexts(true); // Force fetch
        if (loadedContexts.length > 0 && !activeContext) {
          console.log('Setting initial active context:', loadedContexts[0].id);
          setActiveContext(loadedContexts[0].id);
        }
      } catch (error) {
        console.error('Error loading initial contexts:', error);
      }
    };
    
    loadInitialContexts();
    
    // No dependencies - this effect only runs once on mount
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);



  // Handler for uploading files to a context
  const handleFileUpload = (contextId, files) => {
    const newFiles = Array.from(files).map(file => ({
      name: file.name,
      type: file.type || file.name.split('.').pop().toUpperCase(),
      size: file.size,
      lastModified: file.lastModified,
      url: URL.createObjectURL(file),
    }));

    setContexts(contexts.map(ctx => 
      ctx.id === contextId 
        ? { ...ctx, files: [...(ctx.files || []), ...newFiles] } 
        : ctx
    ));
  };

  // Handler for removing a document from a context
  const handleRemoveDocument = (contextId, fileName) => {
    setContexts(contexts.map(ctx => 
      ctx.id === contextId 
        ? { 
            ...ctx, 
            files: ctx.files.filter(file => file.name !== fileName) 
          } 
        : ctx
    ));
  };

  // Handle sending a chat message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !activeContext) {
      console.log('Message send blocked:', { inputValue: inputValue.trim(), activeContext });
      return;
    }

    console.log('Sending message from location:', window.location.pathname);
    console.log('Active context:', activeContext);
    console.log('Message content:', inputValue);
    
    const currentContext = contexts.find(ctx => ctx.id === activeContext);
    const userMessage = {
      id: Date.now(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
      context: activeContext,
    };

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Create a bot message with empty content that we'll update as we receive chunks
    const botMessageId = Date.now() + 1;
    const botMessage = {
      id: botMessageId,
      content: '',
      sender: 'bot',
      timestamp: new Date(),
      context: activeContext,
    };
    
    setMessages(prev => [...prev, botMessage]);

    try {
      const response = await authenticatedFetch('/ragagent/chat', {
        method: 'POST',
        body: JSON.stringify({
          query: inputValue,
          // You can add context information here if needed
          // context: currentContext,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botMessageContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.replace('data: ', '').trim();
            if (data === '[DONE]') {
              break;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.error) {
                console.error('Error from server:', parsed.error);
                break;
              }
              
              if (parsed.content) {
                botMessageContent += parsed.content;
                // Update the bot message with the new content
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === botMessageId 
                      ? { ...msg, content: botMessageContent } 
                      : msg
                  )
                );
              }
            } catch (e) {
              console.error('Error parsing server response:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Update the bot message with the error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === botMessageId 
            ? { 
                ...msg, 
                content: 'Lo siento, hubo un error procesando tu solicitud. Por favor intenta de nuevo.' 
              } 
            : msg
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  // Format time helper function
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Filter messages by active context
  const filteredMessages = messages.filter(
    message => !message.context || message.context === activeContext
  );

  // Handle context change
  const handleContextChange = useCallback((newContextId) => {
    setActiveContext(newContextId);
  }, []);

  // Set first context as active when contexts are loaded
  useEffect(() => {
    if (contexts.length > 0 && !activeContext) {
      setActiveContext(contexts[0].id);
    }
  }, [contexts, activeContext]);

  // Render chat interface
  const currentContext = contexts.find(ctx => ctx.id === activeContext);
  
  const renderChatInterface = () => (
    <div className="flex flex-col h-full w-full">
      {/* Context info */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-sm text-gray-600 mr-2">Contexto actual:</span>
          <span className="text-sm font-medium text-gray-900">
            {currentContext?.name || 'Ningún contexto seleccionado'}
          </span>
        </div>
        {currentContext?.files?.length > 0 && (
          <span className="text-xs text-gray-500">
            {currentContext.files.length} documento{currentContext.files.length !== 1 ? 's' : ''} en este contexto
          </span>
        )}
      </div>
      
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {filteredMessages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-3xl w-full ${message.sender === 'user' ? 'justify-end' : ''}`}>
              <div className={`flex ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-4 w-full`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200'}`}>
                  {message.sender === 'user' ? '👤' : (
                    <img 
                      src="/petroil.png" 
                      alt="Petroil Bot" 
                      className="h-6 w-6 rounded-full object-contain"
                    />
                  )}
                </div>
                
                {/* Message content */}
                <div className={`${message.sender === 'user' ? 'max-w-[calc(100%-3rem)]' : 'max-w-[calc(100%-3rem)]'}`}>
                  <div className="flex items-center mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {message.sender === 'user' ? 'Tú' : 'MIA'}
                    </span>
                    <span className="mx-2 text-gray-400">·</span>
                    <span className="text-xs text-gray-500">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  
                  <div className={`text-sm text-gray-800 leading-relaxed ${message.sender === 'user' ? 'bg-blue-50 rounded-lg px-4 py-3' : 'bg-white'}`}>
                    <div className="prose prose-sm max-w-none">
                      {message.content ? (
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      ) : (
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {message.sender === 'bot' && message.context && (
                    <div className="mt-1 text-xs text-gray-500">
                      Contexto: {contexts.find(ctx => ctx.id === message.context)?.name || 'Predeterminado'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {isTyping && !filteredMessages.some(m => m.sender === 'bot' && !m.content) && (
          <div className="flex justify-start">
            <div className="flex max-w-3xl w-full">
              <div className="flex items-start gap-4 w-full">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                  <img 
                    src="/petroil.png" 
                    alt="Petroil Bot" 
                    className="h-6 w-6 rounded-full object-contain"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <span className="text-sm font-medium text-gray-900">MIA</span>
                  </div>
                  <div className="flex space-x-2 py-2">
                    <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 bg-white px-4 py-4 sm:px-6">
        <form 
          onSubmit={handleSendMessage} 
          className="relative rounded-lg border border-gray-300 shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
        >
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Mensaje..."
            rows={1}
            className="block w-full resize-none border-0 bg-transparent py-3 pl-4 pr-12 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <div className="absolute right-0 top-0 flex h-full items-center pr-2">
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-hidden flex relative">
        {/* Sidebar Toggle Button - Positioned on the border */}
        <button
          onClick={() => setShowDocumentMenu(!showDocumentMenu)}
          className={`absolute top-1/2 -translate-y-1/2 z-50 bg-white border border-gray-300 rounded-r-none rounded-l-lg w-6 h-20 flex items-center justify-center shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
            showDocumentMenu ? 'left-[300px]' : 'left-0'
          }`}
          style={{
            borderRight: 'none',
            marginLeft: showDocumentMenu ? '0' : '-1px',
            transform: showDocumentMenu ? 'translateY(-50%)' : 'translateY(-50%) rotate(180deg)'
          }}
          aria-label={showDocumentMenu ? 'Ocultar menú de documentos' : 'Mostrar menú de documentos'}
        >
          ◀
        </button>

        {/* Sidebar */}
        {showDocumentMenu && (
          <div 
            className="w-[300px] transition-all duration-300 ease-in-out overflow-hidden border-r border-gray-200 bg-white relative z-40"
            style={{ 
              transitionProperty: 'min-width',
              transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <div className="w-full h-full overflow-y-auto">
              <DocumentManager
                contexts={contexts}
                activeContext={activeContext}
                onContextChange={handleContextChange}
                onUpload={handleFileUpload}
                onCreateContext={handleCreateContext}
                onRemoveDocument={handleRemoveDocument}
              />
            </div>
          </div>
        )}
        
        {/* Main chat area */}
        <div className="flex-1 flex flex-col overflow-hidden relative z-30">
          {renderChatInterface()}
        </div>
      </div>
    </div>
  );
};

export default ChatAgent;