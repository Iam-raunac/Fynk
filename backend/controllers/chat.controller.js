import { GoogleGenAI } from "@google/genai";
import ChatMessage from "../models/chat.model.js";
import {
  getGeminiApiKey,
  getGeminiModel,
} from "../config/env.js";

class GeminiConfigError extends Error {
  constructor() {
    super(
      "Gemini API key is missing. Set GEMINI_API_KEY in backend/.env or the project root .env."
    );
    this.name = "GeminiConfigError";
  }
}

let genAI;

const getGeminiClient = () => {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    throw new GeminiConfigError();
  }

  if (!genAI) {
    genAI = new GoogleGenAI({
      apiKey,
      vertexai: false,
    });
  }

  return genAI;
};

export const sendMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = req.user;
    const { message } = req.body;
    const trimmedMessage = message?.trim();

    if (!trimmedMessage) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    const ai = getGeminiClient();

    const systemPrompt = `
You are a friendly personal assistant on Fynk, a social media platform.
You are talking to ${user.name} (username: @${user.username}).

Your personality:
- Talk like a real friend, not a robot. Be warm, casual and fun.
- Use short sentences. Don't be too formal.
- If the user writes in Hindi, reply in Hindi.
- If the user writes in English, reply in English.
- If they mix Hindi and English (Hinglish), you also mix naturally.
- Use light emojis occasionally to feel human, but don't overdo it.
- Remember things the user tells you in this conversation.
- Never say you are an AI unless directly asked. Just be a helpful friend.

User's name: ${user.name}
User's bio: ${user.bio || "not provided"}
    `.trim();

    await ChatMessage.create({
      userId,
      role: "user",
      content: trimmedMessage,
    });

    const history = await ChatMessage.find({ userId })
      .sort({ createdAt: 1 })
      .limit(20)
      .lean();

    const chatHistory = history.slice(0, -1).map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const chat = ai.chats.create({
      model: getGeminiModel(),
      config: { systemInstruction: systemPrompt },
      history: chatHistory,
    });

    const result = await chat.sendMessage({ message: trimmedMessage });
    const reply = result.text;

    if (!reply) {
      throw new Error("Gemini returned an empty response.");
    }

    await ChatMessage.create({ userId, role: "assistant", content: reply });

    res.status(200).json({ reply });
  } catch (error) {
    console.error("Chat error:", error);

    if (error instanceof GeminiConfigError) {
      return res.status(500).json({ error: error.message });
    }

    res.status(500).json({ error: "Something went wrong" });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const messages = await ChatMessage.find({ userId })
      .sort({ createdAt: 1 })
      .limit(50)
      .lean();

    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ error: "Could not fetch history" });
  }
};

export const clearChatHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    await ChatMessage.deleteMany({ userId });
    res.status(200).json({ message: "Chat history cleared" });
  } catch (error) {
    res.status(500).json({ error: "Could not clear history" });
  }
};
