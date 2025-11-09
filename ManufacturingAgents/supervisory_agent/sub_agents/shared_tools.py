# sub_agents/shared_tools.py
from typing import List
from ..tools.tools import get_current_time, query_timescaledb, publish_kafka, mcp_call

def default_tools(domains: List[str]):
    """
    Standard toolset for agents.
    `domains` informs downstream MCP calls for namespacing.
    """
    return [
        get_current_time,
        query_timescaledb,
        publish_kafka,
        mcp_call,  # domain-aware read/write: production|quality|inventory|maintenance|logistics
    ]
