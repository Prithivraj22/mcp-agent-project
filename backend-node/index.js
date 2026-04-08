require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

app.get("/health", (req, res) => res.json({ status: "ok", service: "node-orchestrator" }));

app.post("/api/chat", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "prompt is required" });

  try {
    const response = await axios.post(
      `${FASTAPI_URL}/agent/run`,
      { prompt },
      { timeout: 30000 }
    );
    res.json({ reply: response.data.reply });
  } catch (err) {
    console.error("FastAPI error:", err?.response?.data || err.message);
    res.status(500).json({
      error: "Agent service error",
      detail: err?.response?.data?.detail || err.message
    });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Node orchestrator running on port ${PORT}`));