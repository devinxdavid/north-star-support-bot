# North Star Support Bot

> **Nova** — AI-powered customer support assistant for North Star Outdoor Co.

**Live Demo:** https://devinxdavid.github.io/north-star-support-bot/

An AI-powered customer support chatbot with a static GitHub Pages frontend and a secure server-side AI backend. The API key is **never exposed to the browser** — all AI calls are made server-side.

---

## Core Use Cases

| Flow | Behavior |
|---|---|
| **Order Tracking** | Asks for order number → returns simulated status for #111, #222, #333 |
| **Returns & Exchanges** | Explains 30-day return policy → provides returns link |
| **Gear Recommendations** | Asks 1–2 clarifying questions → recommends product category |
| **Live Agent Handoff** | Handles explicit request or fallback → transitions to "Live Agent" state |

### Mock Order Logic

| Order # | Status | Details |
|---|---|---|
| `#111` | Shipped | Arriving tomorrow — UPS tracking provided |
| `#222` | Processing | Ships within 24 hours |
| `#333` | Delivered | Follow-up: "Did everything arrive in good condition?" |
| Any other | Invalid | Not found — offers live agent escalation |

---

## How to Test

Open the **[Live Demo](https://devinxdavid.github.io/north-star-support-bot/)** and try the prompts below to verify each core flow. You can type them freely or use the quick-reply buttons.

### 1. Order Tracking

The bot must ask for an order number if none is provided, then return the correct simulated status.

| Prompt | Expected Response |
|---|---|
| `Where is my order?` | Asks for your 3-digit order number |
| `Track my package` | Asks for your 3-digit order number |
| `111` *(after being asked)* | "Order #111 has shipped and is arriving TOMORROW" |
| `222` | "Order #222 is processing — ships within 24 hours" |
| `333` | "Order #333 has been delivered — did everything arrive OK?" |
| `999` | "I wasn't able to find that order number" + offers live agent |

### 2. Returns & Exchanges

The bot must explain the 30-day policy and always provide the returns link.

| Prompt | Expected Response |
|---|---|
| `I need to return something` | 30-day policy + `northstaroutdoor.com/returns` |
| `How do I start a return?` | 30-day policy + `northstaroutdoor.com/returns` |
| `Can I exchange a wrong size?` | 30-day policy + `northstaroutdoor.com/returns` |
| `What is your return policy?` | 30-day policy + `northstaroutdoor.com/returns` |

### 3. Product Recommendations

The bot must ask **1–2 clarifying questions** before recommending a product category.

| Prompt | Expected Response |
|---|---|
| `What gear should I buy?` | Asks what activity/conditions you're preparing for |
| `Can you recommend something?` | Asks what activity/conditions you're preparing for |
| `Cold weather camping` *(follow-up)* | Recommends thermal base layers, insulated outerwear, cold-rated sleeping bag |
| `Rainy hiking` *(follow-up)* | Recommends waterproof jacket, hiking boots, backpack with rain cover |

### 4. Human Handoff

The bot must transition to a **"Live Agent: Active"** state.

| Prompt | Expected Response |
|---|---|
| `I want to talk to a real person` | "Connecting you to a Live Agent" — Live Agent State: Active |
| `Let me speak with someone` | "Connecting you to a Live Agent" — Live Agent State: Active |
| `Live agent` | "Connecting you to a Live Agent" — Live Agent State: Active |

### 5. Shipping Information

| Prompt | Expected Response |
|---|---|
| `How long does shipping take?` | Standard: 3–5 days · Expedited: 1–2 days |
| `What are your shipping options?` | Standard: 3–5 days · Expedited: 1–2 days |

### 6. Fallback Handling

The bot must respond with a clear message and offer options.

| Prompt | Expected Response |
|---|---|
| `asdfghjkl` | "I'm not sure I caught that" + lists available options |
| `banana helicopter` | "I'm not sure I caught that" + lists available options |

---

## Features

- **Secure server-side AI** — API key stored server-side; never sent to the browser
- **Intent recognition** — handles variations ("where's my order?", "track my package", "I want to return something")
- **Guided conversation flows** — logical, step-by-step interactions for each use case
- **Return to main flow** — after resolving any issue, Nova offers further assistance
- **Fallback handling** — clear "I didn't understand" response with options or escalation
- **Quick-reply buttons** — Track an order · Start a return · Get gear recommendations · Talk to a live agent
- **Full conversation history** — every message sent with each request for full context
- **Graceful error handling** — friendly fallback if the AI call fails

---

## Return Policy

- **30-day returns** on unused items in original packaging
- Items must be unworn, unwashed, with all original tags attached
- Returns portal: [northstaroutdoor.com/returns](https://northstaroutdoor.com/returns)
- Refunds processed within 5–7 business days of warehouse receipt

---

## Shipping Information

| Method | Delivery Time |
|---|---|
| Standard Shipping | 3–5 business days |
| Expedited Shipping | 1–2 business days |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + Tailwind CSS 4 |
| Backend | Node.js + Express + tRPC 11 |
| AI | OpenAI GPT (server-side only) |
| Database | MySQL via Drizzle ORM |
| Testing | Vitest (7 tests, all passing) |

---

## Project Structure

```
client/
  src/
    pages/
      Home.tsx        <- Landing page introducing Nova
      ChatPage.tsx    <- Main chat interface with quick-reply buttons
    components/       <- Shared UI components
server/
  chatRouter.ts       <- chat.send tRPC procedure + North Star system prompt
  routers.ts          <- App router (registers chatRouter)
  db.ts               <- Database helpers
  chat.send.test.ts   <- Vitest unit tests for the AI procedure
drizzle/              <- Schema & migrations
shared/               <- Shared types & constants
```

---

## Local Development

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- A MySQL database

### Setup

```bash
# 1. Clone the repository and switch to the source branch
git clone https://github.com/devinxdavid/north-star-support-bot.git
cd north-star-support-bot
git checkout source

# 2. Install dependencies
pnpm install

# 3. Set required environment variables:
#    DATABASE_URL            - MySQL connection string
#    JWT_SECRET              - Session signing secret (any random string)
#    OPENAI_API_KEY   - Your OpenAI API key (server-side only, never sent to browser)

# 4. Run database migrations
pnpm db:push

# 5. Start the development server
pnpm dev
# App available at http://localhost:3000
```

### Run Tests

```bash
pnpm test
# 7 tests should pass (6 chat procedure + 1 auth logout)
```

---

## Security

- The OpenAI API key is stored as a server-side environment variable — never bundled into client JavaScript.
- The `chat.send` procedure is a server-side tRPC mutation in `server/chatRouter.ts`.
- All AI calls originate from the backend, not the browser.

---

## License

MIT © North Star Outdoor Co.
