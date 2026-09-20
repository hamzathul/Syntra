"""Chat routes — thin adapters: call the service, wrap in the V1 envelope."""

from fastapi import APIRouter, Request

from ai.core.envelope import SuccessEnvelope, success_envelope
from ai.modules.chat.schemas import ChatRequest, ChatResponse
from ai.modules.chat.service import handle_chat

router = APIRouter(tags=["chat"])


# exclude_none keeps this consistent with the error path (`exclude_none=True`
# in `error_envelope`): an absent requestId is omitted, never serialized as null.
@router.post(
    "/chat", response_model=SuccessEnvelope[ChatResponse], response_model_exclude_none=True
)
def post_chat(payload: ChatRequest, request: Request) -> SuccessEnvelope[ChatResponse]:
    return success_envelope("Chat reply", handle_chat(payload), request)
