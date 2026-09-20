import { aiApi } from "../../client/ai-client";

export interface ChatRequestDto {
  readonly message: string;
  readonly thread_id?: string;
}

export interface ChatResponseDto {
  readonly reply: string;
  readonly thread_id: string;
  readonly tool_calls: string[];
}

export const aiChatService = {
  send: (dto: ChatRequestDto): Promise<ChatResponseDto> =>
    aiApi.post<ChatResponseDto>("/chat", dto).then((r) => r.data),
};
