# Decor-Deck

Decor-Deck is a furniture website with:

* Product browsing and a cart
* Stripe payment checkout (prices are set by the server, never the browser)
* Gemini-powered AI chatbot
* Knowledge-base driven chatbot responses
* Clerk authentication (sign-in required for checkout)
* Static HTML pages served using Express

## Tech Stack

* Node.js (20.9+)
* Express.js
* Clerk (`@clerk/express` + ClerkJS)
* Stripe
* Google Gemini AI
* helmet, express-rate-limit
* dotenv

## Project Structure

```text
project/
├── public/                    # Static frontend (HTML, CSS, JS, images)
│   ├── index.html             # Home page + chatbot
│   ├── shop.html, shop2.html, shop3.html
│   ├── designer.html          # Hire a designer (served at /Hire)
│   ├── subscription.html      # AI design plans (Stripe checkout)
│   ├── success.html           # Confirms the Stripe payment, then clears the cart
│   ├── cancel.html
│   └── js/
│       ├── script.js          # Navbar, profile menu, cart (localStorage)
│       ├── cart.js            # "Buy Now" -> POST /stripe-checkout
│       ├── inspect.js         # Product preview popups (shop.html)
│       └── auth.js            # Clerk sign-in / profile menu, session tokens
│
├── products.json              # Product catalogue: the source of truth for prices
├── decor-deck-knowledge.json  # Chatbot knowledge base
├── server.js
├── render.yaml                # Render deployment blueprint
└── .env.example
```

## Local Setup

```bash
npm install
cp .env.example .env   # then fill in the keys
npm run dev            # auto-restarts on changes (or: npm start)
```

Then visit `http://localhost:3000`.

## Environment Variables

| Variable         | Required | Description |
| ---------------- | -------- | ----------- |
| `CLERK_PUBLISHABLE_KEY` | Yes, for sign-in | Clerk publishable key (`pk_...`). Sent to the browser via `/api/config`. |
| `CLERK_SECRET_KEY` | Yes, for sign-in | Clerk secret key (`sk_...`). Server only. Without Clerk keys, sign-in and checkout return 503. |
| `STRIPE_API`     | Yes, for checkout | Stripe secret key. Without it, checkout returns 503. |
| `GEMINI_API_KEY` | Yes, for the chatbot | Gemini API key. Without it, only knowledge-base answers work. |
| `GEMINI_MODEL`   | No | Defaults to `gemini-2.5-flash`. |
| `PUBLIC_URL`     | No | Public site URL for Stripe redirects and product images. Defaults to `RENDER_EXTERNAL_URL`, then the request host. |
| `NODE_ENV`       | No | `development` includes chatbot error details in API responses. |
| `PING_INTERVAL_MINUTES` | No | Keep-alive ping interval on Render (default 14). |

> Never commit `.env` or put keys in `server.js` or frontend code.

## Deployment (Render)

1. In Render, create a **Blueprint** from this repository (it reads `render.yaml`), or create a Web Service with build command `npm ci --omit=dev` and start command `npm start`.
2. Set `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `STRIPE_API` and `GEMINI_API_KEY` in the service's environment.
3. For production, use a Clerk production instance and add your domain in the Clerk Dashboard.

GitHub Actions (`.github/workflows/ci.yml`) runs a syntax check and a smoke test on every push and pull request.

## API Routes

### Pages

| Method | Route      | Description             |
| ------ | ---------- | ----------------------- |
| GET    | `/`        | Home page               |
| GET    | `/about`   | About page              |
| GET    | `/success` | Successful payment page |
| GET    | `/cancel`  | Cancelled payment page  |
| GET    | `/Hire`    | Designer page           |
| GET    | `/ping`    | Health check            |

### Stripe

```http
POST /stripe-checkout
```

Requires a signed-in Clerk user: send the session token as `Authorization: Bearer <token>` (the frontend does this via `getAuthToken()`). Returns 401 when signed out.

The server looks up each product by name in `products.json` and uses its own price. Quantities must be whole numbers from 1 to 20.

```json
{
  "items": [
    { "title": "Grey Chair", "quantity": 2 }
  ]
}
```

Returns `{ "url": "<Stripe Checkout URL>" }`, or `{ "error": "..." }` with status 400/503/502. Rate limited to 10 requests per minute per IP.

```http
GET /api/checkout-session/:id
```

Used by `success.html` to confirm the payment. Returns `{ "paymentStatus": "paid", "source": "cart" }`.

### AI Chatbot

```http
POST /api/chat
```

```json
{
  "message": "What is Decor-Deck?",
  "chatHistory": []
}
```

Returns `{ "response": "...", "chatHistory": [...] }`. Messages are limited to 1000 characters, and only the last 20 history turns are used. Rate limited to 20 requests per minute per IP.

## Knowledge Base

The chatbot answers common questions (about the store, AR features, policies, product categories and materials) directly from `decor-deck-knowledge.json`. Other questions go to Gemini with the knowledge base and product list as system context.

## Changing Products or Prices

Update `products.json` **and** the matching product cards in the HTML pages. The product name is used as the lookup key, so it must match the card's title (case-insensitive).
