from google.adk.agents import Agent
from ..shared_tools import default_tools

quality_control_agent = Agent(
    name="quality_control_agent",
    instructions=(
        "Monitor defects, SPC signals, Cp/Cpk, and NCRs. "
        "Query inspection data and parameters; write corrective actions to MCP.Quality. "
        "Propose root-cause hypotheses with evidence."
    ),
    model="gpt-4-turbo",
    tools=default_tools(domains=["quality"]),
)
