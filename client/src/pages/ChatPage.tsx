import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";
import { Send, Loader2, Mountain, User } from "lucide-react";

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
  { label: "Track an order",          icon: "📦" },
  { label: "Start a return",          icon: "↩️" },
  { label: "Get gear recommendations", icon: "🏕️" },
  { label: "Talk to a live agent",    icon: "💬" },
];

// ─── Bot avatar ───────────────────────────────────────────────────────────────

function BotAvatar() {
  return (
    <div
      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
      style={{ background: "var(--pine-700)" }}
      aria-label="Nova, North Star AI assistant"
    >
      <Mountain size={16} color="white" strokeWidth={2.5} />
    </div>
  );
}

function UserAvatar() {
  return (
    <div
      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
      style={{ background: "var(--clay-500)" }}
      aria-label="You"
    >
      <User size={15} color="white" strokeWidth={2.5} />
    </div>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-3">
      <BotAvatar />
      <div
        className="px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1"
        style={{
          background: "var(--bubble-bot-bg)",
          border: "1px solid var(--bubble-bot-border)",
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full inline-block"
            style={{
              background: "var(--pine-400)",
              animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex items-end gap-2 mb-3 flex-row-reverse">
        <UserAvatar />
        <div
          className="max-w-[72%] px-4 py-3 rounded-2xl rounded-br-sm shadow-sm text-sm leading-relaxed"
          style={{
            background: "var(--bubble-user-bg)",
            color: "var(--bubble-user-fg)",
          }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2 mb-3">
      <BotAvatar />
      <div
        className="max-w-[78%] px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm text-sm leading-relaxed"
        style={{
          background: message.isError ? "var(--clay-100)" : "var(--bubble-bot-bg)",
          border: `1px solid ${message.isError ? "var(--clay-300)" : "var(--bubble-bot-border)"}`,
          color: message.isError ? "var(--clay-700)" : "var(--bubble-bot-fg)",
        }}
      >
        <Streamdown>{message.content}</Streamdown>
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

  // Auto-scroll to bottom whenever messages change
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
      // Build history for the API — only role + content, no internal fields
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
      // Refocus input after response
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
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: "var(--sand-100)" }}
    >
      {/* Chat window */}
      <div
        className="w-full max-w-2xl flex flex-col rounded-2xl overflow-hidden shadow-xl"
        style={{ height: "min(680px, 90vh)" }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
          style={{ background: "var(--chat-header-bg)" }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shadow"
            style={{ background: "var(--pine-600)" }}
          >
            <Mountain size={20} color="white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-semibold text-white text-sm leading-tight">Nova</p>
            <p className="text-xs" style={{ color: "var(--pine-100)" }}>
              North Star Support · Usually replies instantly
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: "oklch(72% 0.18 145)" }}
            />
            <span className="text-xs text-white/70">Online</span>
          </div>
        </div>

        {/* ── Messages ── */}
        <div
          className="flex-1 overflow-y-auto px-4 py-4"
          style={{ background: "var(--chat-bg)" }}
        >
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {isLoading && <TypingIndicator />}

          {/* Quick-reply buttons — shown only at start */}
          {showQuickReplies && !isLoading && (
            <div className="flex flex-wrap gap-2 mt-2 mb-1 pl-10">
              {QUICK_REPLIES.map((qr) => (
                <button
                  key={qr.label}
                  onClick={() => sendMessage(qr.label)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 active:scale-95 cursor-pointer"
                  style={{
                    background: "var(--quick-reply-bg)",
                    color: "var(--quick-reply-fg)",
                    border: "1.5px solid var(--quick-reply-border)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "var(--quick-reply-hover-bg)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "var(--quick-reply-bg)";
                  }}
                >
                  <span>{qr.icon}</span>
                  {qr.label}
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── Input bar ── */}
        <div
          className="flex-shrink-0 px-4 py-3 flex items-center gap-3 border-t"
          style={{
            background: "white",
            borderColor: "var(--sand-200)",
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            disabled={isLoading}
            className="flex-1 text-sm px-4 py-2.5 rounded-full outline-none transition-all duration-150"
            style={{
              background: "var(--sand-50)",
              border: "1.5px solid var(--sand-200)",
              color: "var(--pine-900)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--pine-500)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--sand-200)";
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            style={{ background: "var(--pine-700)" }}
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 size={18} color="white" className="animate-spin" />
            ) : (
              <Send size={16} color="white" strokeWidth={2.5} />
            )}
          </button>
        </div>
      </div>

      {/* Branding footer */}
      <p className="mt-4 text-xs" style={{ color: "var(--sand-700)" }}>
        Powered by{" "}
        <span className="font-semibold" style={{ color: "var(--pine-700)" }}>
          North Star Outdoor Co.
        </span>{" "}
        · AI responses may not be 100% accurate
      </p>

      {/* Bounce keyframes */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40%            { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
