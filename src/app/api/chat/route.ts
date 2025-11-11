import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import astraDb from "@/lib/astradb";
import OpenAI from "openai";

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { message, chatId, userId } = await req.json();

    // 🧩 Validate input
    if (!message || !userId)
      return NextResponse.json(
        { error: "Missing message or userId" },
        { status: 400 }
      );

    console.log("🟢 Incoming message:", { message, chatId, userId });

    // 🧩 Ensure the user exists (use email as identifier)
    const user =
      (await prisma.user.findUnique({ where: { email: userId } })) ||
      (await prisma.user.create({
        data: {
          email: userId,
          name: "Guest User",
          password: "guest123", // ✅ dummy password to satisfy Prisma
        },
      }));

    // 🧩 Find or create a chat for this user
    const chat =
      (chatId && (await prisma.chat.findUnique({ where: { id: chatId } }))) ||
      (await prisma.chat.create({
        data: { title: message.slice(0, 30), userId: user.id },
      }));

    // 🧩 Create embedding for the message
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

    // 🧩 Insert user message into AstraDB
    await collection.insertOne({
      _id: crypto.randomUUID(),
      chat_id: chat.id,
      user_id: user.id,
      role: "user",
      content: message,
      embedding,
    });

// 🧩 Retrieve similar messages for context
// 🧩 Retrieve similar messages for context (AstraDB SDK v1.3+)
    const cursor = await collection.find(
      {},
      {
        sort: { $vector: embedding }, // ✅ simplified new syntax
        limit: 3,
      }
    );

    // Convert cursor to array safely
    const results = await cursor.toArray();
    const context = results.map((r: any) => r.content).join("\n");


// 🧩 Generate an AI reply using context
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful chatbot assistant." },
        { role: "system", content: `Context:\n${context}` },
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices[0].message.content ?? "";

    // 🧩 Save reply in Prisma for relational history
    await prisma.message.create({
      data: { chatId: chat.id, role: "assistant", content: reply },
    });

    // 🧩 Store assistant reply in AstraDB
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
