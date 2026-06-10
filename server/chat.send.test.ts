import { describe, expect, it, vi, beforeEach } from "vitest";
import type { TrpcContext } from "./_core/context";

// ── Mock invokeLLM before importing the router ────────────────────────────────
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

import { invokeLLM } from "./_core/llm";
import { appRouter } from "./routers";

// ── Helpers ───────────────────────────────────────────────────────────────────

function createContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

const mockInvokeLLM = vi.mocked(invokeLLM);

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("chat.send", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the AI reply when LLM succeeds with string content", async () => {
    mockInvokeLLM.mockResolvedValueOnce({
      choices: [
        {
          message: {
            role: "assistant",
            content: "Your order #NS-1001 is on its way! ETA June 10.",
          },
        },
      ],
    } as Awaited<ReturnType<typeof invokeLLM>>);

    const caller = appRouter.createCaller(createContext());
    const result = await caller.chat.send({
      messages: [{ role: "user", content: "Track order NS-1001" }],
    });

    expect(result.error).toBe(false);
    expect(result.reply).toBe("Your order #NS-1001 is on its way! ETA June 10.");
  });

  it("returns the AI reply when LLM returns array content", async () => {
    mockInvokeLLM.mockResolvedValueOnce({
      choices: [
        {
          message: {
            role: "assistant",
            content: [
              { type: "text", text: "Here are our top tent picks for you!" },
            ],
          },
        },
      ],
    } as Awaited<ReturnType<typeof invokeLLM>>);

    const caller = appRouter.createCaller(createContext());
    const result = await caller.chat.send({
      messages: [{ role: "user", content: "Get gear recommendations" }],
    });

    expect(result.error).toBe(false);
    expect(result.reply).toBe("Here are our top tent picks for you!");
  });

  it("returns a friendly fallback message when LLM throws an error", async () => {
    mockInvokeLLM.mockRejectedValueOnce(new Error("LLM service unavailable"));

    const caller = appRouter.createCaller(createContext());
    const result = await caller.chat.send({
      messages: [{ role: "user", content: "Start a return" }],
    });

    expect(result.error).toBe(true);
    expect(result.reply).toContain("snag on the trail");
  });

  it("returns a fallback when LLM returns null content", async () => {
    mockInvokeLLM.mockResolvedValueOnce({
      choices: [{ message: { role: "assistant", content: null } }],
    } as unknown as Awaited<ReturnType<typeof invokeLLM>>);

    const caller = appRouter.createCaller(createContext());
    const result = await caller.chat.send({
      messages: [{ role: "user", content: "Talk to a live agent" }],
    });

    expect(result.error).toBe(false);
    expect(result.reply).toContain("trouble right now");
  });

  it("includes the full conversation history in the LLM call", async () => {
    mockInvokeLLM.mockResolvedValueOnce({
      choices: [{ message: { role: "assistant", content: "Got it!" } }],
    } as Awaited<ReturnType<typeof invokeLLM>>);

    const caller = appRouter.createCaller(createContext());
    const history = [
      { role: "user" as const, content: "Hello" },
      { role: "assistant" as const, content: "Hi there!" },
      { role: "user" as const, content: "Track order NS-1002" },
    ];

    await caller.chat.send({ messages: history });

    const callArgs = mockInvokeLLM.mock.calls[0]?.[0];
    // First message should be the system prompt
    expect(callArgs?.messages[0]?.role).toBe("system");
    // Remaining messages should match the history
    expect(callArgs?.messages.slice(1)).toEqual(history);
  });
});
