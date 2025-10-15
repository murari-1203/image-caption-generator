// server.js
import express from "express";
import path from "path";
import dotenv from "dotenv";
import captionRouter from "./routes/caption.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(process.cwd(), "public")));
app.use("/api", captionRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
