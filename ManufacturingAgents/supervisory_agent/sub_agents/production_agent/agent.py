from google.adk.agents import Agent
from ..shared_tools import default_tools

production_agent = Agent(
    name="production_agent",
    instructions=(
        "Optimize schedules, cycle times, and changeovers. "
        "Use throughput/cycle_time (TimescaleDB), LSTM forecasts, and MCP.Production to update plans. "
        "Respect shift capacity, quality gates, and WIP limits."
    ),
    model="gpt-4-turbo",
    tools=default_tools(domains=["production"]),
)
