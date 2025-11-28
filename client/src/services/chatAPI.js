// src/services/chatAPI.js

import { sendMCPMessage } from "./api";


export const formatConversationHistory = (messages = []) => {
  return messages.map((m) => `[${m.role}] ${m.content}`).join("\n");
};

export const sendChatMessage = async (
  prompt,
  agentId = "supervisory",
  conversationHistory = []
) => {
  const context = {
    conversation: conversationHistory,
  };

  const result = await sendMCPMessage(agentId, prompt, context);

  const responseText =
    result.response ||
    result.message_received ||
    result.note ||
    JSON.stringify(result, null, 2);

  return {
    success: true,
    message: responseText,
    agentId,
    model: "ADK + HuggingFace Backend",
  };
};

export default {
  sendChatMessage,
  formatConversationHistory,
};
