import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const backendDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

dotenv.config({ path: path.join(backendDir, ".env") });
dotenv.config({ path: path.resolve(backendDir, "..", ".env") });

export const getEnv = (key) => process.env[key]?.trim();

export const getGeminiApiKey = () =>
  getEnv("GEMINI_API_KEY") || getEnv("GOOGLE_API_KEY");

export const getGeminiModel = () =>
  getEnv("GEMINI_MODEL") || "gemini-2.5-flash";
