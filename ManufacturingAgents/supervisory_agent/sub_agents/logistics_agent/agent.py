from google.adk.agents import LlmAgent as Agent
#from ..shared_tools import default_tools

logistics_agent = Agent(
    name="logistics_agent",
    model="gemini-2.0-flash",
    description="Handles shipping, delivery scheduling, and supply chain coordination.",
    instruction=(
        "You are the logistics coordination agent. Help users with delivery schedules, "
        "shipping optimization, and supply chain management."
    ),
   # model_config={
   #     "system_instruction": {
   #         "parts": [{
   #             "text": "Coordinate inbound/outbound shipments, fleet ETAs, and dock schedules. "
   #                     "Use IoT-Cloud telemetry and MCP.Logistics; replan routes and notify Production/Inventory of impacts."
   #         }]
   #     }
   # },
   # 
   #  tools=default_tools(domains=["logistics"]),'''
)
