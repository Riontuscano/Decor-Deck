import express from "express";
import dotenv from "dotenv";
import Stripe from "stripe";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { clerkClient, clerkMiddleware, getAuth } from "@clerk/express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "public");
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(__dirname, file), "utf8"));

const app = express();
const port = process.env.PORT || 3000;

// Public base URL used for Stripe redirects and product images.
// Render sets RENDER_EXTERNAL_URL automatically; PUBLIC_URL overrides it.
const PUBLIC_URL = (process.env.PUBLIC_URL || process.env.RENDER_EXTERNAL_URL || "").replace(/\/+$/, "");

// Initialize Stripe and Gemini (both optional so the static site still works without them)
const stripeGateway = process.env.STRIPE_API ? new Stripe(process.env.STRIPE_API) : null;
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

// Clerk handles sign-in; checkout requires a signed-in user
const clerkEnabled = Boolean(process.env.CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);

if (!stripeGateway) console.warn("[Config] STRIPE_API is not set - checkout is disabled.");
if (!clerkEnabled) console.warn("[Config] CLERK_PUBLISHABLE_KEY / CLERK_SECRET_KEY are not set - sign-in and checkout are disabled.");
if (!genAI) console.warn("[Config] GEMINI_API_KEY is not set - the chatbot will only answer from the knowledge base.");

// Load knowledge base and product catalogue (the catalogue is the source of truth for prices)
const knowledgeBase = readJson("decor-deck-knowledge.json");
const catalog = readJson("products.json");
const normalizeName = (name) => String(name ?? "").trim().replace(/\s+/g, " ").toLowerCase();
const productsByName = new Map(catalog.map((product) => [normalizeName(product.name), product]));

const chatModel = genAI?.getGenerativeModel({
  model: GEMINI_MODEL,
  systemInstruction:
    "You are a customer service assistant for the Decor-Deck furniture store. " +
    "Answer questions accurately using only this store information and product list. " +
    "Reply in plain text without HTML.\n" +
    `Store information: ${JSON.stringify(knowledgeBase)}\n` +
    `Products (prices in INR): ${JSON.stringify(catalog.map(({ name, price, category }) => ({ name, price, category })))}`,
  generationConfig: {
    maxOutputTokens: 1000,
  },
});

// Middleware
app.set("trust proxy", 1); // Render terminates TLS at its proxy
app.disable("x-powered-by");
// The pages load scripts/styles from several CDNs and use inline scripts, so CSP stays off.
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(express.json({ limit: "100kb" }));
app.use(express.static(publicDir));
// Session verification is only needed on API routes, not static files
if (clerkEnabled) app.use(["/api", "/stripe-checkout"], clerkMiddleware());

const jsonLimiter = (limit, message) =>
  rateLimit({
    windowMs: 60 * 1000,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: message },
  });

// Rejects requests without a valid Clerk session (token sent as a Bearer header)
function requireUser(req, res, next) {
  if (!clerkEnabled) {
    return res.status(503).json({ error: "Sign-in is currently unavailable." });
  }
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Please sign in to continue." });
  }
  req.userId = userId;
  next();
}

// Routes
app.get("/ping", (req, res) => {
  res.status(200).json({ status: "ok", message: "pong" });
});

// Public settings the frontend needs (the publishable key is safe to expose)
app.get("/api/config", (req, res) => {
  res.json({ clerkPublishableKey: clerkEnabled ? process.env.CLERK_PUBLISHABLE_KEY : null });
});

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: publicDir });
});

app.get("/success", (req, res) => {
  res.sendFile("success.html", { root: publicDir });
});

app.get("/about", (req, res) => {
  res.sendFile("about.html", { root: publicDir });
});

app.get("/cancel", (req, res) => {
  res.sendFile("cancel.html", { root: publicDir });
});

app.get("/Hire", (req, res) => {
  res.sendFile("designer.html", { root: publicDir });
});

