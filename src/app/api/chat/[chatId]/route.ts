import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * ✅ GET /api/chat/[chatId]
 * Fetch a specific chat with messages
 */
export async function GET(
  req: Request,
  context: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await context.params;

    if (!chatId) {
      return NextResponse.json({ error: "Chat ID missing" }, { status: 400 });
    }

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { messages: true },
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json(chat);
  } catch (err: any) {
    console.error("❌ Error in GET /api/chat/[chatId]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * ✅ PATCH /api/chat/[chatId]
 * Rename chat or update metadata
 */
export async function PATCH(
  req: Request,
  context: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await context.params;
    const { title } = await req.json();

    const updatedChat = await prisma.chat.update({
      where: { id: chatId },
      data: { title },
    });

    return NextResponse.json(updatedChat);
  } catch (err: any) {
    console.error("❌ Error in PATCH /api/chat/[chatId]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * ✅ DELETE /api/chat/[chatId]
 * Delete chat and related messages
 */
export async function DELETE(
  req: Request,
  context: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await context.params;

    await prisma.message.deleteMany({ where: { chatId } });
    await prisma.chat.delete({ where: { id: chatId } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Error in DELETE /api/chat/[chatId]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
