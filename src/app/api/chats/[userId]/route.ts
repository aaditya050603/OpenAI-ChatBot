import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * ✅ GET /api/chats/[userId]
 * Fetch all chats for a user (userId is email)
 */
export async function GET(
  req: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;

    if (!userId) {
      return NextResponse.json({ error: "User ID missing" }, { status: 400 });
    }

    // userId is actually the email, so find the user first
    const user = await prisma.user.findUnique({
      where: { email: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const chats = await prisma.chat.findMany({
      where: { userId: user.id },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1, // show only the last message in list preview
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(chats);
  } catch (err: any) {
    console.error("❌ Error in GET /api/chats/[userId]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
