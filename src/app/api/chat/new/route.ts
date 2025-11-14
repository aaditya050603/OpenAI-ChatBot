import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { userId, title } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const chat = await prisma.chat.create({
      data: {
        userId: user.id,
        title: title || "New Chat",
      },
    });

    return NextResponse.json({ chatId: chat.id, message: "Chat created" });
  } catch (error: any) {
    console.error("❌ /api/chat/new error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
