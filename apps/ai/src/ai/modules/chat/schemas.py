"""Chat DTOs — edge models; services trust these inputs."""

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    thread_id: str | None = Field(default=None, max_length=64)


class ChatResponse(BaseModel):
    reply: str
    thread_id: str
    tool_calls: list[str] = Field(default_factory=list)
