# North Star Support Bot AI

> **Nova** — AI-powered customer support assistant for North Star Outdoor Co.

A full-stack web application delivering a secure, conversational support experience powered by OpenAI on the backend. The AI key is **never exposed to the browser** — all LLM calls are made server-side through a tRPC procedure.

---

## Features

- **Secure server-side AI** — `chat.send` tRPC procedure calls the LLM from the backend; no API key ever reaches the browser.
- **North Star brand persona** — Nova is grounded with mock order data, return policy, shipping info, and product catalog via a rich system prompt.
- **Four quick-reply flows** — Track an order · Start a return · Get gear recommendations · Talk to a live agent.
- **Full conversation history** — every message is sent with each request so the AI always has full context.
- **On-brand UI** — pine/sand/clay color palette, Inter font, bot avatar, animated typing indicator.
- **Graceful error handling** — friendly fallback message if the AI call fails.

---

## Shipping Information

| Method | Delivery Time | Cost |
|---|---|---|
| Standard Shipping | 3–5 business days | FREE over $75, otherwise $6.99 |
| Expedited Shipping | 1–2 business days | $14.99 |
| Overnight Shipping | Next business day | $29.99 (order by 1 PM ET) |
| International (CA/MX) | 10–14 business days | $19.99 flat rate |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + Tailwind CSS 4 |
| Backend | Node.js + Express + tRPC 11 |
| AI | OpenAI via server-side `invokeLLM` helper |
| Database | MySQL / TiDB via Drizzle ORM |
| Auth | Manus OAuth |
| Testing | Vitest (6 tests, all passing) |

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
- A MySQL/TiDB database (free [TiDB Serverless](https://tidbcloud.com/) works)

### Setup

```bash
# 1. Clone the repository and switch to the source branch
git clone https://github.com/devinxdavid/north-star-support-bot.git
cd north-star-support-bot
git checkout source

# 2. Install dependencies
pnpm install

# 3. Set required environment variables (ask project owner for values):
#    DATABASE_URL        - MySQL/TiDB connection string
#    JWT_SECRET          - Session signing secret
#    BUILT_IN_FORGE_API_KEY  - OpenAI or Forge API key (server-side only)
#    BUILT_IN_FORGE_API_URL  - API base URL (e.g. https://api.openai.com)

# 4. Run database migrations
pnpm db:push

# 5. Start the development server
pnpm dev
# App available at http://localhost:3000
```

### Run Tests

```bash
pnpm test
# 6 tests should pass (5 chat procedure + 1 auth logout)
```

---

## Security

- The OpenAI API key is stored as a server-side environment variable — never bundled into client JavaScript.
- The `chat.send` procedure is a server-side tRPC mutation in `server/chatRouter.ts`.
- All AI calls originate from the backend, not the browser.

---

## License

MIT © North Star Outdoor Co.
