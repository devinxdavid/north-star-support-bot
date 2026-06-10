import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";
import { Send, Loader2, Mountain } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Role = "user" | "assistant";

interface Message {
  id: string;
  role: Role;
  content: string;
  isError?: boolean;
}

// ─── Quick-reply definitions (exact labels required) ─────────────────────────

const QUICK_REPLIES = [
  "Track an order",
  "Start a return",
  "Get gear recommendations",
  "Talk to a live agent",
];

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="message-row bot">
      <div className="message-bubble" style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 52 }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--pine-500)",
              animation: `ns-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main ChatPage ────────────────────────────────────────────────────────────

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hey there, adventurer! 👋 I'm **Nova**, your North Star support guide. Whether you need to track an order, start a return, find the perfect gear, or talk to our team — I'm here to help. What can I do for you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sendMutation = trpc.chat.send.useMutation();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setShowQuickReplies(false);
    setInput("");

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const history = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const result = await sendMutation.mutateAsync({ messages: history });

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: typeof result.reply === "string" ? result.reply : String(result.reply),
        isError: result.error,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch {
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content:
          "Oops — it looks like I've hit a snag on the trail! Please try again in a moment. If the issue persists, our team is available at support@northstaroutdoor.com.",
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      <style>{`
        /* ── Page shell ── */
        .ns-page {
          margin: 0;
          min-height: 100vh;
          font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: #1f2a2a;
          background:
            radial-gradient(circle at top left, rgba(184,199,162,0.5), transparent 30%),
            linear-gradient(135deg, #0f241f 0%, #21483d 46%, #d8c29e 100%);
        }
        .ns-shell {
          width: min(1180px, calc(100% - 32px));
          min-height: 100vh;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 28px;
          align-items: center;
          padding: 32px 0;
        }

        /* ── Hero panel ── */
        .ns-hero {
          color: #f7f1e7;
          padding: 36px;
        }
        .ns-eyebrow {
          margin: 0 0 14px;
          color: #b8c7a2;
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .ns-hero h1 {
          margin: 0;
          font-size: clamp(2.4rem, 6vw, 5rem);
          line-height: 0.95;
          letter-spacing: -0.055em;
        }
        .ns-hero-copy {
          max-width: 620px;
          margin: 24px 0 0;
          color: rgba(247,241,231,0.88);
          font-size: 1.08rem;
          line-height: 1.65;
        }
        .ns-policy-card {
          margin-top: 34px;
          padding: 22px;
          border: 1px solid rgba(247,241,231,0.2);
          border-radius: 20px;
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(12px);
        }
        .ns-policy-card h2 {
          margin: 0 0 8px;
          font-size: 1rem;
        }
        .ns-policy-card p {
          margin: 0;
          color: rgba(247,241,231,0.82);
          line-height: 1.55;
        }
        .ns-feature-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin: 24px 0 0;
          padding: 0;
          list-style: none;
        }
        .ns-feature-list li {
          padding: 10px 13px;
          border-radius: 999px;
          background: rgba(247,241,231,0.13);
          color: #f7f1e7;
          font-size: 0.88rem;
          font-weight: 700;
        }

        /* ── Chat card ── */
        .ns-chat-card {
          height: min(760px, calc(100vh - 48px));
          min-height: 620px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.5);
          border-radius: 28px;
          background: rgba(255,255,255,0.92);
          box-shadow: 0 24px 70px rgba(14,31,27,0.24);
        }
        .ns-chat-header {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 22px;
          background: linear-gradient(135deg, #f7f1e7, #e9f2f4);
          border-bottom: 1px solid rgba(22,53,45,0.1);
          flex-shrink: 0;
        }
        .ns-bot-avatar {
          width: 54px;
          height: 54px;
          display: grid;
          place-items: center;
          flex: 0 0 auto;
          border-radius: 18px;
          background: linear-gradient(135deg, #16352d, #2f6f5e);
          color: #f7f1e7;
          font-weight: 900;
          font-size: 1rem;
          box-shadow: 0 12px 28px rgba(47,111,94,0.28);
        }
        .ns-chat-header h2 {
          margin: 0;
          font-size: 1.05rem;
          color: #1f2a2a;
        }
        .ns-chat-header p {
          margin: 4px 0 0;
          color: #66716e;
          font-size: 0.9rem;
        }

        /* ── Messages ── */
        .ns-messages {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 14px;
          overflow-y: auto;
          padding: 24px;
          background:
            linear-gradient(rgba(247,241,231,0.72), rgba(247,241,231,0.72)),
            repeating-linear-gradient(135deg, rgba(47,111,94,0.04) 0 2px, transparent 2px 18px);
        }
        .message-row {
          display: flex;
        }
        .message-row.user {
          justify-content: flex-end;
        }
        .message-bubble {
          width: fit-content;
          max-width: min(78%, 560px);
          padding: 14px 16px;
          border-radius: 18px;
          line-height: 1.48;
          white-space: pre-line;
          font-size: 0.95rem;
        }
        .message-row.bot .message-bubble {
          border-bottom-left-radius: 6px;
          background: #ffffff;
          color: #1f2a2a;
          box-shadow: 0 10px 30px rgba(15,36,31,0.08);
        }
        .message-row.user .message-bubble {
          border-bottom-right-radius: 6px;
          background: #21483d;
          color: #f7f1e7;
        }
        .message-bubble.error {
          background: #fdf0ea;
          border: 1px solid #e8b89a;
          color: #8b3a1a;
        }

        /* ── Quick replies ── */
        .ns-quick-options {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          padding: 16px 20px 4px;
          background: rgba(255,255,255,0.92);
          flex-shrink: 0;
        }
        .ns-quick-options button {
          border: 1px solid rgba(47,111,94,0.22);
          border-radius: 999px;
          padding: 10px 12px;
          background: #f7f1e7;
          color: #16352d;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 700;
          font-family: inherit;
          transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
        }
        .ns-quick-options button:hover,
        .ns-quick-options button:focus-visible {
          transform: translateY(-1px);
          border-color: #2f6f5e;
          background: #e9f2f4;
          outline: none;
        }

        /* ── Input form ── */
        .ns-chat-form {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 10px;
          padding: 18px 20px 20px;
          background: rgba(255,255,255,0.92);
          flex-shrink: 0;
        }
        .ns-chat-form input {
          width: 100%;
          min-height: 50px;
          border: 1px solid rgba(22,53,45,0.16);
          border-radius: 14px;
          padding: 0 15px;
          background: #ffffff;
          color: #1f2a2a;
          outline: none;
          font-family: inherit;
          font-size: 0.95rem;
          transition: border-color 150ms, box-shadow 150ms;
        }
        .ns-chat-form input:focus {
          border-color: #2f6f5e;
          box-shadow: 0 0 0 4px rgba(47,111,94,0.12);
        }
        .ns-chat-form input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .ns-send-btn {
          min-height: 50px;
          border: 0;
          border-radius: 14px;
          padding: 0 20px;
          background: #b66d42;
          color: #ffffff;
          cursor: pointer;
          font-weight: 800;
          font-family: inherit;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: transform 160ms ease, filter 160ms ease;
        }
        .ns-send-btn:hover:not(:disabled),
        .ns-send-btn:focus-visible:not(:disabled) {
          transform: translateY(-1px);
          filter: brightness(0.96);
          outline: none;
        }
        .ns-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .ns-shell {
            grid-template-columns: 1fr;
            align-items: start;
          }
          .ns-hero {
            padding: 24px 8px 0;
          }
          .ns-chat-card {
            height: 720px;
            min-height: 580px;
          }
        }
        @media (max-width: 560px) {
          .ns-shell {
            width: min(100% - 18px, 1180px);
            padding: 10px 0;
          }
          .ns-hero h1 {
            font-size: 2.35rem;
          }
          .ns-hero-copy,
          .ns-policy-card,
          .ns-feature-list {
            display: none;
          }
          .ns-chat-card {
            height: calc(100vh - 190px);
            min-height: 560px;
            border-radius: 22px;
          }
          .ns-chat-header,
          .ns-messages {
            padding: 18px;
          }
          .message-bubble {
            max-width: 88%;
          }
          .ns-quick-options {
            padding: 12px 16px 2px;
          }
          .ns-chat-form {
            grid-template-columns: 1fr;
            padding: 14px 16px 16px;
          }
        }

        /* ── Bounce animation ── */
        @keyframes ns-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40%            { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>

      <div className="ns-page">
        <div className="ns-shell">
          {/* ── Hero panel ── */}
          <section className="ns-hero" aria-label="North Star Support Bot">
            <p className="ns-eyebrow">AI-powered support</p>
            <h1>North Star Support Bot</h1>
            <p className="ns-hero-copy">
              Meet Nova — your AI-powered support guide for North Star Outdoor Co. Track orders, start returns, discover gear, or reach a live agent. All in one conversation.
            </p>
            <div className="ns-policy-card" aria-label="About this bot">
              <h2>Powered by OpenAI</h2>
              <p>
                Nova uses a secure server-side AI layer. Your API key is never exposed to the browser — all intelligence runs on the backend.
              </p>
            </div>
            <ul className="ns-feature-list" aria-label="Supported support options">
              <li>Order tracking</li>
              <li>Returns &amp; exchanges</li>
              <li>Gear recommendations</li>
              <li>Live agent handoff</li>
              <li>Shipping info</li>
            </ul>
          </section>

          {/* ── Chat card ── */}
          <section className="ns-chat-card" aria-label="Chat with Nova">
            {/* Header */}
            <header className="ns-chat-header">
              <div className="ns-bot-avatar" aria-hidden="true">
                <Mountain size={26} strokeWidth={2.5} />
              </div>
              <div>
                <h2>Nova · North Star Support</h2>
                <p>Friendly, helpful, outdoorsy, concise</p>
              </div>
            </header>

            {/* Messages */}
            <div className="ns-messages" aria-live="polite">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message-row ${msg.role === "user" ? "user" : "bot"}`}
                >
                  <div className={`message-bubble${msg.isError ? " error" : ""}`}>
                    {msg.role === "assistant" ? (
                      <Streamdown>{msg.content}</Streamdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}

              {isLoading && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>

            {/* Quick replies */}
            {showQuickReplies && !isLoading && (
              <div className="ns-quick-options" aria-label="Quick support options">
                {QUICK_REPLIES.map((label) => (
                  <button key={label} onClick={() => sendMessage(label)}>
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* Input form */}
            <form
              className="ns-chat-form"
              onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
              autoComplete="off"
            >
              <label className="sr-only" htmlFor="ns-user-input">Type your message</label>
              <input
                id="ns-user-input"
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about an order, return, gear, or live support..."
                disabled={isLoading}
                aria-label="Type your message"
              />
              <button
                type="submit"
                className="ns-send-btn"
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={16} strokeWidth={2.5} />
                )}
                Send
              </button>
            </form>
          </section>
        </div>
      </div>
    </>
  );
}
