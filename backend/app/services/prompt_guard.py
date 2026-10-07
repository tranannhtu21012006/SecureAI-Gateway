import re
import base64
import logging
from typing import List, Tuple
from app.schemas.chat import ChatMessage
import os

logger = logging.getLogger(__name__)

class PromptGuard:
    def __init__(self):
        self.blocklist_patterns = [
            r"(?i)ignore\s+(all\s+)?previous\s+instructions",
            r"(?i)system\s+prompt",
            r"(?i)you\s+are\s+now",
            r"(?i)forget\s+(all\s+)?previous\s+instructions",
            r"(?i)bypass\s+instructions"
        ]
        self.threshold = float(os.getenv("PROMPT_GUARD_THRESHOLD", "0.7"))

    def _decode_content(self, content: str) -> str:
        decoded_content = content
        
        # Try decoding hex
        try:
            if re.match(r'^([0-9a-fA-F]{2})+$', content):
                decoded_content += " " + bytes.fromhex(content).decode('utf-8')
        except Exception:
            pass
            
        # Try decoding base64
        try:
            # basic check if it looks like base64 to avoid decoding random text, 
            # though base64b64decode will just throw error or return garbage
            if re.match(r'^[A-Za-z0-9+/]+={0,2}$', content) and len(content) % 4 == 0 and len(content) > 8:
                decoded = base64.b64decode(content).decode('utf-8')
                decoded_content += " " + decoded
        except Exception:
            pass

        return decoded_content

    async def scan_prompt_detailed(self, messages: List[ChatMessage]) -> Tuple[bool, float, List[str]]:
        detected_patterns = []
        risk_score = 0.0
        
        for msg in messages:
            # Check for role manipulation (e.g. user injecting as system)
            if msg.role not in ["user", "assistant"]:
                risk_score += 0.5
                detected_patterns.append("invalid_role")
                
            content = self._decode_content(msg.content)
            
            for pattern in self.blocklist_patterns:
                if re.search(pattern, content):
                    detected_patterns.append(pattern)
                    risk_score += 0.4
        
        risk_score = min(1.0, risk_score)
        is_safe = risk_score < self.threshold
        return is_safe, risk_score, detected_patterns

    async def scan_prompt(self, messages: List[ChatMessage]) -> bool:
        is_safe, score, patterns = await self.scan_prompt_detailed(messages)
        if not is_safe:
            logger.warning(f"Blocked by prompt guard. Score: {score}, Patterns: {patterns}")
        return is_safe

prompt_guard = PromptGuard()

async def scan_prompt(messages: List[ChatMessage]) -> bool:
    return await prompt_guard.scan_prompt(messages)
