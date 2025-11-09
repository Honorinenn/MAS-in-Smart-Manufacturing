# agent.py
from google.adk.agents import Agent
from google.adk.tools.agent_tool import AgentTool

# === Sub-agents (delegation pattern) ===
from .sub_agents.inventory_agent.agent import inventory_agent
from .sub_agents.production_agent.agent import production_agent
from .sub_agents.logistics_agent.agent import logistics_agent
from .sub_agents.maintenance_agent.agent import maintenance_agent
from .sub_agents.quality_control_agent.agent import quality_control_agent

# === Tools (agent-as-a-tool + simple tools) ===
from .tools.tools import (
    get_current_time,
    query_timescaledb,   # read-only analytics
    publish_kafka,       # commands/events
    mcp_call,            # read/write MCP domain context
)

# Wrap some agents as callable tools (Agent-as-a-Tool pattern)
inventory_tool      = AgentTool(inventory_agent)
production_tool     = AgentTool(production_agent)
logistics_tool      = AgentTool(logistics_agent)
maintenance_tool    = AgentTool(maintenance_agent)
quality_control_tool= AgentTool(quality_control_agent)

root_agent = Agent(
    name="supervisory_agent",
    system_prompt=(
        "You are the supervisory root agent for a smart factory. "
        "Coordinate Inventory, Production, Logistics, Maintenance, and Quality agents. "
        "Use two patterns: (1) delegate tasks to sub-agents; (2) call agent-tools synchronously "
        "for targeted data/actions. Maintain throughput, quality, on-time delivery, and safe operations. "
        "Use MCP to read/write domain context. Prefer production-safe actions and provide brief rationales."
    ),
    model="gpt-4-turbo",  # or "claude-3-5-sonnet"
    sub_agents=[
        inventory_agent,
        production_agent,
        logistics_agent,
        maintenance_agent,
        quality_control_agent,
    ],
    tools=[
        # Agent-as-a-Tool: call agents like functions for quick answers
        inventory_tool,
        production_tool,
        logistics_tool,
        maintenance_tool,
        quality_control_tool,
        # Simple tools
        get_current_time,
        query_timescaledb,
        publish_kafka,
        mcp_call,
    ],
)
