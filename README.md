# North Star Support Bot

North Star Support Bot is a simple **AI-assisted customer support chatbot** for a simulated outdoor apparel and camping gear e-commerce business. It runs entirely in the browser with HTML, CSS, and vanilla JavaScript. No backend, deployment, external API, or API key is required.

The chatbot helps customers with order tracking, returns and exchanges, product category recommendations, simulated human handoff, and fallback support when the bot does not understand a request.

## Project Overview

This project demonstrates how a small e-commerce support chatbot can combine structured business rules with an AI-ready design. The bot uses deterministic conversation states and a simulated intent classifier so that responses remain accurate, testable, and limited to the provided mock business data.

> This project uses provided mock data only. It does not connect to real customer records, real orders, or a live support system.

## Brand Persona

| Attribute | Detail |
|---|---|
| Name | North Star Support Bot |
| Tone | Friendly, helpful, outdoorsy, concise |
| Audience | North American outdoor consumers |

## Features

| Feature | Description |
|---|---|
| Order tracking | Detects order, tracking, package, delivery, shipping update, and similar questions, then asks for an order number. |
| Returns and exchanges | Explains the 30-day return policy, unused-item requirement, original-packaging requirement, and simulated return link. |
| Product recommendations | Asks for context when needed and recommends product categories only. |
| Human handoff | Transitions to a simulated Live Agent state when the user asks for a person, human, agent, representative, or live support. |
| Fallback handling | Provides a clear fallback message and offers the main support options. |
| Quick reply buttons | Gives users one-click options for the main support flows and selected follow-up states. |
| Mobile-friendly UI | Uses responsive layout, message bubbles, and an outdoor-inspired visual style. |

## How to Run Locally

Clone or download this repository, then open `index.html` in a web browser.

```bash
git clone https://github.com/devinxdavid/north-star-support-bot.git
cd north-star-support-bot
open index.html
```

If the `open` command is not available on your system, double-click `index.html` or drag it into your browser.

## File Structure

| File | Purpose |
|---|---|
| `index.html` | Defines the chatbot page structure and accessible chat interface. |
| `style.css` | Provides the responsive outdoor-inspired visual design. |
| `script.js` | Contains conversation state, intent classification, mock order lookup, and response logic. |
| `README.md` | Documents the project, testing examples, and limitations. |

## Mock Data

The chatbot uses only the following mock order data.

| Order Number | Status |
|---|---|
| `111` | Shipped, arriving tomorrow |
| `222` | Processing, ships in 24 hours |
| `333` | Delivered |
| Any other order number | Invalid |

## Return Policy

North Star accepts returns within 30 days as long as items are unused and in their original packaging.

Return link: `northstaroutdoors.com/returns`

## Shipping Information

| Shipping Method | Timeframe |
|---|---|
| Standard shipping | 3-5 days |
| Expedited shipping | 1-2 days |

## Supported Intents

| Intent | Example User Messages | Bot Behavior |
|---|---|---|
| Order tracking | “Where is my order?”, “Track my package”, “Any shipping update?” | Asks for a 3-digit order number and checks the mock order table. |
| Returns and exchanges | “I need to return my jacket”, “Can I exchange this?” | Explains return requirements and provides the simulated returns link. |
| Product recommendations | “What gear should I buy for cold weather camping?” | Asks for activity/weather context if needed, then recommends categories only. |
| Human handoff | “I want a live agent”, “Can I talk to a person?” | Enters a simulated Live Agent state. |
| Fallback | “banana mountain” | Says the bot did not understand and offers the main options. |

## AI-Assisted Design Explanation

The chatbot uses a function named `classifyIntent(message)` in `script.js` to simulate AI-style intent classification through practical keyword groups. This design makes the project AI-ready because a future real AI model could be connected at that point to classify messages more flexibly.

The project intentionally keeps the business rules separate from any simulated AI behavior. This prevents unsupported answers and ensures the bot does not invent order statuses, policies, shipping details, product names, prices, discounts, or customer data.

## Conversation States

| State | Purpose |
|---|---|
| `main` | Default state for detecting the user’s next intent. |
| `awaiting_order_number` | Used after a user asks to track an order but has not provided a number. |
| `awaiting_recommendation_context` | Used when the user wants product recommendations but has not provided enough activity or weather context. |
| `live_agent` | Simulates handoff to live support. |

## Testing Examples

Use these messages to test the main flows.

| Test Message | Follow-Up Input | Expected Result |
|---|---|---|
| `Where is my order?` | `111` | `Order #111 is shipped and arriving tomorrow.` |
| `Track my package` | `222` | `Order #222 is processing and ships in 24 hours.` |
| `Where is my order?` | `333` | `Order #333 was delivered. Did everything arrive okay?` |
| `I need to return my jacket` | None | Returns are accepted within 30 days for unused items in original packaging, with `northstaroutdoors.com/returns`. |
| `What gear should I buy for cold weather camping?` | None | Recommends categories such as thermal base layers, waterproof jackets, insulated outerwear, cold-rated sleeping bags, and backpacks. |
| `I want a live agent` | None | `Connecting you to a Live Agent. Live Agent State: Active.` |
| `banana mountain` | None | `I’m sorry, I didn’t quite understand that.` and the main options. |

## Limitations

This is a portfolio-friendly browser demo. It does not use a backend, store chat history, connect to a real AI API, authenticate users, process real orders, contact a live support representative, or deploy to a production environment.

The chatbot recommends only product categories and does not invent real products, product prices, discounts, or inventory information.

## Submission Note

I built North Star Support Bot as a simple AI-assisted customer support chatbot for an outdoor apparel and camping gear e-commerce business.

The chatbot uses structured conversation states and mock business data to handle order tracking, returns and exchanges, product recommendations, human handoff, and fallback responses.

To keep the project accurate and testable, required business rules are handled in code. The AI-assisted layer is represented through an intent classification function that simulates how an AI model would understand natural language variations without inventing unsupported order data, policies, or product details.
