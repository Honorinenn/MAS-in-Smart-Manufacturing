from google.adk.agents import LlmAgent as Agent
#from ..shared_tools import default_tools

production_agent = Agent(
    name="production_agent",
    model="gemini-2.0-flash",
    description="Handles production planning, scheduling, and manufacturing execution.",
    instruction=( 
        "You are the production planning agent for a smart factory. "
        "Help users plan production schedules, optimize machine assignments, "
        "and manage manufacturing execution. Provide actionable recommendations "
        "based on current capacity, orders, and constraints. "
        "Do NOT transfer back to the supervisory agent unless the request is completely outside your domain."
    ),
   # model_config={
   #     "system_instruction": {
   #         "parts": [{
   #             "text": "Optimize schedules, cycle times, and changeovers. "
   #                     "Use throughput/cycle_time (TimescaleDB), LSTM forecasts, and MCP.Production to update plans. "
   #                     "Respect shift capacity, quality gates, and WIP limits."
   #         }]
   #     }
   # },
    
   # tools=default_tools(domains=["production"]),'''
)
