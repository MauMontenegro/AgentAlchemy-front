import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './AuthContext';
import useAuthenticatedFetch from './useAuthenticatedFetch';

const Financiero = () => {
  const { user } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: 'Hola! Soy tu asistente financiero de Petroil. Puedes preguntarme sobre ventas, compras, cobranza y flujo de efectivo.',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    const botMessageId = Date.now() + 1;
    const botMessage = {
      id: botMessageId,
      content: '',
      sender: 'bot',
      timestamp: new Date(),
      sqlQuery: '',
      rawData: null
    };
    
    setMessages(prev => [...prev, botMessage]);

    try {
      const response = await authenticatedFetch('/finanzas/query', {
        method: 'POST',
        body: JSON.stringify({
          query: inputValue
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botMessageContent = '';
      let sqlQuery = '';
      let rawData = null;

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
              
              if (parsed.content) {
                botMessageContent += parsed.content;
              }
              
              if (parsed.sql_query) {
                sqlQuery = parsed.sql_query;
              }
              
              if (parsed.raw_data) {
                rawData = parsed.raw_data;
              }
              
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === botMessageId 
                    ? { ...msg, content: botMessageContent, sqlQuery, rawData } 
                    : msg
                )
              );
            } catch (e) {
              console.error('Error parsing server response:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === botMessageId 
            ? { 
                ...msg, 
                content: 'Lo siento, hubo un error procesando tu consulta. Intenta de nuevo.' 
              } 
            : msg
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900">Módulo Financiero</h1>
        <p className="text-gray-600">Análisis y consultas sobre Compras, Ventas, Cobranza y flujo de efectivo</p>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-4xl w-full ${message.sender === 'user' ? 'justify-end' : ''}`}>
              <div className={`flex ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-6 w-full`}>
                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-white border-2 border-gray-200 shadow-sm'}`}>
                  {message.sender === 'user' ? '👤' : (
                    <img 
                      src="https://scontent.fntr4-1.fna.fbcdn.net/v/t39.30808-6/396266821_839891844807944_7078854208263319270_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeH3zttMy7Lul7QXuiJZft_lxY8VRZmVXt_FjxVFmZVe328rrxNBrJjTno4vvOeBpHM&_nc_ohc=bgf4_ol864sQ7kNvwGvW0cQ&_nc_oc=Adn1RfJnb66jwGypxuQmDqEus8H4TaZagoSfI-9ijDIChhoq2sEggHxJkeRnGuGJ9w0&_nc_zt=23&_nc_ht=scontent.fntr4-1.fna&_nc_gid=yksT_VKtc-cTTOaGLcFC2g&oh=00_AfSzXzCb_4zcvOh9j__v-AHd_Y4tc1oZpx4g-UhMJFJnHg&oe=6888437D" 
                      alt="MIA Bot" 
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  )}
                </div>
                
                <div className={`${message.sender === 'user' ? 'max-w-[calc(100%-4rem)]' : 'max-w-[calc(100%-4rem)]'}`}>
                  <div className="flex items-center mb-3">
                    <span className="text-sm font-semibold text-gray-900">
                      {message.sender === 'user' ? 'Tú' : 'Agente Financiero'}
                    </span>
                    <span className="mx-3 text-gray-400">·</span>
                    <span className="text-xs text-gray-500">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  
                  <div className={`text-sm text-gray-800 leading-relaxed ${message.sender === 'user' ? 'bg-blue-50 rounded-xl px-5 py-4 border border-blue-100' : 'bg-white rounded-xl px-5 py-4 border border-gray-200 shadow-sm'}`}>
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
                  
                  {/* SQL Query Display */}
                  {message.sqlQuery && (
                    <div className="mt-4 bg-gray-900 text-green-400 p-4 rounded-xl text-xs font-mono border border-gray-700">
                      <div className="text-gray-400 mb-2 font-medium">SQL Query:</div>
                      <pre className="whitespace-pre-wrap">{message.sqlQuery}</pre>
                    </div>
                  )}
                  
                  {/* Raw Data Display */}
                  {message.rawData && (
                    <div className="mt-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <div className="text-gray-600 text-xs mb-3 font-medium">Datos obtenidos:</div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-xs">
                          <thead>
                            <tr className="bg-gray-100">
                              {Object.keys(message.rawData[0] || {}).map(key => (
                                <th key={key} className="px-2 py-1 text-left font-medium text-gray-700">
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {message.rawData.map((row, idx) => (
                              <tr key={idx} className="border-t">
                                {Object.values(row).map((value, i) => (
                                  <td key={i} className="px-2 py-1 text-gray-600">
                                    {typeof value === 'number' ? value.toLocaleString() : value}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} className="h-8" />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white px-8 py-6">
        <form onSubmit={handleSendMessage} className="relative rounded-xl border-2 border-gray-300 shadow-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Pregunta sobre finanzas..."
            rows={1}
            className="block w-full resize-none border-0 bg-transparent py-4 pl-5 pr-16 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <div className="absolute right-0 top-0 flex h-full items-center pr-3">
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Financiero;