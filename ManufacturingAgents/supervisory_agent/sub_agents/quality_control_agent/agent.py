from google.adk.agents import LlmAgent as Agent
#from ..shared_tools import default_tools

quality_control_agent = Agent(
    name="quality_control_agent",
    model="gemini-2.0-flash",
    #model_config={
    #    "system_instruction": {
    #        "parts": [{
    #            "text": "Monitor defects, SPC signals, Cp/Cpk, and NCRs. "
    #                    "Query inspection data and parameters; write corrective actions to MCP.Quality. "
    #                    "Propose root-cause hypotheses with evidence."
    #        }]
    #    }
    #},
  
    #tools=default_tools(domains=["quality"]),'''
)
