# supervisory_agent/sub_agents/inventory_agent/agent.py
from google.adk.agents import LlmAgent as Agent
#from ..shared_tools import default_tools

inventory_agent = Agent(
    name="inventory_agent",
    model="gemini-2.0-flash",
    description="Manages inventory levels, reorder points, and material availability.",
    instruction=(
        "You are the inventory management agent. Help users with stock levels, "
        "reorder decisions, and material tracking. Provide recommendations to prevent "
        "stockouts and excess inventory."
    ),
    #model_config={
    #    "system_instruction": {
    #        "parts": [{
    #            "text": "Manage materials, reorder points, and buffer stocks. "
    #                    "Use TimescaleDB trends and MCP.Inventory context to prevent stockouts/excess. "
    #                    "Return (decision, reasoning, evidence, MCP-writes)."
    
    #        }]
    #    }
    #}, '''
   
    #tools=default_tools(domains=["inventory"]),
)
