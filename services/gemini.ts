const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

// ✅ MODEL ĐÚNG THEO listModels
const API_URL =
  "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=" +
  API_KEY;

export async function askGemini(question: string): Promise<string> {
  const body = {
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
  };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  const data = await res.json();
  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text ??
    "Xin lỗi, mình chưa trả lời được câu hỏi này."
  );
}
