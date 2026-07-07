const API_KEY = "your_groq_api_key_here";
const fetch = globalThis.fetch;

async function test() {
  console.log("Testing Groq...");
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "Provide highly accurate, factual, and correct answers. Keep responses short and direct (maximum 2-3 sentences)." },
        { role: "user", content: "Hello" }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error(`HTTP Error ${response.status}: ${JSON.stringify(errorData)}`);
  } else {
    const data = await response.json();
    console.log("Success:", data.choices[0].message.content);
  }
}

test();
