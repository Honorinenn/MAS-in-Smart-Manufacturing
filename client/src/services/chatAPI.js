/**
 * Smart Factory MAS - Chat API Service
 * Webpack/Create React App Version
 * 
 * Handles LLM chat integration (Claude, GPT, etc.)
 * Environment variables use REACT_APP_ prefix
 */

// ⚠️ WEBPACK/CRA: Use process.env.REACT_APP_* (NOT import.meta.env.VITE_*)
const config = {
  llmApiUrl: process.env.REACT_APP_LLM_API_URL || 'https://api.anthropic.com/v1/messages',
  llmApiKey: process.env.REACT_APP_LLM_API_KEY || '',
  model: process.env.REACT_APP_LLM_MODEL || 'claude-3-5-sonnet-20241022',
  maxTokens: parseInt(process.env.REACT_APP_LLM_MAX_TOKENS) || 4096,
  temperature: parseFloat(process.env.REACT_APP_LLM_TEMPERATURE) || 0.7,
  timeout: 60000, // 60 seconds
};

/**
 * Agent-specific system prompts
 */
const AGENT_PROMPTS = {
  production: `You are the Production Agent in a smart factory multi-agent system. 
Your role is to monitor and optimize production processes, schedule tasks, 
manage production lines, and ensure efficient manufacturing operations.
Provide concise, actionable insights about production status, bottlenecks, and optimization opportunities.`,

  inventory: `You are the Inventory Agent in a smart factory multi-agent system.
Your role is to track inventory levels, predict material needs, manage stock,
trigger reorders, and prevent stockouts or overstocking.
Provide clear insights about inventory status, reorder recommendations, and material availability.`,

  logistics: `You are the Logistics Agent in a smart factory multi-agent system.
Your role is to coordinate shipping, receiving, warehouse operations,
optimize delivery routes, and manage supply chain logistics.
Provide updates on shipment status, delivery schedules, and logistics optimization.`,

  maintenance: `You are the Maintenance Agent in a smart factory multi-agent system.
Your role is to monitor equipment health, predict maintenance needs,
schedule preventive maintenance, and respond to equipment failures.
Provide insights on equipment status, maintenance schedules, and failure predictions.`,

  quality: `You are the Quality Control Agent in a smart factory multi-agent system.
Your role is to monitor product quality, detect defects, analyze quality trends,
ensure compliance with standards, and recommend quality improvements.
Provide reports on quality metrics, defect analysis, and improvement recommendations.`,

  supervisory: `You are the Supervisory Agent in a smart factory multi-agent system.
Your role is to coordinate all other agents, make high-level decisions,
resolve conflicts between agents, and provide overall system oversight.
Provide comprehensive insights about the entire factory system and agent coordination.`,
};

/**
 * Send chat message to LLM
 */
export const sendChatMessage = async (message, agentId = 'supervisory', conversationHistory = []) => {
  if (!config.llmApiKey) {
    throw new Error('LLM API key not configured. Please set REACT_APP_LLM_API_KEY in your .env file.');
  }

  try {
    // Build messages array with system prompt and conversation history
    const messages = [
      {
        role: 'user',
        content: message,
      },
    ];

    // Add conversation history if provided
    if (conversationHistory && conversationHistory.length > 0) {
      messages.unshift(...conversationHistory);
    }

    const requestBody = {
      model: config.model,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      system: AGENT_PROMPTS[agentId] || AGENT_PROMPTS.supervisory,
      messages: messages,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    const response = await fetch(config.llmApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.llmApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `LLM API error (${response.status}): ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();

    // Extract text from Claude API response
    const responseText = data.content?.[0]?.text || data.message || 'No response';

    return {
      success: true,
      message: responseText,
      usage: data.usage,
      model: data.model,
      agentId: agentId,
    };
  } catch (error) {
    console.error('Chat API Error:', error);

    if (error.name === 'AbortError') {
      throw new Error('Request timeout. The LLM took too long to respond.');
    }

    throw new Error(`Failed to get response from ${agentId} agent: ${error.message}`);
  }
};

/**
 * Send streaming chat message (for real-time responses)
 */
export const sendStreamingChatMessage = async (
  message,
  agentId = 'supervisory',
  conversationHistory = [],
  onChunk
) => {
  if (!config.llmApiKey) {
    throw new Error('LLM API key not configured. Please set REACT_APP_LLM_API_KEY in your .env file.');
  }

  try {
    const messages = [
      {
        role: 'user',
        content: message,
      },
    ];

    if (conversationHistory && conversationHistory.length > 0) {
      messages.unshift(...conversationHistory);
    }

    const requestBody = {
      model: config.model,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      system: AGENT_PROMPTS[agentId] || AGENT_PROMPTS.supervisory,
      messages: messages,
      stream: true,
    };

    const response = await fetch(config.llmApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.llmApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `LLM API error (${response.status}): ${errorData.error?.message || response.statusText}`
      );
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullMessage = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));

            if (data.type === 'content_block_delta' && data.delta?.text) {
              const text = data.delta.text;
              fullMessage += text;
              if (onChunk) {
                onChunk(text, false);
              }
            }

            if (data.type === 'message_stop') {
              if (onChunk) {
                onChunk('', true);
              }
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }

    return {
      success: true,
      message: fullMessage,
      agentId: agentId,
    };
  } catch (error) {
    console.error('Streaming Chat API Error:', error);
    throw new Error(`Failed to stream response from ${agentId} agent: ${error.message}`);
  }
};

/**
 * Get agent-specific context
 */
export const getAgentContext = (agentId) => {
  return {
    agentId: agentId,
    systemPrompt: AGENT_PROMPTS[agentId] || AGENT_PROMPTS.supervisory,
    capabilities: getAgentCapabilities(agentId),
  };
};

/**
 * Get agent capabilities
 */
const getAgentCapabilities = (agentId) => {
  const capabilities = {
    production: [
      'Monitor production lines',
      'Optimize schedules',
      'Detect bottlenecks',
      'Track efficiency',
    ],
    inventory: [
      'Track stock levels',
      'Predict material needs',
      'Trigger reorders',
      'Manage warehouse',
    ],
    logistics: [
      'Coordinate shipments',
      'Optimize routes',
      'Track deliveries',
      'Manage supply chain',
    ],
    maintenance: [
      'Monitor equipment',
      'Predict failures',
      'Schedule maintenance',
      'Track repairs',
    ],
    quality: [
      'Inspect products',
      'Detect defects',
      'Analyze trends',
      'Ensure compliance',
    ],
    supervisory: [
      'Coordinate agents',
      'Make decisions',
      'Resolve conflicts',
      'Provide oversight',
    ],
  };

  return capabilities[agentId] || [];
};

/**
 * Format conversation history for LLM
 */
export const formatConversationHistory = (messages) => {
  return messages.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content,
  }));
};

/**
 * Validate API configuration
 */
export const validateConfig = () => {
  const issues = [];

  if (!config.llmApiKey) {
    issues.push('REACT_APP_LLM_API_KEY is not set');
  }

  if (!config.llmApiUrl) {
    issues.push('REACT_APP_LLM_API_URL is not set');
  }

  return {
    valid: issues.length === 0,
    issues: issues,
    config: {
      hasApiKey: !!config.llmApiKey,
      apiUrl: config.llmApiUrl,
      model: config.model,
    },
  };
};

// Export for testing/debugging
export const getConfig = () => ({ ...config });

export default {
  sendChatMessage,
  sendStreamingChatMessage,
  getAgentContext,
  formatConversationHistory,
  validateConfig,
  getConfig,
};