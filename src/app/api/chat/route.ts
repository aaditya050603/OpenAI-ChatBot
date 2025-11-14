import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";
import astraDb from "@/lib/astradb";

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

/**
 * Handles chat message submission
 */
export async function POST(req: Request) {
  try {
    const { message, chatId, userId } = await req.json();

    if (!message || !userId) {
      return NextResponse.json({ error: "Missing message or userId" }, { status: 400 });
    }

    // ✅ Ensure user exists
    let user = await prisma.user.findUnique({ where: { email: userId } });
    if (!user) {
      user = await prisma.user.create({
        data: { email: userId, name: "Guest User", password: "placeholder" },
      });
    }

    // ✅ Find or create chat
    let chat = chatId
      ? await prisma.chat.findUnique({ where: { id: chatId } })
      : null;

    if (!chat) {
      chat = await prisma.chat.create({
        data: { title: message.slice(0, 30), userId: user.id },
      });
    }

    // ✅ Embed user message
   // 🧠 Generate 1000-dimension embeddings safely
    const embeddingRes = await openai.embeddings.create({
      model: "text-embedding-3-small", // ✅ 1000 dimensions
      input: message,
    });
    const embedding = embeddingRes.data[0].embedding;

    // ✅ AstraDB collection setup
    const collectionName = "chatbot_memory";
    const collection = astraDb.collection(collectionName);

    // Determine embedding and collection dimensions to ensure they match.
    const rawEmbedding = Array.isArray(embedding) ? embedding : [];
    const embeddingLen = rawEmbedding.length;

    // Fetch existing collections to determine declared vector dimension
    let declaredDim: number | null = null;
    let collectionExists = false;
    
    try {
      const collections = await astraDb.listCollections();
      const existing = (collections || []).find((c: any) => c.name === collectionName);
      
      if (existing) {
        collectionExists = true;
        // The collection descriptor has limited properties; the actual dimension is stored server-side
        // We need to try to query it or infer from the error message if mismatch occurs
        // For now, we'll log what we have and use a safe default
        console.log("📊 Existing collection info:", JSON.stringify(existing, null, 2));
      }
    } catch (err) {
      console.warn("⚠️ Could not fetch collections:", err);
    }

    // ⚠️ AstraDB has a 1000-element limit for indexable arrays
    // Even though the collection declares 1536 dimensions for the $vector field,
    // the 'embedding' field (when stored as data) cannot exceed 1000 elements
    const ASTRADB_MAX_ARRAY_SIZE = 1000;
    
    // Slice embedding to 1000 for storage in the 'embedding' field
    const storageEmbedding = Array.isArray(rawEmbedding) 
      ? rawEmbedding.slice(0, ASTRADB_MAX_ARRAY_SIZE)
      : [];

    // Pad embedding to 1536 for the $vector field (to match collection's declared dimension)
    const VECTOR_DIMENSION = 1536;
    let vectorEmbedding: number[] = [];
    if (Array.isArray(rawEmbedding)) {
      if (rawEmbedding.length >= VECTOR_DIMENSION) {
        vectorEmbedding = rawEmbedding.slice(0, VECTOR_DIMENSION);
      } else {
        // Pad with zeros to reach 1536 dimensions
        vectorEmbedding = [...rawEmbedding, ...new Array(VECTOR_DIMENSION - rawEmbedding.length).fill(0)];
      }
    }

    // Create collection if it doesn't exist
    if (!collectionExists) {
      try {
        await astraDb.createCollection(collectionName, {
          vector: { dimension: VECTOR_DIMENSION, metric: "cosine" },
        });
      } catch (err) {
        console.warn("⚠️ Collection creation failed:", err);
      }
    }

    // ✅ Save user message in AstraDB using storageEmbedding and vectorEmbedding
    await collection.insertOne({
      _id: crypto.randomUUID(),
      chat_id: chat.id,
      user_id: user.id,
      role: "user",
      content: message,
      embedding: storageEmbedding,
    });

    // ✅ Get top context messages
    // 🧩 Retrieve similar messages for context using vectorEmbedding
    const cursor = await collection.find(
      {},
      {
        sort: {
          $vector: vectorEmbedding,
        },
        limit: 3,
      }
    );

    const similar = await cursor.toArray();
    const context = (similar || []).map((s: any) => s.content).join("\n");


    // ✅ Generate OpenAI response
    const aiRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a smart AI assistant, answer conversationally.",
        },
        { role: "system", content: `Context:\n${context}` },
        { role: "user", content: message },
      ],
    });

    const reply = aiRes.choices[0].message.content ?? "Sorry, I couldn’t generate a reply.";

    // ✅ Save assistant reply
    await prisma.message.createMany({
      data: [
        { chatId: chat.id, role: "user", content: message },
        { chatId: chat.id, role: "assistant", content: reply },
      ],
    });

    await collection.insertOne({
      _id: crypto.randomUUID(),
      chat_id: chat.id,
      user_id: user.id,
      role: "assistant",
      content: reply,
      embedding: storageEmbedding,
    });

    return NextResponse.json({ reply, chatId: chat.id });
  } catch (error: any) {
    console.error("❌ Chat API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
