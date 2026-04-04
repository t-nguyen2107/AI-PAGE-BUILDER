import { NextRequest } from "next/server";
import { createModelBundle } from "@/lib/ai/provider";
import { buildWinnieSystemPrompt } from "@/lib/ai/prompts/winnie-system-prompt";
import type { WizardChatMessage, WinnieResponse } from "@/types/wizard";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, userMessage, collectedSoFar } = body as {
      messages?: WizardChatMessage[];
      userMessage?: string;
      collectedSoFar?: Record<string, unknown>;
    };

    if (!userMessage || typeof userMessage !== "string") {
      return Response.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "userMessage is required" } },
        { status: 422 },
      );
    }

    const { model, jsonCallOptions } = createModelBundle();
    const systemPrompt = buildWinnieSystemPrompt(
      collectedSoFar ? { collectedSoFar } : undefined,
    );

    // Build message history (last 10 messages)
    const history = (messages ?? []).slice(-10).map((m) =>
      m.role === "user"
        ? new HumanMessage(m.content)
        : new AIMessage(m.content),
    );

    const langChainMessages = [
      new SystemMessage(systemPrompt),
      ...history,
      new HumanMessage(userMessage),
    ];

    // Create SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: Record<string, unknown>) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        };

        try {
          send({ type: "status", step: "thinking" });

          const response = await model.invoke(langChainMessages, jsonCallOptions);
          const text =
            typeof response.content === "string"
              ? response.content
              : Array.isArray(response.content)
                ? response.content
                    .filter((c): c is { type: string; text: string } => typeof c === "object" && c.type === "text")
                    .map((c) => c.text)
                    .join("")
                : "";

          // Parse JSON response from Winnie
          let parsed: WinnieResponse;
          try {
            // Strip <think/> tags if present
            const cleaned = text.replace(/<think[\s\S]*?<\/think>/g, "").trim();
            parsed = JSON.parse(cleaned) as WinnieResponse;
          } catch {
            // Fallback: treat entire text as reply
            parsed = {
              reply: text.replace(/<think[\s\S]*?<\/think>/g, "").trim(),
              collectedInfo: null,
              isComplete: false,
            };
          }

          // Send reply as chunk for streaming UX
          send({ type: "chunk", content: parsed.reply });
          send({ type: "done", extractedInfo: parsed });
          controller.close();
        } catch (err) {
          send({
            type: "error",
            message: err instanceof Error ? err.message : "Chat error",
          });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("Wizard chat error:", err);
    return Response.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to process chat" } },
      { status: 500 },
    );
  }
}
