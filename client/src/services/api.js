/**
 * Smart Factory MAS - API Service
 * Webpack/Create React App Version
 * 
 * Handles all backend API communication using MCP protocol
 * Environment variables use REACT_APP_ prefix
 */

// ⚠️ WEBPACK/CRA: Use process.env.REACT_APP_* (NOT import.meta.env.VITE_*)
const config = {
  apiBaseUrl: process.env.REACT_APP_API_URL || 'https://hallowed-superstition-49gvj4j54xpc74xq-8000.app.github.dev',
  mcpEndpoint: process.env.REACT_APP_MCP_ENDPOINT || '/api/mcp',
  timeout: 30000, // 30 seconds
};

/**
 * Base fetch wrapper with error handling
 */
const fetchWithTimeout = async (url, options = {}, timeout = config.timeout) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(id);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};

/**
 * MCP Protocol - Send message to agent
 */
export const sendMCPMessage = async (agentId, message, context = {}) => {
  try {
    const url = `${config.apiBaseUrl}${config.mcpEndpoint}`;
    const payload = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'agent.message',
      params: {
        agent_id: agentId,
        message: message,
        context: context,
        timestamp: new Date().toISOString(),
      },
    };

    const response = await fetchWithTimeout(url, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return response.result || response;
  } catch (error) {
    console.error('MCP Message Error:', error);
    throw new Error(`Failed to send message to ${agentId}: ${error.message}`);
  }
};

/**
 * Get agent status
 */
export const getAgentStatus = async (agentId) => {
  try {
    const url = `${config.apiBaseUrl}${config.mcpEndpoint}`;
    const payload = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'agent.status',
      params: {
        agent_id: agentId,
      },
    };

    const response = await fetchWithTimeout(url, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return response.result || response;
  } catch (error) {
    console.error('Get Agent Status Error:', error);
    throw new Error(`Failed to get status for ${agentId}: ${error.message}`);
  }
};

/**
 * Get all agents status
 */
export const getAllAgentsStatus = async () => {
  try {
    const url = `${config.apiBaseUrl}${config.mcpEndpoint}`;
    const payload = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'system.status',
      params: {},
    };

    const response = await fetchWithTimeout(url, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return response.result || response;
  } catch (error) {
    console.error('Get All Agents Status Error:', error);
    throw new Error(`Failed to get system status: ${error.message}`);
  }
};

/**
 * Execute agent action
 */
export const executeAgentAction = async (agentId, action, params = {}) => {
  try {
    const url = `${config.apiBaseUrl}${config.mcpEndpoint}`;
    const payload = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'agent.action',
      params: {
        agent_id: agentId,
        action: action,
        parameters: params,
        timestamp: new Date().toISOString(),
      },
    };

    const response = await fetchWithTimeout(url, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return response.result || response;
  } catch (error) {
    console.error('Execute Agent Action Error:', error);
    throw new Error(`Failed to execute action on ${agentId}: ${error.message}`);
  }
};

/**
 * Get agent metrics
 */
export const getAgentMetrics = async (agentId, timeRange = '1h') => {
  try {
    const url = `${config.apiBaseUrl}${config.mcpEndpoint}`;
    const payload = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'agent.metrics',
      params: {
        agent_id: agentId,
        time_range: timeRange,
      },
    };

    const response = await fetchWithTimeout(url, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return response.result || response;
  } catch (error) {
    console.error('Get Agent Metrics Error:', error);
    throw new Error(`Failed to get metrics for ${agentId}: ${error.message}`);
  }
};

/**
 * Get system alerts
 */
export const getSystemAlerts = async (severity = 'all') => {
  try {
    const url = `${config.apiBaseUrl}${config.mcpEndpoint}`;
    const payload = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'system.alerts',
      params: {
        severity: severity,
      },
    };

    const response = await fetchWithTimeout(url, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return response.result || response;
  } catch (error) {
    console.error('Get System Alerts Error:', error);
    throw new Error(`Failed to get system alerts: ${error.message}`);
  }
};

/**
 * Subscribe to agent updates (WebSocket)
 */
export const subscribeToAgentUpdates = (agentId, callback) => {
  // Use WebSocket URL (replace http with ws)
  // Remove any trailing slash from apiBaseUrl
  const httpBase = config.apiBaseUrl.replace(/\/+$/, "");

  // Convert http → ws and https → wss
  const wsBase = httpBase.replace(/^http/i, "ws");

  // Final WebSocket URL
  const ws = new WebSocket(`${wsBase}/ws/agent/${agentId}`);

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      callback(data);
    } catch (error) {
      console.error('WebSocket message parse error:', error);
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  ws.onclose = () => {
    console.log(`WebSocket connection closed for agent: ${agentId}`);
  };

  return ws;
};

/**
 * Health check
 */
export const healthCheck = async () => {
  try {
    const url = `${config.apiBaseUrl}/health`;
    const response = await fetchWithTimeout(url, { method: 'GET' }, 5000);
    return response;
  } catch (error) {
    console.error('Health Check Error:', error);
    return { status: 'error', message: error.message };
  }
};

// Export config for testing/debugging
export const getConfig = () => ({ ...config });

export default {
  sendMCPMessage,
  getAgentStatus,
  getAllAgentsStatus,
  executeAgentAction,
  getAgentMetrics,
  getSystemAlerts,
  subscribeToAgentUpdates,
  healthCheck,
  getConfig,
};