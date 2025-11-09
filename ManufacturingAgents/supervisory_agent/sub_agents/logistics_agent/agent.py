from google.adk.agents import Agent
from ..shared_tools import default_tools

logistics_agent = Agent(
    name="logistics_agent",
    instructions=(
        "Coordinate inbound/outbound shipments, fleet ETAs, and dock schedules. "
        "Use IoT-Cloud telemetry and MCP.Logistics; replan routes and notify Production/Inventory of impacts."
    ),
    model="gpt-4-turbo",
    tools=default_tools(domains=["logistics"]),
)
