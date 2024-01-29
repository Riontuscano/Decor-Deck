import express from "express";
import dotenv from "dotenv";
import stripe from "stripe";

dotenv.config();

const app = express();

app.use(express.static("public"));
app.use(express.json());

// const cors = require('cors');
// app.use(cors({ origin: ['http://localhost:3000', 'https://checkout.stripe.com']}));

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


app.post('/stripe-checkout', async (req, res) => {
  const lineItems = req.body.items.map((item) => {
    const unitAmount = parseInt(parseFloat(item.price) * 100);

    console.log("item-price:", item.price);
    console.log("unitAmount:", unitAmount);
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: item.title,
          images: [item.productimg],
        },
        unit_amount: unitAmount,
      },
      quantity: item.quantity,
    };
  });
// Create Checkout session
const session = await stripeGateway.checkout.sessions.create({
    payment_method_types : ["card"],
    mode:"payment",
    success_url: `http://localhost:3000/success.html`,
    cancel_url: `http://localhost:3000/cancel.html`,
    line_items: lineItems,
    billing_address_collection:'required'
});
res.json(session.url);
});


app.listen(3000, () => {
  console.log("listening on port 3000...");
});
