export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("Server-side Gemini API key is missing. Returning simulated response.");
    return res.status(200).json({ simulated: true, text: "Simulated AI response. Please add GEMINI_API_KEY to your server environment." });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const payload = { contents: [{ parts: [{ text: prompt }] }] };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemini API Error:", errorData);
      return res.status(response.status).json({ error: 'Failed to generate content' });
    }

    const data = await response.json();
    if (data.candidates && data.candidates[0]) {
      return res.status(200).json({ text: data.candidates[0].content.parts[0].text });
    }

    return res.status(500).json({ error: 'Invalid response format from Gemini API' });
  } catch (error) {
    console.error("Error communicating with Gemini:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
