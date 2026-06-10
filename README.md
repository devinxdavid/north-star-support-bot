# North Star Support Bot

**Live demo:** https://devinxdavid.github.io/north-star-support-bot/

An AI-powered customer support chatbot for North Star Outdoor Co., built with a static GitHub Pages frontend and a secure Cloudflare Worker backend. The OpenAI API key never touches the browser — all AI calls are proxied server-side through the Worker.

---

## Features

- **Secure AI layer** — OpenAI key stored as a Cloudflare secret, never in browser code
- **Order tracking** — mock orders #111, #222, #333 with live status
- **Returns** — 30-day return policy, step-by-step guidance
- **Gear recommendations** — tents, footwear, packs, apparel, accessories
- **Shipping info** — Standard (3–5 days), Expedited (1–2 days)
- **Live agent handoff** — routes users to support@northstaroutdoor.com
- **Quick-reply buttons** — Track an order · Start a return · Get gear recommendations · Talk to a live agent
- **Full conversation history** — every message sent with each request for full context
- **Graceful error handling** — friendly fallback if the AI call fails

---

## Architecture

```
Browser (GitHub Pages)
  └─► POST /chat  ──►  Cloudflare Worker  ──►  OpenAI API
                           (OPENAI_API_KEY stored as secret)
```

The static site calls the Worker URL. The Worker prepends the North Star system prompt, forwards the conversation to OpenAI, and returns only the reply text. No credentials ever leave Cloudflare's servers.

---

## Project Structure

```
cloudflare-worker/
  worker.js          ← Cloudflare Worker (AI proxy + system prompt)
  wrangler.toml      ← Worker config (name, compatibility date)
client/
  src/pages/
    ChatPage.tsx     ← Main chat UI (React + tRPC version)
server/
  chatRouter.ts      ← tRPC chat.send procedure
  chat.send.test.ts  ← Vitest unit tests (6 tests, all passing)
index.html           ← Standalone static version (used on gh-pages)
```

---

## Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/devinxdavid/north-star-support-bot.git
cd north-star-support-bot
git checkout source
```

### 2. Deploy the Cloudflare Worker

```bash
cd cloudflare-worker
npm install -g wrangler        # install Wrangler CLI (one-time)
wrangler login                 # authenticate with Cloudflare
wrangler secret put OPENAI_API_KEY   # paste your key when prompted
wrangler deploy                # deploy → get your Worker URL
```

Copy the Worker URL (e.g. `https://north-star-support-bot.YOUR-SUBDOMAIN.workers.dev`).

### 3. Update the frontend with your Worker URL

Open `index.html` and replace:

```js
const WORKER_URL = "REPLACE_WITH_YOUR_WORKER_URL";
```

with your actual Worker URL, then push to `gh-pages`.

### 4. Run the full-stack version locally (optional)

```bash
npm install -g pnpm
pnpm install
pnpm dev
```

Open http://localhost:3000.

---

## Running Tests

```bash
pnpm test
```

All 6 Vitest tests cover the `chat.send` tRPC procedure — success paths, array content, LLM failure, null content, and full history forwarding.

---

## Shipping Policy

| Method | Delivery Time |
|---|---|
| Standard Shipping | 3–5 business days |
| Expedited Shipping | 1–2 business days |

---

## Environment Variables

| Variable | Where | Description |
|---|---|---|
| `OPENAI_API_KEY` | Cloudflare secret | OpenAI API key — **never** put this in code |

---

## License

MIT
