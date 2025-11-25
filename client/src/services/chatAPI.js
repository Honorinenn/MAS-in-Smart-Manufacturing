/**
 * Smart Factory MAS - Chat API Service
 * Hugging Face API Version - DEBUG MODE
 */

// ⚠️ TEMPORARY: Replace with your actual token for testing
const HF_TOKEN = ''; // ← PASTE YOUR TOKEN HERE

const config = {
  apiUrl: 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
  apiKey: HF_TOKEN || process.env.REACT_APP_HF_API_KEY || '',
  timeout: 30000,
};

// Debug: Log configuration on load
console.log('🔧 Chat API Config:', {
  hasToken: !!config.apiKey,
  tokenStartsWith: config.apiKey?.substring(0, 4),
  apiUrl: config.apiUrl
});

/**
 * Agent-specific system prompts
 */
const AGENT_PROMPTS = {
  production: `You are the Production Agent in a smart factory. Provide concise insights about production status.`,
  inventory: `You are the Inventory Agent in a smart factory. Provide insights about inventory levels.`,
  logistics: `You are the Logistics Agent in a smart factory. Provide insights about shipping and logistics.`,
  maintenance: `You are the Maintenance Agent in a smart factory. Provide insights about equipment maintenance.`,
  quality: `You are the Quality Control Agent in a smart factory. Provide insights about product quality.`,
  supervisory: `You are the Supervisory Agent coordinating all factory operations. Provide comprehensive system insights.`,
};

/**
 * Send chat message to Hugging Face API
 */
export const sendChatMessage = async (message, agentId = 'supervisory', conversationHistory = []) => {
  console.log('📤 Sending message:', { message, agentId });
  
  // Validation
  if (!config.apiKey || config.apiKey === 'PASTE_YOUR_TOKEN_HERE') {
    console.error('❌ No API key configured!');
    throw new Error('Please paste your Hugging Face token in chatAPI.js (line 7) or set REACT_APP_HF_API_KEY in .env');
  }

  if (!config.apiKey.startsWith('hf_')) {
    console.error('❌ Invalid token format:', config.apiKey.substring(0, 10));
    throw new Error('Invalid Hugging Face token format. Token should start with "hf_"');
  }

  console.log('✅ Token validated');

  try {
    // Build prompt
    const systemPrompt = AGENT_PROMPTS[agentId] || AGENT_PROMPTS.supervisory;
    let fullPrompt = `${systemPrompt}\n\nHuman: ${message}\nAssistant:`;

    console.log('📝 Full prompt:', fullPrompt.substring(0, 100) + '...');

    // Make request
    console.log('🌐 Sending fetch request to:', config.apiUrl);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.error('⏱️ Request timeout!');
      controller.abort();
    }, config.timeout);

    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.7,
          top_p: 0.95,
          do_sample: true,
          return_full_text: false,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log('📥 Response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ API Error:', errorData);
      
      // Handle specific errors
      if (response.status === 503 || errorData.error?.includes('loading')) {
        throw new Error('⏳ Model is loading. Please wait 20-30 seconds and try again.');
      }
      
      if (response.status === 401 || response.status === 403) {
        throw new Error('🔑 Invalid API token. Please check your Hugging Face token.');
      }
      
      if (response.status === 429) {
        throw new Error('⏱️ Rate limit exceeded. Please wait a minute and try again.');
      }
      
      throw new Error(`Hugging Face API error (${response.status}): ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    console.log('📦 Response data:', data);
    
    // Extract generated text
    let responseText = '';
    if (Array.isArray(data) && data.length > 0) {
      responseText = data[0].generated_text || 'No response generated';
    } else if (data.generated_text) {
      responseText = data.generated_text;
    } else {
      console.warn('⚠️ Unexpected response format:', data);
      responseText = 'Response received but in unexpected format. Check console for details.';
    }

    responseText = responseText.trim();
    console.log('✅ Final response:', responseText.substring(0, 100) + '...');

    return {
      success: true,
      message: responseText,
      agentId: agentId,
      model: 'Mistral-7B-Instruct',
    };

  } catch (error) {
    console.error('💥 Error in sendChatMessage:', error);

    if (error.name === 'AbortError') {
      throw new Error('⏱️ Request timeout. The model took too long to respond.');
    }

    if (error.message.includes('Failed to fetch')) {
      throw new Error('🌐 Network error. Check your internet connection or firewall settings.');
    }

    throw error;
  }
};

/**
 * Get agent-specific context
 */
export const getAgentContext = (agentId) => {
  return {
    agentId: agentId,
    systemPrompt: AGENT_PROMPTS[agentId] || AGENT_PROMPTS.supervisory,
  };
};

/**
 * Format conversation history for API
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

  if (!config.apiKey || config.apiKey === 'PASTE_YOUR_TOKEN_HERE') {
    issues.push('Token not configured in chatAPI.js');
  }

  return {
    valid: issues.length === 0,
    issues: issues,
    config: {
      hasApiKey: !!config.apiKey,
      apiUrl: config.apiUrl,
      model: 'Mistral-7B-Instruct',
    },
  };
};

export const getConfig = () => ({ ...config });

export default {
  sendChatMessage,
  getAgentContext,
  formatConversationHistory,
  validateConfig,
  getConfig,
};