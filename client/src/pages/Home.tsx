import { Mountain, ArrowRight, Package, RotateCcw, Compass, HeadphonesIcon } from "lucide-react";
import { Link } from "wouter";

const features = [
  {
    icon: Package,
    title: "Track Your Order",
    desc: "Get real-time status updates and tracking info for any North Star order.",
  },
  {
    icon: RotateCcw,
    title: "Start a Return",
    desc: "Hassle-free 60-day returns. Nova walks you through every step.",
  },
  {
    icon: Compass,
    title: "Gear Recommendations",
    desc: "Tell us your adventure and we'll match you with the perfect kit.",
  },
  {
    icon: HeadphonesIcon,
    title: "Live Agent Handoff",
    desc: "Need a human? Nova connects you instantly with our support team.",
  },
];

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--sand-50)" }}
    >
      {/* ── Nav ── */}
      <header
        className="px-6 py-4 flex items-center gap-3 shadow-sm"
        style={{ background: "var(--pine-800)" }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "var(--pine-600)" }}
        >
          <Mountain size={18} color="white" strokeWidth={2.5} />
        </div>
        <span className="font-bold text-white text-lg tracking-tight">
          North Star Outdoor Co.
        </span>
        <div className="ml-auto">
          <Link href="/chat">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150 active:scale-95 cursor-pointer"
              style={{
                background: "var(--clay-500)",
                color: "white",
              }}
            >
              Open Support Chat
              <ArrowRight size={15} />
            </button>
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="flex flex-col items-center text-center px-6 pt-16 pb-12">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-md"
          style={{ background: "var(--pine-700)" }}
        >
          <Mountain size={32} color="white" strokeWidth={2} />
        </div>
        <h1
          className="text-4xl font-extrabold leading-tight mb-4 max-w-xl"
          style={{ color: "var(--pine-900)" }}
        >
          Your Trail Guide for Support
        </h1>
        <p
          className="text-lg max-w-md mb-8 leading-relaxed"
          style={{ color: "var(--sand-700)" }}
        >
          Meet <strong style={{ color: "var(--pine-700)" }}>Nova</strong> — North
          Star's AI support assistant. Track orders, start returns, discover gear,
          or reach a live agent. All in one conversation.
        </p>
        <Link href="/chat">
          <button
            className="flex items-center gap-2 px-7 py-3.5 rounded-full text-base font-semibold shadow-md transition-all duration-150 active:scale-95 cursor-pointer"
            style={{
              background: "var(--pine-700)",
              color: "white",
            }}
          >
            Chat with Nova
            <ArrowRight size={18} />
          </button>
        </Link>
      </section>

      {/* ── Feature grid ── */}
      <section className="px-6 pb-16 max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl p-5 shadow-sm"
              style={{
                background: "white",
                border: "1px solid var(--sand-200)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: "var(--pine-50)" }}
              >
                <Icon size={20} style={{ color: "var(--pine-700)" }} strokeWidth={2} />
              </div>
              <h3
                className="font-semibold text-base mb-1"
                style={{ color: "var(--pine-900)" }}
              >
                {title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--sand-700)" }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="mt-auto py-5 text-center text-xs"
        style={{ color: "var(--sand-700)", borderTop: "1px solid var(--sand-200)" }}
      >
        © 2026 North Star Outdoor Co. · AI-powered support by Nova
      </footer>
    </div>
  );
}
