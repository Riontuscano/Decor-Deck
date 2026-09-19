# Decor-Deck

Decor-Deck is a furniture website with:

* Product browsing
* Stripe payment checkout
* Gemini-powered AI chatbot
* Knowledge-base driven chatbot responses
* Static HTML pages served using Express

## Tech Stack

* Node.js
* Express.js
* Stripe
* Google Gemini AI
* CORS
* dotenv

## Project Setup

### 1. Clone the project

```bash
git clone <your-repository-url>
cd <project-folder>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env`

Create a `.env` file in the root directory:

```env
STRIPE_API=your_stripe_secret_key
```

> Keep your API keys private. Do not commit `.env` to GitHub.

Add `.env` to `.gitignore`:

```gitignore
node_modules/
.env
```

### 4. Check required files

Make sure your project contains:

```text
project/
├── public/
│   ├── index.html
│   ├── success.html
│   ├── cancel.html
│   ├── about.html
│   └── designer.html
│
├── decor-deck-knowledge.json
├── server.js
├── package.json
├── .env
└── README.md
```

### 5. Start the server

For normal execution:

```bash
node server.js
```

The server will start at:

```text
http://localhost:3000
```

Open this URL in your browser.

## Development

If you have `nodemon` installed:

```bash
npm run dev
```

Example `package.json` scripts:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

## API Routes

### Pages

| Method | Route      | Description             |
| ------ | ---------- | ----------------------- |
| GET    | `/`        | Home page               |
| GET    | `/about`   | About page              |
| GET    | `/success` | Successful payment page |
| GET    | `/cancel`  | Cancelled payment page  |
| GET    | `/Hire`    | Designer page           |

### Stripe

```http
POST /stripe-checkout
```

Example request:

```json
{
  "items": [
    {
      "title": "Modern Chair",
      "price": "4999",
      "quantity": 1,
      "productImg": "https://example.com/chair.jpg"
    }
  ]
}
```

The API returns a Stripe Checkout URL.

### AI Chatbot

```http
POST /api/chat
```

Example request:

```json
{
  "message": "What is Decor-Deck?",
  "chatHistory": []
}
```

Example response:

```json
{
  "response": "Decor-Deck is a furniture store...",
  "chatHistory": []
}
```

## Knowledge Base

The chatbot uses:

```text
decor-deck-knowledge.json
```

This file contains information about:

* Website
* Products
* Categories
* Materials
* AR features
* Policies
* Shipping
* Warranty
* Returns

Common questions are answered directly from the knowledge base. Other questions are processed using Google Gemini with the knowledge base provided as context.

## Environment Variables

| Variable     | Description             |
| ------------ | ----------------------- |
| `STRIPE_API` | Stripe secret API key   |
| `NODE_ENV`   | Application environment |

Example:

```env
STRIPE_API=sk_test_xxxxxxxxxxxxx
NODE_ENV=development
```

## Important Security Note

Do **not** hard-code API keys inside `server.js`.

For example, avoid:

```js
const genAI = new GoogleGenerativeAI("YOUR_API_KEY");
```

Instead, use an environment variable:

```env
GEMINI_API_KEY=your_gemini_api_key
```

And in `server.js`:

```js
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
```

Then your initialization becomes:

```js
const stripeGateway = stripe(process.env.STRIPE_API);

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);
```

## Running the Project

After configuring `.env`:

```bash
npm install
npm start
```

Then visit:

```text
http://localhost:3000
```

## Notes

* Stripe test keys should be used during development.
* Never expose Stripe secret keys or Gemini API keys in frontend code.
* Make sure `decor-deck-knowledge.json` exists in the project root.
* The application currently runs on port `3000`.
* For production deployment, update the Stripe success/cancel URLs from `localhost` to your deployed domain.
