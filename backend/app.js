app.post("/api/caption", upload.single("image"), async (req, res) => {
  try {
    const instruction = req.body.instruction || "Generate a creative caption";
    const imagePath = req.file.path;

    // Call Gemini API here with both image + instruction
    const caption = await generateCaptionWithGemini(imagePath, instruction);

    res.json({ caption });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
