import express from "express";
import dotenv from "dotenv";
import stripe from "stripe";
import bodyParser from "body-parser";
import cors from 'cors';
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';

dotenv.config();

const app = express();
const port = 3000;

// Initialize Stripe and Gemini
const stripeGateway = stripe(process.env.STRIPE_API);
const genAI = new GoogleGenerativeAI("AIzaSyBaxGYUSZqeGOrEj_mPQ94kCuuQ58YBn28");

// Load knowledge base
const knowledgeBase = JSON.parse(fs.readFileSync('./decor-deck-knowledge.json'));

// Middleware
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000", "https://checkout.stripe.com"],
  })
);

// Routes
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "public" });
});

app.get("/success", (req, res) => {
  res.sendFile("success.html", { root: "public" });
});

app.get("/about", (req, res) => {
  res.sendFile("about.html", { root: "public" });
});

app.get("/cancel", (req, res) => {
  res.sendFile("cancel.html", { root: "public" });
});

app.get("/Hire", (req, res) => {
  res.sendFile("designer.html", { root: "public" });
});

// Stripe Checkout Route
app.post("/stripe-checkout", async (req, res) => {
  try {
    if (!req.body || !req.body.items) {
      throw new Error("Invalid request body");
    }

    const lineItems = req.body.items.map((item) => {
      const unitAmount = parseInt(parseFloat(item.price) * 100);
      return {
        price_data: {
          currency: "inr",
          product_data: {
            name: item.title,
            images: [item.productImg],
          },
          unit_amount: unitAmount,
        },
        quantity: item.quantity,
      };
    });

    const session = await stripeGateway.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `http://localhost:3000/success.html`,
      cancel_url: `http://localhost:3000/cancel.html`,
      line_items: lineItems,
      billing_address_collection: "required",
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// Enhanced Chatbot Route with Knowledge Base
app.post("/api/chat", async (req, res) => {
  try {
    const { message, chatHistory = [] } = req.body;
    
    // Common questions handling using knowledge base
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('what is decor-deck') || 
        lowerMessage.includes('about this website') ||
        lowerMessage.includes('tell me about')) {
      return respondWithKnowledge(res, 'website_info', message, chatHistory);
    }

    if (lowerMessage.includes('ar feature') || 
        lowerMessage.includes('augmented reality')) {
      return respondWithKnowledge(res, 'ar_features', message, chatHistory);
    }

    if (lowerMessage.includes('return policy') || 
        lowerMessage.includes('warranty') ||
        lowerMessage.includes('shipping')) {
      return respondWithKnowledge(res, 'policies', message, chatHistory);
    }

    if (lowerMessage.includes('products') || 
        lowerMessage.includes('categories') ||
        lowerMessage.includes('materials')) {
      return respondWithKnowledge(res, 'products', message, chatHistory);
    }

    // For other questions, use Gemini with the knowledge base as context
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    // Start chat with knowledge base as initial context
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: `You are a customer service assistant for Decor-Deck furniture store. Here's important information: ${JSON.stringify(knowledgeBase)}. Use this to answer questions accurately.` }]
        },
        {
          role: "model",
          parts: [{ text: "Understood. I'll use the provided information to assist customers with Decor-Deck products and services." }]
        },
        ...chatHistory
      ]
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

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

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});