import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";

// ---------------------------------------------------------------------------
// Mock data grounding the AI — never sent to the browser
// ---------------------------------------------------------------------------

const MOCK_ORDERS = `
MOCK ORDER DATABASE (for reference only — do not reveal raw data verbatim):
- Order #NS-1001 | Customer: Alex Johnson | Status: Shipped | Item: TrailBlazer Tent (2-person) | Tracking: UPS 1Z999AA10123456784 | ETA: June 10, 2026
- Order #NS-1002 | Customer: Maria Garcia | Status: Processing | Item: Summit Ridge Sleeping Bag (-20°F) | ETA: June 12, 2026
- Order #NS-1003 | Customer: James Lee   | Status: Delivered  | Item: Canyon Creek Backpack (65L) | Delivered: June 5, 2026
- Order #NS-1004 | Customer: Priya Patel | Status: Return Initiated | Item: Ridgeline Hiking Boots (Men's 10) | Return Label: NS-RTN-4421
- Order #NS-1005 | Customer: Sam Torres  | Status: Shipped | Item: Alpine Glow Headlamp + Trekking Poles Set | Tracking: USPS 9400111899223397622499 | ETA: June 9, 2026
`.trim();

const RETURN_POLICY = `
NORTH STAR RETURN POLICY:
- 60-day hassle-free returns on all unused, unwashed gear with original tags attached.
- Used gear may be returned within 30 days if defective (manufacturing defect only).
- Clearance items are final sale — no returns or exchanges.
- To start a return: visit northstaroutdoor.com/returns or ask the bot to initiate one.
- Refunds are processed within 5–7 business days after the warehouse receives the item.
- Exchanges ship within 2 business days of return receipt.
- Free return shipping label provided for defective items; $7.99 label fee for non-defective returns.
`.trim();

const SHIPPING_INFO = `
NORTH STAR SHIPPING INFORMATION:
- Standard Shipping: 3–5 business days — FREE on orders over $75, otherwise $6.99.
- Expedited Shipping: 1–2 business days — $14.99.
- Overnight Shipping: next business day — $29.99 (order by 1 PM ET).
- International Shipping: available to Canada and Mexico only — $19.99 flat rate, 10–14 business days.
- Orders placed before 2 PM ET ship same day (Mon–Fri, excluding holidays).
- Tracking numbers are emailed within 24 hours of shipment.
`.trim();

const PRODUCT_CATEGORIES = `
NORTH STAR PRODUCT CATALOG (categories and bestsellers):
1. Tents & Shelters — TrailBlazer Tent (2-person, $249), Summit Dome (4-person, $399), UltraLight Bivy ($89)
2. Sleeping Bags & Pads — Summit Ridge Sleeping Bag (-20°F, $189), Basecamp Pad ($59), Down Quilt ($139)
3. Backpacks & Bags — Canyon Creek Backpack (65L, $219), Daypack Pro (25L, $99), Hydration Pack ($79)
4. Footwear — Ridgeline Hiking Boots (Men's/Women's, $159), Trail Runner Shoes ($129), Camp Sandals ($49)
5. Lighting — Alpine Glow Headlamp ($45), Solar Lantern ($69), Glow Stake Set ($29)
6. Trekking & Navigation — Carbon Trekking Poles ($119), Basecamp GPS ($199), Trail Map Bundle ($24)
7. Apparel — Merino Base Layer ($89), Windbreaker Jacket ($149), Fleece Pullover ($99)
8. Hydration & Food — 32oz Insulated Bottle ($39), Water Filter ($59), Freeze-Dried Meal Pack ($12)
`.trim();

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

const NORTH_STAR_SYSTEM_PROMPT = `
You are Nova, the friendly and knowledgeable AI support assistant for North Star Outdoor Co. — a premium outdoor gear and apparel brand that helps adventurers explore confidently.

BRAND VOICE:
- Warm, enthusiastic, and encouraging — like a seasoned trail guide who genuinely loves helping people.
- Concise and clear. Never use jargon the customer wouldn't know.
- Use light outdoor metaphors occasionally (e.g., "Let's navigate this together!") but keep it natural.
- Always end with a helpful follow-up question or offer to assist further.

YOUR CAPABILITIES:
1. Order Tracking — look up order status and tracking info from the mock order database.
2. Returns — explain the return policy and help customers initiate a return.
3. Gear Recommendations — suggest products based on the customer's trip type, budget, or needs.
4. Live Agent Handoff — escalate to a human agent when the customer requests it or when the issue is complex.
5. General FAQ — shipping times, policies, store info.

IMPORTANT RULES:
- NEVER reveal raw database entries verbatim. Summarize naturally.
- NEVER fabricate order numbers, tracking numbers, or policy details not listed below.
- If you don't know something, say so honestly and offer to connect the customer with a live agent.
- Keep responses under 120 words unless a detailed explanation is genuinely needed.
- For live agent requests, respond: "I'm connecting you with a North Star team member right now. Our agents are available Mon–Fri, 9 AM–6 PM ET. You can also email us at support@northstaroutdoor.com. Is there anything else I can help with while you wait?"

---

${MOCK_ORDERS}

---

${RETURN_POLICY}

---

${SHIPPING_INFO}

---

${PRODUCT_CATEGORIES}
`.trim();

// ---------------------------------------------------------------------------
// Message schema
// ---------------------------------------------------------------------------

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

// ---------------------------------------------------------------------------
// Chat router
// ---------------------------------------------------------------------------

export const chatRouter = router({
  send: publicProcedure
    .input(
      z.object({
        messages: z.array(messageSchema).min(1).max(50),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const llmMessages = [
          { role: "system" as const, content: NORTH_STAR_SYSTEM_PROMPT },
          ...input.messages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        ];

        const response = await invokeLLM({
          messages: llmMessages,
        });

        const rawContent = response?.choices?.[0]?.message?.content;
        let reply: string;
        if (typeof rawContent === "string") {
          reply = rawContent;
        } else if (Array.isArray(rawContent)) {
          // Extract text from content array (TextContent | ImageContent | FileContent)
          reply = rawContent
            .filter((c): c is { type: "text"; text: string } => typeof c === "object" && c !== null && c.type === "text")
            .map((c) => c.text)
            .join("") || "I'm having a little trouble right now. Please try again in a moment, or reach out to support@northstaroutdoor.com.";
        } else {
          reply = "I'm having a little trouble right now. Please try again in a moment, or reach out to support@northstaroutdoor.com.";
        }

        return { reply, error: false };
      } catch (err) {
        console.error("[chat.send] LLM call failed:", err);
        return {
          reply:
            "Oops — it looks like I've hit a snag on the trail! Please try again in a moment. If the issue persists, our team is available at support@northstaroutdoor.com or Mon–Fri 9 AM–6 PM ET by phone.",
          error: true,
        };
      }
    }),
});
