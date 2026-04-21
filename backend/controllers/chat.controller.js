import { GoogleGenerativeAI } from "@google/generative-ai";
import ChatMessage from "../models/chat.model.js";
import User from "../models/user.model.js";

import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI("AIzaSyDSqra3_j-wue_NBTVNaNabSXWT6pJsUWU");

export const sendMessage = async (req, res) => {
  try {
    const userId = req.user._id;        // ✅ _id not .id
    const user = req.user;              // ✅ already fetched in middleware, reuse it
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

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

    // Save user message first
    await ChatMessage.create({ userId, role: "user", content: message });

    // Fetch last 20 messages for memory
    const history = await ChatMessage.find({ userId })
      .sort({ createdAt: 1 })
      .limit(20)
      .lean();

    // Format history for Gemini (exclude last message — that's current one)
    const chatHistory = history.slice(0, -1).map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const model = genAI.getGenerativeModel({
      model: "gemini-3.0-flash-preview",
      systemInstruction: systemPrompt,
    });

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    // Save assistant reply
    await ChatMessage.create({ userId, role: "assistant", content: reply });

    res.status(200).json({ reply });

  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user._id;        // ✅ _id not .id
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
    const userId = req.user._id;        // ✅ _id not .id
    await ChatMessage.deleteMany({ userId });
    res.status(200).json({ message: "Chat history cleared" });
  } catch (error) {
    res.status(500).json({ error: "Could not clear history" });
  }
};