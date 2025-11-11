from google.adk.agents import LlmAgent as Agent
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
    query_timescaledb,
    publish_kafka,
    mcp_call,
)

# Wrap some agents as callable tools
inventory_tool      = AgentTool(inventory_agent)
production_tool     = AgentTool(production_agent)
logistics_tool      = AgentTool(logistics_agent)
maintenance_tool    = AgentTool(maintenance_agent)
quality_control_tool= AgentTool(quality_control_agent)

root_agent = Agent(
    name="supervisory_agent",
    model="gemini-2.0-flash",
    sub_agents=[
        inventory_agent,
        production_agent,
        logistics_agent,
        maintenance_agent,
        quality_control_agent,
    ],
    tools=[
        inventory_tool,
        production_tool,
        logistics_tool,
        maintenance_tool,
        quality_control_tool,
        get_current_time,
        query_timescaledb,
        publish_kafka,
        mcp_call,
    ],
)
