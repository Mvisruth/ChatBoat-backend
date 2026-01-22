  import express from "express";
  import dotenv from "dotenv";
  import Groq from "groq-sdk";
  import mongoose from "mongoose";
  import cors from "cors";

  dotenv.config();

  const app = express();
  app.use(express.json());
  
  app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://chat-boat-frontend.vercel.app",
    ],
  })
);

  const port = 3000;
  // ✅ MongoDB connected
  mongoose
    .connect(process.env.MONGO_URL as string)
    .then(() => console.log("MongoDB Connectedd"))
    .catch((err) => console.log("MongoDB Error:", err));

  // ✅ PLACE HERE (Schema + Model)
  const ChatSchema = new mongoose.Schema(
    {
      prompt: String,
      reply: String,
    },
    { timestamps: true }
  );

  const Chat = mongoose.model("Chat", ChatSchema);


  // ✅ Groq client
  const client = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  // Test API
  app.get("/", (req, res) => {
      console.log("inside health check");
    res.send("Server Okk");
  });

  // Chatbot API
  app.post("/api/chat", async (req, res) => {
      console.log("inside api chat");
    try {
      const input = req.body.prompt;

      if (!input) {
        return res.json({ error: "Prompt is required" });
      }

      const completion = await client.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: input }],
      });

      const message = completion.choices?.[0]?.message?.content || "No reply";

      // ✅ Save chat to MongoDB
      await Chat.create({
        prompt: input,
        reply: message,
      });

      res.json({ reply: message });
    } catch (err) {
      console.log(err);
      res.json({ error: "Chat failedd" });
    }
  });

  // Start server
  app.listen(port, () => {
    console.log("Server running at http://localhost:3000");
  });
