import express from "express";
import dotenv from "dotenv";
import stripe from "stripe";
import bodyParser from "body-parser";
import cors from 'cors';

dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.use(express.static("public"));
app.use(express.json());

// const cors = require('cors');
app.use(
  cors({
    origin: ["https://decor-deck.onrender.com"],
  })
);

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "public" });
});
//sucess
app.get("/success", (req, res) => {
  res.sendFile("success.html", { root: "public" });
});
//cancel
app.get("/cancel", (req, res) => {
  res.sendFile("cancel.html", { root: "public" });
});

// stripe Payment Gateway

let stripeGateway = stripe(process.env.stripe_api);

app.post("/stripe-checkout", async (req, res) => {
  try {
    // Ensure req.body and req.body.items are defined
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

    // Create Checkout session
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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
