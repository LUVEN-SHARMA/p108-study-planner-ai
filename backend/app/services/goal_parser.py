from typing import Dict, Any
from backend.app.engines.llm_client import llm_client

class GoalParserService:
    """Service for parsing student free-text goal inputs."""

    @classmethod
    def parse_goals(cls, free_text: str) -> Dict[str, Any]:
        if not free_text or not free_text.strip():
            return {"subjects": [], "clarification_needed": "Please enter your study goals."}
        
        return llm_client.parse_goals(free_text)

goal_parser_service = GoalParserService()
