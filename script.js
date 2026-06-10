const chatMessages = document.querySelector("#chatMessages");
const chatForm = document.querySelector("#chatForm");
const userInput = document.querySelector("#userInput");
const quickOptions = document.querySelector("#quickOptions");

// ── Mock order data ────────────────────────────────────────────────────────
const orderData = {
  "111": { status: "shipped",    reply: "Great news! Order #111 has shipped and is arriving TOMORROW. 📦 Is there anything else I can help you with?" },
  "222": { status: "processing", reply: "Order #222 is currently being prepared. It will ship within 24 hours and you'll receive a tracking email as soon as it's on its way. Is there anything else I can help you with?" },
  "333": { status: "delivered",  reply: "Order #333 has been delivered! Did everything arrive in good condition? If there's any issue with your item, I can help you start a return." }
};

// ── Product categories ─────────────────────────────────────────────────────
const productCategories = {
  cold:    "For cold weather camping, I recommend looking at: thermal base layers, insulated outerwear, cold-rated sleeping bags (-20°F), and waterproof jackets.",
  rain:    "For wet weather, I recommend: waterproof jackets, waterproof hiking boots, backpacks with rain covers, and quick-dry apparel.",
  hiking:  "For hiking, I recommend: hiking boots, a daypack or 65L backpack, a waterproof jacket, and thermal base layers if temperatures may drop.",
  camping: "For camping, I recommend: a tent, a sleeping bag rated for your conditions, camp cookware, a headlamp, and a sturdy backpack.",
  general: "Great starting categories: hiking boots, waterproof jackets, backpacks, tents, sleeping bags, thermal base layers, and camp cookware."
};

// ── State ──────────────────────────────────────────────────────────────────
let conversationState = "main";
let recommendationQuestionCount = 0;

// ── Quick-reply buttons ────────────────────────────────────────────────────
const mainOptions = [
  { label: "Track an order",           message: "Where is my order?" },
  { label: "Returns & exchanges",      message: "I need to start a return" },
  { label: "Get gear recommendations", message: "What gear should I buy?" },
  { label: "Talk to a live agent",     message: "I want a live agent" },
  { label: "Shipping info",            message: "How long does shipping take?" }
];

// ── DOM helpers ────────────────────────────────────────────────────────────
function addMessage(sender, text) {
  const row = document.createElement("div");
  row.className = `message-row ${sender}`;

  const bubble = document.createElement("div");
  bubble.className = "message-bubble";
  bubble.textContent = text;

  row.appendChild(bubble);
  chatMessages.appendChild(row);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function renderQuickOptions(options = mainOptions) {
  quickOptions.innerHTML = "";
  options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = option.label;
    button.addEventListener("click", () => handleUserMessage(option.message));
    quickOptions.appendChild(button);
  });
}

// ── Text utilities ─────────────────────────────────────────────────────────
function normalizeMessage(message) {
  return message.toLowerCase().trim();
}

function includesAny(message, keywords) {
  return keywords.some((keyword) => message.includes(keyword));
}

// ── Intent classifier ──────────────────────────────────────────────────────
/**
 * Keyword-based intent classifier.
 * Handles natural language variations for all 5 supported intents.
 * In a production system this could be replaced with an AI API call.
 */
function classifyIntent(message) {
  const n = normalizeMessage(message);

  const keywords = {
    handoff: [
      "human", "person", "agent", "representative", "live support",
      "live agent", "someone", "real person", "talk to someone", "speak with"
    ],
    order_tracking: [
      "order", "tracking", "track", "package", "delivery", "where is my",
      "where's my", "shipping update", "status", "has it shipped", "my stuff"
    ],
    returns: [
      "return", "exchange", "refund", "send back", "wrong size",
      "replace", "return policy", "how do i return", "can i return"
    ],
    recommendation: [
      "recommend", "recommendation", "gear", "what should i buy",
      "what do you have", "help me find", "buy", "camping", "hiking",
      "cold weather", "rain", "jacket", "boots", "tent", "sleeping bag",
      "what gear", "suggest"
    ],
    shipping_info: [
      "shipping", "how long", "delivery time", "when will it arrive",
      "standard shipping", "expedited", "how fast", "shipping options",
      "how many days"
    ]
  };

  // Priority order: handoff > order_tracking > returns > recommendation > shipping_info
  if (includesAny(n, keywords.handoff))        return "handoff";
  if (includesAny(n, keywords.order_tracking)) return "order_tracking";
  if (includesAny(n, keywords.returns))        return "returns";
  if (includesAny(n, keywords.recommendation)) return "recommendation";
  if (includesAny(n, keywords.shipping_info))  return "shipping_info";

  return "fallback";
}

