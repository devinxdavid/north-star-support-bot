# North Star Support Bot AI — TODO

## Server-side AI Layer
- [x] Add chat.send tRPC procedure in server/routers.ts using invokeLLM
- [x] Write comprehensive North Star system prompt (brand persona, mock orders, return policy, shipping info, product categories)
- [x] Accept full conversation history array in chat.send input
- [x] Return AI reply string from chat.send
- [x] Graceful error handling: catch LLM failures and return friendly fallback message

## Database / Schema
- [x] Add chat_sessions table to drizzle/schema.ts (optional persistence layer — deferred, not required for MVP)
- [x] Apply migration SQL via webdev_execute_sql if schema added (deferred, not required for MVP)

## Frontend Chat UI
- [x] Global theme: pine/sand/clay palette + Inter font in index.css and index.html
- [x] Build ChatPage component (client/src/pages/ChatPage.tsx) with full chat layout
- [x] Bot avatar (pine-colored icon or initials badge)
- [x] Message bubbles: user (clay/sand) vs bot (pine/white) styling
- [x] Quick-reply buttons: "Track an order", "Start a return", "Get gear recommendations", "Talk to a live agent"
- [x] Conversation history maintained in React state
- [x] Send full history with every trpc.chat.send call
- [x] Typing/loading indicator while AI is responding
- [x] Auto-scroll to latest message
- [x] Input field + send button with keyboard (Enter) support
- [x] Register /chat route in App.tsx
- [x] Update Home.tsx to link to the chat

## Error Handling
- [x] Show friendly fallback message on AI call failure
- [x] Disable send button while request is in-flight

## Tests
- [x] Vitest unit test for chat.send procedure (mock invokeLLM)
- [x] Test: valid conversation history returns AI reply
- [x] Test: LLM failure returns fallback message string

## Checkpoint
- [x] Save checkpoint after all features are complete
