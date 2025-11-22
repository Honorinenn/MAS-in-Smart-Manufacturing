import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader } from 'lucide-react';

/**
 * AgentChat Component
 * 
 * A fully functional chat interface for interacting with factory agents
 * Supports agent selection, message history, and real-time responses
 */

const AgentChat = () => {
  const [selectedAgent, setSelectedAgent] = useState('supervisory');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Agent options
  const agents = [
    { id: 'supervisory', name: 'Supervisory Agent', description: 'Overall system coordination' },
    { id: 'production', name: 'Production Agent', description: 'Production line management' },
    { id: 'inventory', name: 'Inventory Agent', description: 'Stock and materials tracking' },
    { id: 'logistics', name: 'Logistics Agent', description: 'Shipping and receiving' },
    { id: 'maintenance', name: 'Maintenance Agent', description: 'Equipment maintenance' },
    { id: 'quality', name: 'Quality Control Agent', description: 'Product quality assurance' },
  ];

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate agent response (replace with actual API call)
    try {
      // This is a mock response - replace with your actual API integration
      const agentResponse = await mockAgentResponse(selectedAgent, inputMessage);
      
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: agentResponse,
        timestamp: new Date().toLocaleTimeString(),
        agent: selectedAgent,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}`,
        timestamp: new Date().toLocaleTimeString(),
        agent: selectedAgent,
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock agent response (replace with actual LLM API call)
  const mockAgentResponse = async (agentId, message) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const responses = {
      supervisory: `As the Supervisory Agent, I can help coordinate all factory operations. You asked: "${message}". How can I assist you further with system-wide coordination?`,
      production: `Production Agent here. Regarding "${message}" - our current production efficiency is at 87%. I can help optimize schedules and manage production lines.`,
      inventory: `Inventory Agent reporting. About "${message}" - I'm currently monitoring 1,245 items across 12 categories. Current stock levels are healthy with 3 items flagged for reorder.`,
      logistics: `Logistics Agent here. Concerning "${message}" - we have 15 active shipments and 8 pending deliveries. All routes are optimized for efficiency.`,
      maintenance: `Maintenance Agent reporting. Regarding "${message}" - I've detected 3 critical maintenance alerts. Preventive maintenance is scheduled for 5 machines this week.`,
      quality: `Quality Control Agent here. About "${message}" - current defect rate is 2.1%, within acceptable parameters. Last inspection completed 2 hours ago.`,
    };

    return responses[agentId] || `${agentId} agent received your message: "${message}"`;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getAgentInfo = () => {
    return agents.find(a => a.id === selectedAgent);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Agent Selection */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Agent
        </label>
        <select
          value={selectedAgent}
          onChange={(e) => setSelectedAgent(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        >
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">{getAgentInfo()?.description}</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Chat with {getAgentInfo()?.name}
            </h3>
            <p className="text-sm text-gray-500 max-w-xs">
              Ask questions about factory operations, get status updates, or request actions.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex items-start space-x-2 max-w-[80%] ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user'
                        ? 'bg-green-600'
                        : message.isError
                        ? 'bg-red-100'
                        : 'bg-gray-200'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className={`w-5 h-5 ${message.isError ? 'text-red-600' : 'text-gray-600'}`} />
                    )}
                  </div>

                  {/* Message Content */}
                  <div>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-green-600 text-white'
                          : message.isError
                          ? 'bg-red-50 text-red-800 border border-red-200'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 px-1">
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2 max-w-[80%]">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <Loader className="w-4 h-4 animate-spin text-gray-600" />
                      <span className="text-sm text-gray-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default AgentChat;