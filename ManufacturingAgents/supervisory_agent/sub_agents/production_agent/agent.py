from google.adk.agents import Agent

root_agent = Agent(
    name="production_agent",
    # https://ai.google.dev/gemini-api/docs/models
    model="gemini-2.0-flash",
    description="Production agent",
    instruction="""
    You are a helpful assistant that plans production in a manufacturing plant. 
    Ask for the input and return the output.
    """,
)