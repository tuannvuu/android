export async function askGemini(question: string): Promise<string> {
  const res = await fetch("http://192.168.120.45:8080/api/ask-ai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question }),
  });

  if (!res.ok) {
    throw new Error("Backend AI error");
  }

  const data = await res.json();
  return data.text;
}
