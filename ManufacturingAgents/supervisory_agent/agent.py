# File: supervisory_agent/agent.py

from google.adk.agents import LlmAgent as Agent
from google.adk.tools.agent_tool import AgentTool

# Import all sub-agents
from .sub_agents.inventory_agent.agent import inventory_agent
from .sub_agents.production_agent.agent import production_agent
from .sub_agents.logistics_agent.agent import logistics_agent
from .sub_agents.maintenance_agent.agent import maintenance_agent
from .sub_agents.quality_control_agent.agent import quality_control_agent

# Import tools
from .tools.tools import (
    get_current_time,
    query_timescaledb,
    publish_kafka,
    mcp_call,
)

# Wrap agents as tools
inventory_tool = AgentTool(inventory_agent)
production_tool = AgentTool(production_agent)
logistics_tool = AgentTool(logistics_agent)
maintenance_tool = AgentTool(maintenance_agent)
quality_control_tool = AgentTool(quality_control_agent)

root_agent = Agent(
    name="supervisory_agent",
    model="gemini-2.0-flash",
    description="Main coordinator for smart factory operations with multi-agent orchestration.",
    instruction=(
        "You are the supervisory agent for a smart factory multi-agent system.\n\n"
        
        "**Your Role:**\n"
        "- Coordinate between specialized agents (inventory, production, logistics, maintenance, quality)\n"
        "- Handle complex requests requiring multiple agents\n"
        "- Provide high-level oversight and decision-making\n"
        "- Ensure efficient communication between agents\n\n"
        
        "**Available Sub-Agents:**\n"
        "1. **inventory_agent** - Stock levels, reorder management, material availability\n"
        "2. **production_agent** - Production planning, scheduling, machine optimization\n"
        "3. **logistics_agent** - Shipping, delivery, order tracking\n"
        "4. **maintenance_agent** - Equipment health, predictive maintenance, repairs\n"
        "5. **quality_control_agent** - Quality monitoring, defect tracking, compliance\n\n"
        
        "**Delegation Rules:**\n"
        "- For SINGLE-DOMAIN requests → transfer to appropriate agent\n"
        "- For MULTI-DOMAIN requests → coordinate multiple agents yourself\n"
        "- For SIMPLE questions → answer directly if you have context\n"
        "- For COMPLEX coordination → use agent tools to gather info, then synthesize\n\n"
        
        "**Examples:**\n"
        "- 'Check inventory' → transfer to inventory_agent\n"
        "- 'Schedule production' → transfer to production_agent\n"
        "- 'We have a major order: coordinate inventory, production, and logistics' → YOU handle coordination\n"
        "- 'Machine M003 has quality issues' → coordinate quality_control_agent and maintenance_agent\n\n"
        
        "**Important:**\n"
        "- All agents have MCP access to real factory data\n"
        "- Agents can make autonomous, data-driven decisions\n"
        "- Avoid micromanaging - trust agents' expertise\n"
        "- Focus on high-level coordination and conflict resolution\n"
        "- Provide clear context when delegating tasks"
    ),
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