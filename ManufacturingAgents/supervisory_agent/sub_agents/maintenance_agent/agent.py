from google.adk.agents import Agent
from ..shared_tools import default_tools

maintenance_agent = Agent(
    name="maintenance_agent",
    instructions=(
        "Predict failures, schedule preventive/corrective maintenance, and minimize downtime. "
        "Use LSTM predictions, vibration/temperature traces (TimescaleDB), and MCP.Maintenance work orders. "
        "Respect production windows and safety."
    ),
    model="gpt-4-turbo",
    tools=default_tools(domains=["maintenance"]),
)
