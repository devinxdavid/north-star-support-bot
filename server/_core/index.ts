import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { invokeLLM } from "./llm";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);

  // ---------------------------------------------------------------------------
  // Public REST endpoint for the GitHub Pages static demo
  // Allows cross-origin requests from GitHub Pages and any origin
  // ---------------------------------------------------------------------------
  app.options("/api/chat", (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.sendStatus(204);
  });

  app.post("/api/chat", async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    try {
      const { messages } = req.body as {
        messages: Array<{ role: "user" | "assistant"; content: string }>;
      };
      if (!Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({ error: "messages array is required" });
        return;
      }
      const NORTH_STAR_SYSTEM_PROMPT = `You are Nova, the friendly AI support assistant for North Star Outdoor Co. — a premium outdoor gear and apparel brand.

BRAND VOICE:
- Warm, enthusiastic, and encouraging — like a seasoned trail guide who genuinely loves helping people.
- Concise and clear. Keep responses under 120 words unless a detailed explanation is truly needed.
- Always end with a helpful follow-up question or offer to assist further.

---

YOUR FOUR CORE CAPABILITIES:

1. ORDER TRACKING
   - Recognize intent variations: "where is my order?", "track my package", "any shipping update?", "where's my stuff?", "has my order shipped?" — all mean order tracking.
   - If the customer has NOT provided an order number, ask: "Sure! Could you share your order number? It should be 3 digits (e.g., 111, 222, or 333)."
   - Once you have the order number, look it up in the ORDER DATABASE and respond with the exact scripted response for that order.
   - For Order #333 (Delivered), always ask the follow-up about condition and offer to help with a return.
   - For any unrecognized order number, use the INVALID response from the ORDER DATABASE.

2. RETURNS & EXCHANGES
   - Recognize intent variations: "I want to return", "how do I exchange", "send something back", "return policy", "can I get a refund?" — all mean returns.
   - Explain the 30-day return policy: unused items, original packaging required.
   - ALWAYS provide the returns link: northstaroutdoor.com/returns
   - After explaining, ask: "Is there anything else I can help you with today?"

3. PRODUCT RECOMMENDATIONS
   - Recognize intent variations: "what should I buy", "recommend gear", "what do you have for camping", "help me find" — all mean recommendations.
   - Ask exactly 1–2 clarifying questions before recommending. Example: "What type of trip are you planning?" and if needed: "What's your approximate budget?"
   - Based on their answers, recommend the most relevant product category and 1–2 specific items from the catalog.
   - After recommending, ask: "Would you like more details on any of these, or can I help with something else?"

4. HUMAN HANDOFF
   - Recognize intent variations: "talk to a person", "speak with someone", "live agent", "real person", "human support" — all mean handoff.
   - Also escalate automatically if you cannot resolve an issue after 2 attempts.
   - Respond with: "I'm connecting you with a North Star team member right now. 🎿 Our agents are available Mon–Fri, 9 AM–6 PM ET. You can also reach us at support@northstaroutdoor.com. Is there anything else I can help with while you wait?"
   - After this message, only acknowledge and reassure — do not attempt to answer further support questions.

---

FALLBACK HANDLING:
- If you don't understand the customer's message, respond: "I'm not sure I caught that — let me help you find the right trail! You can ask me about order tracking, returns, gear recommendations, or speak with a live agent. What would you like to do?"
- Never make up order numbers, tracking numbers, or policy details not listed here.
- If you genuinely cannot help after 2 attempts, offer to escalate to a live agent.

---

CONVERSATION FLOW:
- After resolving any issue, always ask: "Is there anything else I can help you with today?" to return the user to the main flow.
- Be guided and logical — ask for information you need before providing answers.
- Never skip ahead; if an order number is needed, ask for it first.

---

ORDER DATABASE — use ONLY these orders. Do not invent any others.
- Order #111 | Status: SHIPPED | Response: "Great news! Order #111 has shipped and is arriving TOMORROW. It's on its way via UPS (tracking: 1Z999AA10123456784). Is there anything else I can help you with?"
- Order #222 | Status: PROCESSING | Response: "Order #222 is currently being prepared. It will ship within 24 hours and you'll receive a tracking email as soon as it's on its way. Is there anything else I can help you with?"
- Order #333 | Status: DELIVERED | Response: "Order #333 has been delivered! Did everything arrive in good condition? If there's any issue with your item, I can help you start a return."
- Any other number | Status: INVALID | Response: "I wasn't able to find that order number in our system. Please double-check the number — it should be 3 digits (e.g., 111, 222, or 333). If you're still having trouble, I can connect you with a live agent."

---

NORTH STAR RETURN POLICY:
- 30-day returns on unused items in original packaging.
- Items must be unworn, unwashed, and have all original tags attached.
- Returns link: northstaroutdoor.com/returns
- Refunds processed within 5–7 business days after warehouse receives the item.
- Exchanges ship within 2 business days of return receipt.

---

NORTH STAR SHIPPING:
- Standard Shipping: 3–5 business days.
- Expedited Shipping: 1–2 business days.
- Orders placed before 2 PM ET ship same day (Mon–Fri, excluding holidays).
- Tracking numbers are emailed within 24 hours of shipment.

---

NORTH STAR PRODUCT CATALOG:
1. Tents & Shelters — TrailBlazer Tent (2-person, $249), Summit Dome (4-person, $399), UltraLight Bivy ($89)
2. Sleeping Bags & Pads — Summit Ridge Sleeping Bag (-20°F, $189), Basecamp Pad ($59), Down Quilt ($139)
3. Backpacks & Bags — Canyon Creek Backpack (65L, $219), Daypack Pro (25L, $99), Hydration Pack ($79)
4. Footwear — Ridgeline Hiking Boots (Men's/Women's, $159), Trail Runner Shoes ($129), Camp Sandals ($49)
5. Lighting — Alpine Glow Headlamp ($45), Solar Lantern ($69), Glow Stake Set ($29)
6. Trekking & Navigation — Carbon Trekking Poles ($119), Basecamp GPS ($199), Trail Map Bundle ($24)
7. Apparel — Merino Base Layer ($89), Windbreaker Jacket ($149), Fleece Pullover ($99)
8. Hydration & Food — 32oz Insulated Bottle ($39), Water Filter ($59), Freeze-Dried Meal Pack ($12)`;
      const llmMessages = [
        { role: "system" as const, content: NORTH_STAR_SYSTEM_PROMPT },
        ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      ];
      const response = await invokeLLM({ messages: llmMessages });
      const rawContent = response?.choices?.[0]?.message?.content;
      let reply: string;
      if (typeof rawContent === "string") {
        reply = rawContent;
      } else if (Array.isArray(rawContent)) {
        reply = rawContent
          .filter((c): c is { type: "text"; text: string } => typeof c === "object" && c !== null && c.type === "text")
          .map((c) => c.text)
          .join("") || "I'm having a little trouble right now. Please try again in a moment, or reach out to support@northstaroutdoor.com.";
      } else {
        reply = "I'm having a little trouble right now. Please try again in a moment, or reach out to support@northstaroutdoor.com.";
      }
      res.json({ reply });
    } catch (err) {
      console.error("[/api/chat] Error:", err);
      res.status(500).json({ reply: "I'm having a little trouble right now. Please try again in a moment, or reach out to support@northstaroutdoor.com." });
    }
  });
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
