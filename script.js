const chatMessages = document.querySelector("#chatMessages");
const chatForm = document.querySelector("#chatForm");
const userInput = document.querySelector("#userInput");
const quickOptions = document.querySelector("#quickOptions");

const orderData = {
  "111": "Order #111 is shipped and arriving tomorrow.",
  "222": "Order #222 is processing and ships in 24 hours.",
  "333": "Order #333 was delivered. Did everything arrive okay?"
};

const productCategories = {
  cold: "For cold weather camping, I recommend looking at product categories such as thermal base layers, waterproof jackets, insulated outerwear, cold-rated sleeping bags, and sturdy backpacks.",
  rain: "For wet weather, I recommend product categories such as waterproof jackets, hiking boots, backpacks with rain protection, and tents.",
  hiking: "For hiking, I recommend product categories such as hiking boots, waterproof jackets, backpacks, and thermal base layers if temperatures may drop.",
  camping: "For camping, I recommend product categories such as tents, sleeping bags, camp cookware, backpacks, and thermal base layers depending on the weather.",
  general: "A good starting point would be product categories such as hiking boots, waterproof jackets, backpacks, tents, sleeping bags, thermal base layers, and camp cookware."
};

let conversationState = "main";
let recommendationQuestionCount = 0;

const mainOptions = [
  { label: "Track an order", message: "Where is my order?" },
  { label: "Start a return", message: "I need to start a return" },
  { label: "Get gear recommendations", message: "What gear should I buy?" },
  { label: "Talk to a live agent", message: "I want a live agent" }
];

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

function normalizeMessage(message) {
  return message.toLowerCase().trim();
}

function includesAny(message, keywords) {
  return keywords.some((keyword) => message.includes(keyword));
}

/**
 * Simulated AI-ready intent classifier.
 *
 * This function uses practical keyword groups to classify customer intent in a deterministic,
 * testable way. In a production system, this function could be replaced or enhanced with a
 * real AI API call that returns a structured intent such as "order_tracking" or "handoff".
 * The business rules should still validate final answers so the bot does not invent order
 * statuses, policies, prices, products, or customer data.
 */
function classifyIntent(message) {
  const normalized = normalizeMessage(message);

  const intentKeywords = {
    order_tracking: ["order", "tracking", "track", "package", "delivery", "shipping update", "where is my order", "status"],
    returns: ["return", "exchange", "refund", "send back", "wrong size", "replace"],
    recommendation: ["recommend", "recommendation", "gear", "what should i buy", "buy", "camping", "hiking", "cold weather", "rain", "jacket", "boots", "tent", "sleeping bag"],
    handoff: ["human", "person", "agent", "representative", "live support", "live agent", "someone"]
  };

  if (includesAny(normalized, intentKeywords.handoff)) {
    return "handoff";
  }

  if (includesAny(normalized, intentKeywords.order_tracking)) {
    return "order_tracking";
  }

  if (includesAny(normalized, intentKeywords.returns)) {
    return "returns";
  }

  if (includesAny(normalized, intentKeywords.recommendation)) {
    return "recommendation";
  }

  return "fallback";
}

