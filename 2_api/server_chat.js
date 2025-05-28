/**
 * WhatsApp Chatbot with OpenAI Integration
 * 
 * This tutorial demonstrates how to build a WhatsApp chatbot
 * using the WhatsApp Business API, Express, and OpenAI.
 */
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import axios from "axios";
import OpenAI from "openai";

/* ─────────────────── ENV & INIT ─────────────────── */
const app = express();
app.use(express.json());

const {
  WEBHOOK_VERIFY_TOKEN,
  GRAPH_API_TOKEN,
  PORT,
  OPENAI_API_KEY,
} = process.env;

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

/* ─────────────────── SYSTEM PROMPT ─────────────────── */
const SYSTEM_PROMPT = `
You are a helpful virtual assistant for WhatsApp users. The current date is ${new Date().toLocaleDateString()}.

Guidelines for your responses:
• Be concise, friendly, and conversational
• When users ask questions, provide accurate and helpful information
• If you don't know something, be honest about it
• Remember that you're representing the brand, so maintain a professional tone
• Each message should be self-contained and clear
• Keep responses short and to the point - WhatsApp is a messaging platform

You can help users with:
• Answering questions about products or services
• Providing general information
• Assisting with basic troubleshooting
• Directing users to resources

If you detect that a user needs human assistance, politely let them know
that you'll connect them with a human agent soon.
`.trim();

// In-memory message store (replace with your database in production)
const messageStore = {};

/* ─────────────────── WEBHOOK ─────────────────── */
app.post("/webhook", async (req, res) => {
  console.log("Incoming webhook message:", JSON.stringify(req.body, null, 2));

  const change = req.body.entry?.[0]?.changes?.[0]?.value;
  if (!Array.isArray(change?.messages) || change.messages.length === 0) {
    console.log("⚪️  non‑message event, skipping");
    return res.sendStatus(200);
  }

  const message = change.messages[0];
  const phoneId = change?.metadata.phone_number_id; // our business number
  const userId = message.from; // user's phone number
  const userName = change?.contacts?.[0]?.profile?.name || "User";

  // Initialize user's message history if it doesn't exist
  if (!messageStore[userId]) {
    messageStore[userId] = [];
  }

  /* ─────────────────── IMAGE HANDLING ─────────────────── */
  if (message?.type === "image") {
    const mediaId = message.image.id;
    try {
      // Get media URL
      const { data: mediaMeta } = await axios.get(
        `https://graph.facebook.com/v18.0/${mediaId}`,
        {
          params: { fields: "url,mime_type" },
          headers: { Authorization: `Bearer ${GRAPH_API_TOKEN}` },
        }
      );
      const mediaUrl = mediaMeta.url;
      const mime = mediaMeta.mime_type;

      // Download media content
      const mediaResp = await axios.get(mediaUrl, {
        responseType: "arraybuffer",
        headers: { Authorization: `Bearer ${GRAPH_API_TOKEN}` },
      });
      const b64 = Buffer.from(mediaResp.data, "binary").toString("base64");
      const dataUri = `data:${mime};base64,${b64}`;

      // Process image with OpenAI Vision
      const vision = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Describe this image briefly and respond to any visible text or content.",
              },
              { type: "image_url", image_url: { url: dataUri } },
            ],
          },
        ],
      });
      const responseText = vision.choices?.[0]?.message?.content ?? "I couldn't analyze this image properly.";

      // Store messages in memory
      messageStore[userId].push({ role: "user", content: "[Image sent]" });
      messageStore[userId].push({ role: "assistant", content: responseText });

      // Send response back to WhatsApp
      await axios.post(
        `https://graph.facebook.com/v18.0/${phoneId}/messages`,
        {
          messaging_product: "whatsapp",
          to: userId,
          text: { body: responseText },
          context: { message_id: message.id },
        },
        { headers: { Authorization: `Bearer ${GRAPH_API_TOKEN}` } }
      );
    } catch (error) {
      console.error("Error processing image:", error);
      // Send error message to user
      await axios.post(
        `https://graph.facebook.com/v18.0/${phoneId}/messages`,
        {
          messaging_product: "whatsapp",
          to: userId,
          text: { body: "Sorry, I couldn't process that image." },
          context: { message_id: message.id },
        },
        { headers: { Authorization: `Bearer ${GRAPH_API_TOKEN}` } }
      );
    }

    return res.sendStatus(200);
  }

  /* ─────────────────── TEXT HANDLING ─────────────────── */
  if (message?.type === "text") {
    try {
      // Save user message to history
      messageStore[userId].push({
        role: "user",
        content: message.text.body,
      });

      // Keep only the last 20 messages for context
      const recentMessages = messageStore[userId].slice(-20);

      // Call OpenAI for response
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...recentMessages,
        ],
      });

      const botResponse = completion.choices[0].message.content;

      // Save bot response to history
      messageStore[userId].push({
        role: "assistant",
        content: botResponse,
      });

      // Send WhatsApp reply
      await axios.post(
        `https://graph.facebook.com/v18.0/${phoneId}/messages`,
        {
          messaging_product: "whatsapp",
          to: userId,
          text: { body: botResponse },
          context: { message_id: message.id },
        },
        { headers: { Authorization: `Bearer ${GRAPH_API_TOKEN}` } }
      );

      // Mark message as read
      await axios.post(
        `https://graph.facebook.com/v18.0/${phoneId}/messages`,
        {
          messaging_product: "whatsapp",
          status: "read",
          message_id: message.id,
        },
        { headers: { Authorization: `Bearer ${GRAPH_API_TOKEN}` } }
      );
    } catch (error) {
      console.error("Error processing text message:", error);
    }
  }

  res.sendStatus(200);
});

/* ─────────────────── VERIFY ENDPOINTS ─────────────────── */
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
    res.status(200).send(challenge);
    console.log("Webhook verified successfully!");
  } else {
    res.sendStatus(403);
  }
});

app.get("/", (req, res) => {
  res.send(`<pre>
  ====================================
  WhatsApp Chatbot Tutorial
  ====================================
  
  This server implements a WhatsApp chatbot using:
  - WhatsApp Business API
  - Express.js
  - OpenAI API
  
  To get started:
  1. Set up your environment variables
  2. Configure your WhatsApp Business account
  3. Deploy this server
  4. Verify your webhook
  
  For more information, see the README.md
  </pre>`);
});

app.listen(PORT || 3000, () => {
  console.log(`Server is listening on port: ${PORT || 3000}`);
});
