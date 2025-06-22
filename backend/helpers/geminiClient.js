const axios = require('axios');
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function generateGeminiResponse(promptText) {
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const response = await axios.post(url, {
      contents: [
        {
          parts: [{ text: promptText }],
        },
      ],
    });

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || "❌ Gemini returned an empty response.";
  } catch (error) {
    console.error('❌ Gemini HTTP Error:', error.response?.data || error.message);
    return "⚠️ Failed to get a response from Gemini.";
  }
}

module.exports = generateGeminiResponse;