// Stripe Checkout Route
const MAX_LINE_ITEMS = 50;
const MAX_QUANTITY = 20;

app.post("/stripe-checkout", jsonLimiter(10, "Too many checkout attempts. Please try again in a minute."), requireUser, async (req, res) => {
  if (!stripeGateway) {
    return res.status(503).json({ error: "Payments are currently unavailable." });
  }

  const items = req.body?.items;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Your cart is empty." });
  }
  if (items.length > MAX_LINE_ITEMS) {
    return res.status(400).json({ error: "Too many items in cart." });
  }

  const baseUrl = PUBLIC_URL || `${req.protocol}://${req.get("host")}`;
  const lineItems = [];
  for (const item of items) {
    const product = productsByName.get(normalizeName(item?.title));
    if (!product) {
      return res.status(400).json({ error: `Unknown product: ${String(item?.title ?? "").slice(0, 100)}` });
    }
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      return res.status(400).json({ error: `Quantity for ${product.name} must be between 1 and ${MAX_QUANTITY}.` });
    }
    lineItems.push({
      price_data: {
        currency: "inr",
        product_data: {
          name: product.name,
          // Stripe can only display images it can reach over HTTPS
          ...(product.image && baseUrl.startsWith("https://") ? { images: [`${baseUrl}${product.image}`] } : {}),
        },
        unit_amount: product.price * 100,
      },
      quantity,
    });
  }

  const source = req.body.source === "plan" ? "plan" : "cart";

  // Prefill the customer's email in Stripe; checkout still works if the lookup fails
  let customerEmail;
  try {
    const user = await clerkClient.users.getUser(req.userId);
    customerEmail = user.primaryEmailAddress?.emailAddress;
  } catch (error) {
    console.error("Clerk user lookup error:", error.message);
  }

  try {
    const session = await stripeGateway.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${baseUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel.html`,
      line_items: lineItems,
      billing_address_collection: "required",
      client_reference_id: req.userId,
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      metadata: { source, userId: req.userId },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error.message);
    res.status(502).json({ error: "Could not start checkout. Please try again." });
  }
});

// Lets the success page confirm the payment before clearing the cart
app.get("/api/checkout-session/:id", jsonLimiter(30, "Too many requests."), async (req, res) => {
  if (!stripeGateway) {
    return res.status(503).json({ error: "Payments are currently unavailable." });
  }
  if (!/^cs_[A-Za-z0-9_]+$/.test(req.params.id)) {
    return res.status(400).json({ error: "Invalid session id." });
  }

  try {
    const session = await stripeGateway.checkout.sessions.retrieve(req.params.id);
    res.json({ paymentStatus: session.payment_status, source: session.metadata?.source || "cart" });
  } catch (error) {
    console.error("Stripe session lookup error:", error.message);
    res.status(404).json({ error: "Checkout session not found." });
  }
});

// Enhanced Chatbot Route with Knowledge Base
const MAX_MESSAGE_LENGTH = 1000;
const MAX_HISTORY_TURNS = 20;

// Common questions answered straight from the knowledge base
const knowledgeRoutes = [
  { key: "website_info", pattern: /\b(what is|about) (decor[- ]?deck|this (web)?site|your (web)?site|your (company|store))\b/ },
  { key: "ar_features", pattern: /\b(ar features?|augmented reality|try in ar)\b/ },
  { key: "policies", pattern: /\b(return policy|returns|refunds?|warranty|shipping|delivery)\b/ },
  { key: "products", pattern: /\b(categories|materials|what (products|do you sell))\b/ },
];

// Keeps only well-formed text turns that Gemini accepts: starts with "user",
// alternates roles, ends with "model", and is capped in length.
function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];

  const turns = [];
  for (const turn of history.slice(-MAX_HISTORY_TURNS)) {
    const text = turn?.parts?.[0]?.text;
    if ((turn?.role !== "user" && turn?.role !== "model") || typeof text !== "string") continue;
    const expectedRole = turns.length % 2 === 0 ? "user" : "model";
    if (turn.role !== expectedRole) continue;
    turns.push({ role: turn.role, parts: [{ text: text.slice(0, 4000) }] });
  }
  if (turns.length % 2 === 1) turns.pop();
  return turns;
}

app.post("/api/chat", jsonLimiter(20, "Too many messages. Please wait a minute and try again."), async (req, res) => {
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ error: `Message must be at most ${MAX_MESSAGE_LENGTH} characters.` });
  }

  const chatHistory = sanitizeHistory(req.body.chatHistory);
  const lowerMessage = message.toLowerCase();

  const route = knowledgeRoutes.find(({ pattern }) => pattern.test(lowerMessage));
  if (route) {
    return respondWithKnowledge(res, route.key, message, chatHistory);
  }

  if (!chatModel) {
    return res.status(503).json({ error: "The assistant is currently unavailable." });
  }

  try {
    // For other questions, use Gemini with the knowledge base as system context
    const chat = chatModel.startChat({ history: chatHistory });
    const result = await chat.sendMessage(message);
    const text = result.response.text();

    res.json({
      response: text,
      chatHistory: [
        ...chatHistory,
        { role: "user", parts: [{ text: message }] },
        { role: "model", parts: [{ text }] }
      ]
    });

  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({
      error: "Sorry, I encountered an issue.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

// Helper function to respond with knowledge base content
function respondWithKnowledge(res, knowledgeKey, message, chatHistory) {
  const response = formatKnowledgeResponse(knowledgeBase[knowledgeKey]);
  res.json({
    response,
    chatHistory: [
      ...chatHistory,
      { role: "user", parts: [{ text: message }] },
      { role: "model", parts: [{ text: response }] }
    ]
  });
}

// Format knowledge base responses in a natural way
function formatKnowledgeResponse(knowledge) {
  if (typeof knowledge === 'string') {
    return knowledge;
  }

  if (Array.isArray(knowledge)) {
    return knowledge.join(', ');
  }

  if (typeof knowledge === 'object') {
    return Object.entries(knowledge).map(([key, value]) =>
      `${key}: ${formatKnowledgeResponse(value)}`
    ).join('\n');
  }

  return JSON.stringify(knowledge);
}

// JSON errors (malformed bodies, oversized payloads) without stack traces
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status >= 500 ? "Internal server error." : "Invalid request." });
});

// 14-minute wake-up call to keep Render free tier awake (spins down after 15 minutes of inactivity)
const WAKE_UP_INTERVAL_MS = (parseInt(process.env.PING_INTERVAL_MINUTES, 10) || 14) * 60 * 1000;

function setupWakeUpCall() {
  const url =
    process.env.RENDER_EXTERNAL_URL ||
    process.env.SERVER_URL ||
    process.env.RENDER_URL ||
    (process.env.RENDER_SERVICE_NAME ? `https://${process.env.RENDER_SERVICE_NAME}.onrender.com` : null);

  if (!url) {
    console.log("[Keep-Alive] RENDER_EXTERNAL_URL or SERVER_URL not defined. Skipping self-ping (set RENDER_EXTERNAL_URL or SERVER_URL to enable).");
    return;
  }

  const pingUrl = `${url.replace(/\/+$/, "")}/ping`;
  const intervalMinutes = Math.round(WAKE_UP_INTERVAL_MS / 60000);
  console.log(`[Keep-Alive] Wake-up ping service initialized for ${pingUrl} (every ${intervalMinutes} minutes).`);

  setInterval(async () => {
    try {
      const response = await fetch(pingUrl);
      console.log(`[Keep-Alive] (${new Date().toLocaleTimeString()}) Ping sent to ${pingUrl} - Status: ${response.status}`);
    } catch (err) {
      console.error(`[Keep-Alive] (${new Date().toLocaleTimeString()}) Ping failed:`, err.message);
    }
  }, WAKE_UP_INTERVAL_MS);
}

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  setupWakeUpCall();
});