// ── Order number extractor ─────────────────────────────────────────────────
function getOrderNumber(message) {
  const match = message.match(/#?\b(\d{3})\b/);
  return match ? match[1] : null;
}

// ── Flow handlers ──────────────────────────────────────────────────────────
function handleOrderTracking(message) {
  const orderNumber = getOrderNumber(message);

  if (!orderNumber) {
    conversationState = "awaiting_order_number";
    addMessage("bot", "I can help track that! What is your 3-digit order number?");
    renderQuickOptions([
      { label: "Order #111", message: "111" },
      { label: "Order #222", message: "222" },
      { label: "Order #333", message: "333" },
      { label: "Main menu",  message: "main options" }
    ]);
    return;
  }

  const order = orderData[orderNumber];

  if (order) {
    addMessage("bot", order.reply);

    // For delivered orders, offer a guided follow-up to start a return
    if (order.status === "delivered") {
      conversationState = "awaiting_delivered_followup";
      renderQuickOptions([
        { label: "Everything arrived fine", message: "Everything arrived fine" },
        { label: "I need to start a return",  message: "I need to start a return" },
        { label: "Main menu",                 message: "main options" }
      ]);
      return;
    }
  } else {
    addMessage("bot", "I wasn't able to find that order number in our system. Please double-check — valid demo orders are #111, #222, and #333. If you're still having trouble, I can connect you with a live agent.");
  }

  conversationState = "main";
  renderQuickOptions();
}

function handleReturns() {
  conversationState = "main";
  addMessage(
    "bot",
    "Our return policy:\n• 30-day returns on unused items in original packaging\n• Items must be unworn, unwashed, with all original tags attached\n\nStart your return here: northstaroutdoor.com/returns\n\nAnything else I can help with?"
  );
  renderQuickOptions();
}

function handleShippingInfo() {
  conversationState = "main";
  addMessage(
    "bot",
    "Here are our shipping options:\n• Standard Shipping: 3–5 business days\n• Expedited Shipping: 1–2 business days\n\nOrders placed before 2 PM ET ship same day (Mon–Fri). Tracking numbers are emailed within 24 hours of shipment.\n\nAnything else I can help with?"
  );
  renderQuickOptions();
}

function identifyRecommendationCategory(message) {
  const n = normalizeMessage(message);
  if (includesAny(n, ["cold", "winter", "snow", "freezing", "thermal", "insulated"])) return "cold";
  if (includesAny(n, ["rain", "wet", "waterproof", "storm"]))                          return "rain";
  if (includesAny(n, ["hike", "hiking", "trail", "boots"]))                            return "hiking";
  if (includesAny(n, ["camp", "camping", "tent", "sleeping", "cookware"]))             return "camping";
  return "general";
}

function handleRecommendation(message) {
  const n = normalizeMessage(message);
  const hasContext = includesAny(n, [
    "cold", "winter", "snow", "rain", "wet", "waterproof",
    "hiking", "trail", "camping", "camp", "tent", "sleeping",
    "cookware", "boots", "jacket"
  ]);

  // Ask up to 2 clarifying questions before recommending
  if (!hasContext && recommendationQuestionCount === 0) {
    conversationState = "awaiting_recommendation_context";
    recommendationQuestionCount = 1;
    addMessage("bot", "Happy to help you gear up! What activity and conditions are you preparing for? For example: hiking in rain, cold weather camping, or a weekend tent trip.");
    renderQuickOptions([
      { label: "Cold weather camping", message: "Cold weather camping" },
      { label: "Rainy hiking",         message: "Rainy hiking" },
      { label: "Weekend camping",      message: "Weekend camping" },
      { label: "Main menu",            message: "main options" }
    ]);
    return;
  }

  if (!hasContext && recommendationQuestionCount === 1) {
    conversationState = "awaiting_recommendation_context";
    recommendationQuestionCount = 2;
    addMessage("bot", "Got it! One more quick question — what's your approximate budget? (e.g., under $100, $100–$300, or $300+)");
    renderQuickOptions([
      { label: "Under $100",  message: "under 100" },
      { label: "$100–$300",   message: "100 to 300" },
      { label: "$300+",       message: "over 300" },
      { label: "Main menu",   message: "main options" }
    ]);
    return;
  }

  const category = identifyRecommendationCategory(message);
  addMessage("bot", `${productCategories[category]}\n\nNote: I recommend categories only — not specific prices or discounts. Would you like help with anything else?`);
  conversationState = "main";
  recommendationQuestionCount = 0;
  renderQuickOptions();
}

function handleHandoff() {
  conversationState = "live_agent";
  addMessage(
    "bot",
    "Connecting you to a Live Agent now. 🎿\n\n— Live Agent State: Active —\n\nOur agents are available Mon–Fri, 9 AM–6 PM ET. You can also reach us at support@northstaroutdoor.com. Is there anything else I can help with while you wait?"
  );
  renderQuickOptions([
    { label: "Return to main menu", message: "main options" }
  ]);
}

function handleFallback() {
  addMessage(
    "bot",
    "I'm not sure I caught that. Here's what I can help with:\n1. Track an order\n2. Returns & exchanges\n3. Gear recommendations\n4. Shipping info\n5. Talk to a live agent\n\nWhat would you like to do?"
  );
  conversationState = "main";
  renderQuickOptions();
}

// ── Main options shortcut ──────────────────────────────────────────────────
function handleMainOptionsShortcut(message) {
  if (includesAny(normalizeMessage(message), ["main options", "main menu", "menu", "start over", "home", "back"])) {
    conversationState = "main";
    recommendationQuestionCount = 0;
    addMessage("bot", "Sure thing — back to the main menu. What can I help with?");
    renderQuickOptions();
    return true;
  }
  return false;
}

// ── Message router ─────────────────────────────────────────────────────────
function routeMessage(message) {
  if (handleMainOptionsShortcut(message)) return;

  // State-specific routing
  if (conversationState === "awaiting_order_number") {
    handleOrderTracking(message);
    return;
  }

  if (conversationState === "awaiting_delivered_followup") {
    const n = normalizeMessage(message);
    if (includesAny(n, ["return", "exchange", "refund", "start", "issue", "problem", "wrong", "broken"])) {
      handleReturns();
    } else {
      addMessage("bot", "Glad to hear it! Is there anything else I can help you with today?");
      conversationState = "main";
      renderQuickOptions();
    }
    return;
  }

  if (conversationState === "awaiting_recommendation_context") {
    handleRecommendation(message);
    return;
  }

  if (conversationState === "live_agent") {
    addMessage("bot", "Live Agent State: Active. A team member will be with you shortly. You can return to the main menu anytime.");
    renderQuickOptions([{ label: "Return to main menu", message: "main options" }]);
    return;
  }

  // Intent-based routing from main state
  const intent = classifyIntent(message);
  switch (intent) {
    case "order_tracking":  handleOrderTracking(message); break;
    case "returns":         handleReturns();              break;
    case "recommendation":  handleRecommendation(message); break;
    case "handoff":         handleHandoff();              break;
    case "shipping_info":   handleShippingInfo();         break;
    default:                handleFallback();
  }
}

// ── Message entry point ────────────────────────────────────────────────────
function handleUserMessage(message) {
  const cleaned = message.trim();
  if (!cleaned) return;

  addMessage("user", cleaned);
  userInput.value = "";

  window.setTimeout(() => routeMessage(cleaned), 220);
}

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  handleUserMessage(userInput.value);
});

// ── Initial greeting ───────────────────────────────────────────────────────
addMessage(
  "bot",
  "Welcome to North Star Support! I'm here to help with order tracking, returns, gear recommendations, shipping info, or connecting you with a live agent. What can I help with today?"
);
renderQuickOptions();