function getOrderNumber(message) {
  const match = message.match(/#?\b(\d{3})\b/);
  return match ? match[1] : null;
}

function handleOrderTracking(message) {
  const orderNumber = getOrderNumber(message);

  if (!orderNumber) {
    conversationState = "awaiting_order_number";
    addMessage("bot", "I can help track that. What is your 3-digit order number?");
    renderQuickOptions([
      { label: "Order #111", message: "111" },
      { label: "Order #222", message: "222" },
      { label: "Order #333", message: "333" },
      { label: "Main options", message: "main options" }
    ]);
    return;
  }

  if (orderData[orderNumber]) {
    addMessage("bot", `${orderData[orderNumber]}\n\nYou can also track another order, start a return, get gear recommendations, or talk to a live agent.`);
  } else {
    addMessage("bot", "That order number is invalid in this demo. I can only look up mock orders #111, #222, and #333.\n\nWould you like to try another order number or choose another support option?");
  }

  conversationState = "main";
  renderQuickOptions();
}

function handleReturns() {
  conversationState = "main";
  addMessage("bot", "Returns are accepted within 30 days for unused items in original packaging.\n\nStart here: northstaroutdoors.com/returns\n\nAnything else I can help with around the trailhead?");
  renderQuickOptions();
}

function identifyRecommendationCategory(message) {
  const normalized = normalizeMessage(message);

  if (includesAny(normalized, ["cold", "winter", "snow", "freezing", "thermal", "insulated"])) {
    return "cold";
  }

  if (includesAny(normalized, ["rain", "wet", "waterproof", "storm"] )) {
    return "rain";
  }

  if (includesAny(normalized, ["hike", "hiking", "trail", "boots"] )) {
    return "hiking";
  }

  if (includesAny(normalized, ["camp", "camping", "tent", "sleeping", "cookware"] )) {
    return "camping";
  }

  return "general";
}

function handleRecommendation(message) {
  const normalized = normalizeMessage(message);
  const hasContext = includesAny(normalized, [
    "cold", "winter", "snow", "rain", "wet", "waterproof", "hiking", "trail", "camping", "camp", "tent", "sleeping", "cookware", "boots", "jacket"
  ]);

  if (!hasContext && recommendationQuestionCount === 0) {
    conversationState = "awaiting_recommendation_context";
    recommendationQuestionCount += 1;
    addMessage("bot", "Happy to help you gear up. What activity and weather are you preparing for? For example: hiking in rain, cold weather camping, or weekend tent camping.");
    renderQuickOptions([
      { label: "Cold weather camping", message: "Cold weather camping" },
      { label: "Rainy hiking", message: "Rainy hiking" },
      { label: "Weekend camping", message: "Weekend camping" },
      { label: "Main options", message: "main options" }
    ]);
    return;
  }

  const category = identifyRecommendationCategory(message);
  addMessage("bot", `${productCategories[category]}\n\nI’m recommending categories only, not specific products, prices, or discounts. Need help with another route?`);
  conversationState = "main";
  recommendationQuestionCount = 0;
  renderQuickOptions();
}

function handleHandoff() {
  conversationState = "live_agent";
  addMessage("bot", "Connecting you to a Live Agent.\nLive Agent State: Active.\n\nThis is a simulated handoff for the demo, so no real support representative is contacted.");
  renderQuickOptions([
    { label: "Return to bot options", message: "main options" }
  ]);
}

function handleFallback() {
  addMessage("bot", "I’m sorry, I didn’t quite understand that.\n\nYou can choose one of these options:\n1. Track an order\n2. Start a return or exchange\n3. Get product recommendations\n4. Talk to a live agent");
  conversationState = "main";
  renderQuickOptions();
}

function handleMainOptionsShortcut(message) {
  if (includesAny(normalizeMessage(message), ["main options", "menu", "start over", "home"])) {
    conversationState = "main";
    recommendationQuestionCount = 0;
    addMessage("bot", "Sure thing. What can I help with next?");
    renderQuickOptions();
    return true;
  }

  return false;
}

function routeMessage(message) {
  if (handleMainOptionsShortcut(message)) {
    return;
  }

  if (conversationState === "awaiting_order_number") {
    handleOrderTracking(message);
    return;
  }

  if (conversationState === "awaiting_recommendation_context") {
    handleRecommendation(message);
    return;
  }

  if (conversationState === "live_agent") {
    addMessage("bot", "Live Agent State: Active. This demo has already simulated the handoff. You can return to bot options anytime.");
    renderQuickOptions([
      { label: "Return to bot options", message: "main options" }
    ]);
    return;
  }

  const intent = classifyIntent(message);

  switch (intent) {
    case "order_tracking":
      handleOrderTracking(message);
      break;
    case "returns":
      handleReturns();
      break;
    case "recommendation":
      handleRecommendation(message);
      break;
    case "handoff":
      handleHandoff();
      break;
    default:
      handleFallback();
  }
}

function handleUserMessage(message) {
  const cleanedMessage = message.trim();

  if (!cleanedMessage) {
    return;
  }

  addMessage("user", cleanedMessage);
  userInput.value = "";

  window.setTimeout(() => {
    routeMessage(cleanedMessage);
  }, 220);
}

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  handleUserMessage(userInput.value);
});

addMessage("bot", "Welcome to North Star Support Bot. I can help track mock orders, explain returns and exchanges, suggest outdoor gear categories, or connect you to a simulated live agent. What can I help with today?");
renderQuickOptions();
