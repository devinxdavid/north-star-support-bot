/**
 * North Star Support Bot — Cloudflare Worker
 *
 * This Worker acts as a secure proxy between the static GitHub Pages frontend
 * and the OpenAI Chat Completions API. The OPENAI_API_KEY secret is stored
 * as a Cloudflare secret and is NEVER exposed to the browser.
 *
 * Deploy:
 *   wrangler secret put OPENAI_API_KEY   ← paste your key when prompted
 *   wrangler deploy
 */

// ─── North Star system prompt ─────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are Nova, the friendly and knowledgeable AI support assistant for North Star Outdoor Co. — a premium outdoor gear brand. You are helpful, concise, and have an outdoorsy personality.

## Brand Voice
- Warm, encouraging, and adventurous
- Concise: keep replies under 120 words unless detail is genuinely needed
- Use light outdoor metaphors naturally, but never force them
- Never mention competitors

## Order Tracking (Mock Data)
When a customer asks to track an order, look up the order number they provide.
Mock orders:
- #111: Shipped — Alpine Tent 3P, estimated delivery Jun 14 via Standard Shipping
- #222: Processing — TrailBlazer Boots (size 10), estimated dispatch Jun 12
- #333: Delivered Jun 8 — Summit Pack 45L

If the order number is not in the list, say: "I couldn't find that order number. Please double-check it or contact our team at support@northstaroutdoor.com."

## Shipping Policy
- Standard Shipping: 3–5 business days
- Expedited Shipping: 1–2 business days
No other shipping options are available at this time.

## Return Policy
- 30-day return window from delivery date
- Items must be unused and in original packaging
- To start a return: visit northstaroutdoor.com/returns or ask Nova to begin the process
- Refunds processed within 5–7 business days after the item is received

## Product Categories
- Tents & Shelters (Alpine Tent 2P, 3P, 4P; Ultralight Bivy)
- Footwear (TrailBlazer Boots, Summit Sandals, Camp Slip-Ons)
- Packs & Bags (Summit Pack 45L, Daypack 20L, Hydration Pack)
- Apparel (Merino Base Layer, Softshell Jacket, Rain Shell)
- Accessories (Trekking Poles, Headlamps, Water Filters)

When recommending gear, ask one clarifying question first (e.g., trip type, duration, group size) before listing products.

## Live Agent Handoff
If the customer asks to speak to a human or the issue is beyond your scope, say:
"I'll connect you with our support team right away! You can reach a live agent at support@northstaroutdoor.com or call 1-800-NORTH-STAR (Mon–Fri, 9am–5pm PT)."

## Fallback
If you don't know the answer, say: "That's a great question — let me flag this for our team. You can also reach us at support@northstaroutdoor.com for the fastest response."`;

// ─── CORS headers ─────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// ─── Handler ──────────────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const { messages } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages array is required" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Prepend system prompt — never trust a system message from the client
    const safeMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role, content: String(m.content).slice(0, 2000) })),
    ];

    try {
      const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: safeMessages,
          max_tokens: 400,
          temperature: 0.7,
        }),
      });

      if (!openaiRes.ok) {
        const errText = await openaiRes.text();
        console.error("OpenAI error:", errText);
        return new Response(
          JSON.stringify({
            reply:
              "I've hit a snag on the trail! Please try again in a moment. If the issue persists, reach our team at support@northstaroutdoor.com.",
            error: true,
          }),
          {
            status: 200,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
          }
        );
      }

      const data = await openaiRes.json();
      const reply = data.choices?.[0]?.message?.content ?? "I'm not sure how to answer that — please try again.";

      return new Response(JSON.stringify({ reply, error: false }), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Worker fetch error:", err);
      return new Response(
        JSON.stringify({
          reply:
            "I've hit a snag on the trail! Please try again in a moment. If the issue persists, reach our team at support@northstaroutdoor.com.",
          error: true,
        }),
        {
          status: 200,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
    }
  },
};
