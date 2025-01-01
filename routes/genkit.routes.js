const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genkitRouter = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GENKIT_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Define routes
genkitRouter.post("/genkit", async (req, res) => {
  const prompt = req.body.input;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const result = await model.generateContent(
      `Answer this ${prompt}, but only if it is related to blockchain and smart contract development and IPFS development but don't force them into it directly. Be friendly and you can be flexible on answering answers.`
    );

    res.json({ response: result.response.text() });
  } catch (error) {
    res.status(500).json({ error: "Error generating text" });
  }
});

module.exports = genkitRouter;
