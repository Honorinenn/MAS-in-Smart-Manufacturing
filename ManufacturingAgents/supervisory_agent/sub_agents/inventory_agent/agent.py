# supervisory_agent/sub_agents/inventory_agent/agent.py
from google.adk.agents import Agent
from ..shared_tools import default_tools

inventory_agent = Agent(
    name="inventory_agent",
    instructions=(
        "Manage materials, reorder points, and buffer stocks. "
        "Use TimescaleDB trends and MCP.Inventory context to prevent stockouts/excess. "
        "Return (decision, reasoning, evidence, MCP-writes)."
    ),
    model="gpt-4-turbo",
    tools=default_tools(domains=["inventory"]),
)
