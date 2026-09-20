import type { ChatRequestDto, ChatResponseDto } from "shared";
import { aiApi } from "../../client/ai-client";

export const aiChatService = {
  send: (dto: ChatRequestDto): Promise<ChatResponseDto> =>
    aiApi.post<ChatResponseDto>("/chat", dto).then((r) => r.data),
};
