import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader, Trash2 } from 'lucide-react';
import { sendChatMessage, formatConversationHistory } from '../services/chatAPI';
import { getAgentStatus, sendMCPMessage } from '../services/api';

/**
 * AgentChat Component - Hybrid Version
 * 
 * Combines real backend agent data with LLM intelligence
 * 
 * Flow:
 * 1. User asks question
 * 2. Fetch real data from backend agents (if available)
 * 3. Send data + question to LLM
 * 4. LLM provides intelligent explanation
 */

const AgentChatHybrid = () => {
  const [selectedAgent, setSelectedAgent] = useState('supervisory');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Agent configuration
  const agents = [
    { id: 'supervisory', name: 'Supervisory Agent', description: 'Overall system coordination' },
    { id: 'production', name: 'Production Agent', description: 'Production line management' },
    { id: 'inventory', name: 'Inventory Agent', description: 'Stock tracking' },
    { id: 'logistics', name: 'Logistics Agent', description: 'Shipping and receiving' },
    { id: 'maintenance', name: 'Maintenance Agent', description: 'Equipment maintenance' },
    { id: 'quality', name: 'Quality Control Agent', description: 'Quality assurance' },
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getAgentInfo = () => {
    return agents.find(a => a.id === selectedAgent);
  };

  // HYBRID APPROACH: Fetch real data + LLM explanation
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // STEP 1: Try to get real data from backend agent
      let realData = null;
      let dataSource = 'LLM only';

      try {
        // Attempt to fetch real agent data
        realData = await getAgentStatus(selectedAgent);
        dataSource = 'Backend + LLM';
        
        console.log('✅ Real agent data retrieved:', realData);
      } catch (backendError) {
        console.log('⚠️ Backend not available, using LLM only:', backendError.message);
        // Continue without real data - LLM will simulate
      }

      // STEP 2: Build enhanced prompt with real data (if available)
      let enhancedPrompt = inputMessage.trim();
      
      if (realData) {
        enhancedPrompt = `
User Question: ${inputMessage.trim()}

Real-time Agent Data:
${JSON.stringify(realData, null, 2)}

Please answer the user's question using the real data provided above. 
Be specific and reference actual values from the data.
`;
      }

      // STEP 3: Get LLM response
      const conversationHistory = formatConversationHistory(messages);
      const response = await sendChatMessage(
        enhancedPrompt,
        selectedAgent,
        conversationHistory
      );

      // STEP 4: Display response with data source indicator
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toLocaleTimeString(),
        agent: selectedAgent,
        dataSource: dataSource,
        hasRealData: !!realData,
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: getErrorMessage(error),
        timestamp: new Date().toLocaleTimeString(),
        agent: selectedAgent,
        isError: true,
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (error) => {
    if (error.message.includes('API key not configured')) {
      return '⚠️ LLM API key not configured.\n\nPlease add your API key to the .env file:\n\nREACT_APP_LLM_API_KEY=your_api_key_here\n\nThen restart the server.';
    } else if (error.message.includes('timeout')) {
      return '⏱️ Request timeout. Please try again.';
    } else if (error.message.includes('network')) {
      return '🌐 Network error. Please check your connection.';
    } else {
      return `❌ Error: ${error.message}`;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    if (window.confirm('Clear all messages?')) {
      setMessages([]);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-green-50">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-gray-700">
            Select Agent
          </label>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="flex items-center space-x-1 text-xs text-red-600 hover:text-red-700 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>

        <select
          value={selectedAgent}
          onChange={(e) => setSelectedAgent(e.target.value)}
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white shadow-sm"
        >
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name}
            </option>
          ))}
        </select>

        <p className="text-xs text-gray-600 mt-2">
          {getAgentInfo()?.description}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <Bot className="w-16 h-16 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Chat with {getAgentInfo()?.name}
            </h3>
            <p className="text-sm text-gray-600 max-w-xs mb-4">
              Ask questions about factory operations. I'll use real data when available.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
              <p className="font-semibold mb-1">💡 Hybrid Mode:</p>
              <p>• Connects to backend agents when available</p>
              <p>• Falls back to AI simulation if backend offline</p>
              <p>• Provides intelligent explanations of real data</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex items-start space-x-2 max-w-[85%] ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-green-600 to-green-700'
                        : message.isError
                        ? 'bg-red-100'
                        : 'bg-gradient-to-br from-gray-200 to-gray-300'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className={`w-5 h-5 ${message.isError ? 'text-red-600' : 'text-gray-700'}`} />
                    )}
                  </div>

                  <div className="flex-1">
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-green-600 to-green-700 text-white'
                          : message.isError
                          ? 'bg-red-50 text-red-900 border border-red-200'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                      
                      {/* Data source indicator */}
                      {message.hasRealData && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <span className="inline-flex items-center text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                            ✓ Using real backend data
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-1 px-1">
                      {message.timestamp}
                      {message.dataSource && (
                        <span className="ml-2">• {message.dataSource}</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-gray-700" />
                  </div>
                  <div className="bg-white rounded-lg px-4 py-2 border border-gray-200">
                    <div className="flex items-center space-x-2">
                      <Loader className="w-4 h-4 animate-spin text-green-600" />
                      <span className="text-sm text-gray-700">
                        Checking backend and analyzing...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${getAgentInfo()?.name}...`}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:from-gray-300 disabled:to-gray-400"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send • This will use real backend data when available
        </p>
      </div>
    </div>
  );
};

export default AgentChatHybrid;