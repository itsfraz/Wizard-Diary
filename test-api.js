const API_KEY = "your_gemini_api_key_here";
const fetch = globalThis.fetch;

async function test(modelName) {
  console.log(`Testing ${modelName}...`);
  const payload = {
    contents: [{ parts: [{ text: "Hello" }] }],
  };

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error(`HTTP Error ${response.status}: ${errorData.error?.message || response.statusText}`);
  } else {
    const data = await response.json();
    console.log("Success:", data.candidates[0].content.parts[0].text);
  }
}

async function run() {
  await test("gemini-2.5-flash");
  await test("gemini-1.5-flash");
}

run();
