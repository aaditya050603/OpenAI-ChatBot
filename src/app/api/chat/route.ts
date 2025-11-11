import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import astraDb from "@/lib/astradb";
import OpenAI from "openai";

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { message, chatId, userId } = await req.json();

    if (!message || !userId)
      return NextResponse.json({ error: "Missing message or userId" }, { status: 400 });

    console.log("🟢 Incoming message:", { message, chatId, userId });

    // 🧩 Ensure User exists (email-based userId)
    const user =
      (await prisma.user.findUnique({ where: { email: userId } })) ||
      (await prisma.user.create({
        data: { email: userId, name: "Guest User" },
      }));

    // 🧩 Find or create Chat linked to that user
    const chat =
      (chatId && (await prisma.chat.findUnique({ where: { id: chatId } }))) ||
      (await prisma.chat.create({
        data: { title: message.slice(0, 30), userId: user.id },
      }));

    // 🧩 Generate embedding
    const embeddingRes = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: message,
    });
    const embedding = embeddingRes.data[0].embedding;

    // 🧩 Connect to AstraDB
    const collection = astraDb.collection("chatbot_memory");

    // Ensure collection exists
    try {
      await collection.findOne({});
    } catch {
      console.log("⚙️ Creating Astra collection...");
      await astraDb.createCollection("chatbot_memory", {
        vector: { dimension: 1536, metric: "cosine" },
      });
    }

    // 🧩 Insert user message
    await collection.insertOne({
      _id: crypto.randomUUID(),
      chat_id: chat.id,
      user_id: user.id,
      role: "user",
      content: message,
      embedding,
    });

    // 🧩 Find context
    const results = await collection.find(null, {
      sort: { $vector: { path: "embedding", similarity: "cosine", value: embedding } },
      limit: 3,
    });

    const context = results.map((r: any) => r.content).join("\n");

    // 🧩 Generate AI reply
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful chatbot assistant." },
        { role: "system", content: `Context:\n${context}` },
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices[0].message.content ?? "";

    // 🧩 Save reply in DB and Astra
    await prisma.message.create({
      data: { chatId: chat.id, role: "assistant", content: reply },
    });

    await collection.insertOne({
      _id: crypto.randomUUID(),
      chat_id: chat.id,
      user_id: user.id,
      role: "assistant",
      content: reply,
      embedding,
    });

    console.log("✅ Chat complete.");
    return NextResponse.json({ chatId: chat.id, reply });
  } catch (err: any) {
    console.error("❌ /api/chat failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
