const express = require("express");
const cors = require("cors");
const axios = require("axios");
const crypto = require("crypto");
const moment = require("moment");
const dotenv = require("dotenv");
dotenv.config({ override: true }); // ép load lại
console.log("🔑 GEMINI KEY =", process.env.GEMINI_API_KEY);
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/* ===== ZALOPAY SANDBOX CONFIG ===== */
const config = {
  app_id: 2554,
  key1: "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn",
  key2: "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf",
  endpoint: "https://sb-openapi.zalopay.vn/v2/create",
};

/* ===== TEST ROUTE ===== */
app.get("/", (req, res) => {
  res.send("🔥 Backend OK - ZaloPay + AI Ready");
});
/* ================== AI CHATBOT =================== */
app.post("/api/ask-ai", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Missing question" });
    }
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Bạn là chatbot hỗ trợ khách hàng cho ứng dụng đặt vé phim.
Chỉ trả lời bằng tiếng Việt, ngắn gọn, dễ hiểu.

Câu hỏi:
${question}`,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
      }
    );
    console.log("🔥 AI RESPONSE:", response.data);

    const text =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text ??
      "Xin lỗi, mình chưa trả lời được câu hỏi này.";

    res.json({ text });
  } catch (err) {
    console.error("❌ AI ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: "AI service failed" });
  }
});
/* ================= ZALOPAY ======================= */
app.post("/api/payment/create", async (req, res) => {
  const { bookingId, amount } = req.body;

  if (!bookingId || !amount) {
    return res.status(400).json({ error: "Missing bookingId or amount" });
  }

  const embed_data = {
    redirecturl: "myapp://payment-success",
  };

  const order = {
    app_id: config.app_id,
    app_trans_id: moment().format("YYMMDD") + "_" + bookingId,
    app_user: "expo_user",
    app_time: Date.now(),
    amount,
    item: JSON.stringify([{ bookingId }]),
    embed_data: JSON.stringify(embed_data),
    description: "Thanh toán vé xem phim",
    callback_url: "http://10.41.124.71:8080/api/payment/callback",
  };

  const data =
    order.app_id +
    "|" +
    order.app_trans_id +
    "|" +
    order.app_user +
    "|" +
    order.amount +
    "|" +
    order.app_time +
    "|" +
    order.embed_data +
    "|" +
    order.item;

  order.mac = crypto
    .createHmac("sha256", config.key1)
    .update(data)
    .digest("hex");

  try {
    const result = await axios.post(config.endpoint, null, {
      params: order,
      timeout: 30000,
    });

    console.log(" ZALOPAY CREATE RESULT:", result.data);
    return res.json(result.data);
  } catch (err) {
    console.error(" ZALOPAY ERROR:", err.response?.data || err.message);
    return res.status(500).json({ error: "ZaloPay create failed" });
  }
});

/* ===== CALLBACK ===== */
app.post("/api/payment/callback", (req, res) => {
  console.log("🔥 ZALOPAY CALLBACK RECEIVED");
  console.log(req.body);

  res.json({ return_code: 1, return_message: "success" });
});
/* ===== START SERVER ===== */
app.listen(8080, "0.0.0.0", () => {
  console.log("✅ Backend running at http://0.0.0.0:8080");
});
