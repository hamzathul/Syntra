"use client";

import { createMutationHook } from "@/lib/api/client/hook-factory";
import type { ChatRequestDto } from "@/lib/api/services/ai/ai.service";
import { aiChatService } from "@/lib/api/services/ai/ai.service";
import { aiKeys } from "../query-keys";

export const useSendChatMutation = createMutationHook(
  aiKeys.chat,
  (dto: ChatRequestDto) => aiChatService.send(dto),
);
