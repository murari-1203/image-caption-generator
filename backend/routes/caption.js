// routes/caption.js
import express from "express";
import multer from "multer";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();
const router = express.Router();

// configure multer (file upload)
const upload = multer({ dest: path.join(process.cwd(), "uploads/") });

// -------------------------------
// FUNCTION: Call Gemini API
// -------------------------------
async function callGeminiGenerateCaption(imageBase64) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.MODEL_NAME || "gemini-1.5-flash";

  if (!apiKey) throw new Error("❌ GEMINI_API_KEY not found in .env file");

  // Correct Gemini endpoint for developer API
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // Request body: image input + prompt
  const body = {
    contents: [
      {
        parts: [
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: imageBase64,
            },
          },
          { text: "Write a short and meaningful caption for this image." },
        ],
      },
    ],
  };

  // Send POST request
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API Error ${response.status}: ${errText}`);
  }

  const result = await response.json();

  // Extract caption text
  const caption =
    result?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "No caption generated.";

  return caption;
}

// -------------------------------
// POST route: /api/caption
// -------------------------------
router.post("/caption", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const filePath = req.file.path;
    const fileBuffer = await fs.readFile(filePath);
    const imageBase64 = fileBuffer.toString("base64");

    // Call Gemini API
    const caption = await callGeminiGenerateCaption(imageBase64);

    // Delete temporary image
    await fs.unlink(filePath).catch(() => {});

    res.json({ caption });
  } catch (error) {
    console.error("❌ Error generating caption:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
