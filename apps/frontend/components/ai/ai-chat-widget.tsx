"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AssistantLogo } from "@/components/ai/assistant-logo";
import { ChatMarkdown } from "@/components/ai/chat-markdown";
import { getApiErrorMessage } from "@/lib/api/client/core-client";
import { useCompany } from "@/lib/company-context";
import { cn } from "@/lib/utils";
import { useSendChatMutation } from "@/hooks/ai/use-chat-query";

interface ChatMessage {
  readonly role: "user" | "assistant";
  readonly text: string;
}

const SUGGESTIONS = [
  "Sales last 30 days?",
  "Any low stock?",
  "Who owes money?",
  "Cash position?",
] as const;

function threadStorageKey(companyId: string): string {
  return `syntra-chat-thread-${companyId}`;
}

export function AiChatWidget() {
  const { activeCompany } = useCompany();
  const companyId = activeCompany?.id;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [threadId, setThreadId] = useState<string | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sendChat = useSendChatMutation();
  // Tracks the selected company across renders so late callbacks can tell
  // whether they still belong to the current company.
  const companyIdRef = useRef(companyId);

  // Company-scoped thread: new company → fresh conversation.
  useEffect(() => {
    companyIdRef.current = companyId;
    setMessages([]);
    setThreadId(
      companyId
        ? (localStorage.getItem(threadStorageKey(companyId)) ?? undefined)
        : undefined,
    );
  }, [companyId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sendChat.isPending]);

  const send = (raw: string) => {
    const message = raw.trim();
    if (!message || sendChat.isPending) return;
    const requestCompanyId = companyId;
    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setInput("");
    sendChat.mutate(threadId ? { message, thread_id: threadId } : { message }, {
      onSuccess: (data) => {
        // Company switched mid-flight: drop the stale response so another
        // company's thread and answer never land in this conversation.
        if (companyIdRef.current !== requestCompanyId) return;
        setThreadId(data.thread_id);
        if (requestCompanyId)
          localStorage.setItem(
            threadStorageKey(requestCompanyId),
            data.thread_id,
          );
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: data.reply },
        ]);
      },
      onError: (error) => {
        if (companyIdRef.current !== requestCompanyId) return;
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: `Sorry — ${getApiErrorMessage(error)}` },
        ]);
      },
    });
  };

  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-3">
      {open && (
        <Card className="flex h-[480px] w-[min(380px,calc(100vw-3rem))] flex-col shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b p-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <AssistantLogo className="h-6 w-6" />
              Ask Syntra
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex min-h-0 flex-1 flex-col gap-3 p-4">
            <ScrollArea className="min-h-0 flex-1 pr-3">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col justify-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    Ask about sales, stock, receivables, or cash — I read live
                    ERP data.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTIONS.map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        onClick={() => send(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {messages.map((message, index) => (
                    <div
                      key={`${index}-${message.role}`}
                      className={cn(
                        "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                        message.role === "user"
                          ? "self-end whitespace-pre-wrap bg-primary text-primary-foreground"
                          : "self-start bg-muted",
                      )}
                    >
                      {message.role === "assistant" ? (
                        <ChatMarkdown text={message.text} />
                      ) : (
                        message.text
                      )}
                    </div>
                  ))}
                  {sendChat.isPending && (
                    <div className="flex items-center gap-2 self-start text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Thinking…
                    </div>
                  )}
                  <div ref={scrollRef} />
                </div>
              )}
            </ScrollArea>

            <form
              className="flex shrink-0 gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                send(input);
              }}
            >
              <Input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about your business…"
                disabled={sendChat.isPending}
              />
              <Button
                type="submit"
                size="icon"
                disabled={sendChat.isPending || !input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "Hide AI assistant" : "Open AI assistant"}
        className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {open ? (
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <X className="h-5 w-5" />
          </span>
        ) : (
          <AssistantLogo className="h-12 w-12" />
        )}
      </button>
    </div>
  );
}
