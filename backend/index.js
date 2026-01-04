const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");

const app = express();
app.use(cors());
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 🔥 TẠO PAYMENT INTENT
app.post("/api/payments/create", async (req, res) => {
  try {
    const { amount, currency = "vnd", bookingId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount, // ví dụ 120000
      currency,
      metadata: { bookingId },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (_, res) => {
  res.send("Payment API is running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 Payment API running on port", PORT));
