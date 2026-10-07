from pydantic import BaseModel
from typing import List, Optional

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    model: str
    messages: List[ChatMessage]
    stream: bool = False
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = None
    provider: Optional[str] = "openai"

class ChatResponseChoice(BaseModel):
    index: int
    message: ChatMessage
    finish_reason: Optional[str]

class ChatUsage(BaseModel):
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int

class ChatResponse(BaseModel):
    id: str
    model: str
    choices: List[ChatResponseChoice]
    usage: Optional[ChatUsage]
