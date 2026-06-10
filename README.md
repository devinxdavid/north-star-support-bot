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
