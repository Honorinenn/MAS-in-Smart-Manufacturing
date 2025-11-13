from google.adk.agents import LlmAgent as Agent
#from ..shared_tools import default_tools

maintenance_agent = Agent(
    name="maintenance_agent",
    model="gemini-2.0-flash",
    description="Manages equipment maintenance, repairs, and downtime prevention.",
    instruction=(
        "You are the maintenance management agent. Help users with equipment maintenance "
        "schedules, repair coordination, and predictive maintenance recommendations."
    ),
    #model_config={
    #    "system_instruction": {
    #        "parts": [{
    #            "text": "Predict failures, schedule preventive/corrective maintenance, and minimize downtime. "
    #                    "Use LSTM predictions, vibration/temperature traces (TimescaleDB), and MCP.Maintenance work orders. "
    #                    "Respect production windows and safety."
    #        }]
    #    }
    #},
    
    #tools=default_tools(domains=["maintenance"]),'''
)
