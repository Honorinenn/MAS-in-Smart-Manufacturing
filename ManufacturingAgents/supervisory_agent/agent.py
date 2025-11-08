from google.adk.agents import Agent
from google.adk.tools.agent_tool import AgentTool

from .sub_agents.inventory_agent.agent import inventory_agent
from .sub_agents.logistics_agent.agent import logistics_agent
from .sub_agents.production_agent.agent import production_agent
from .sub_agents.maintenance_agent_agent.agent import maintenance_agent
from .sub_agents.quality_control_agent.agent import quality_control_agent

from .tools.tools import get_current_time

root_agent = Agent(
    name="supervisory_agent",
    model="gemini-2.0-flash",
    description="Supervisory agent",
    instruction="""
    You are a manager agent that is responsible for overseeing the work of the other agents.

    Always delegate the task to the appropriate agent. Use your best judgement 
    to determine which agent to delegate to.

    You are responsible for delegating tasks to the following agent:
    - stock_analyst
    - funny_nerd

    You also have access to the following tools:
    - news_analyst
    - get_current_time
    """,
    sub_agents=[stock_analyst, funny_nerd],
    tools=[
        AgentTool(news_analyst),
        get_current_time,
    ],
