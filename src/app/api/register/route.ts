
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("🟢 Received registration data:", body);

    const { name, email, password, confirmPassword } = body;

    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("🔐 Hashed password created successfully.");

    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    console.log("✅ User registered:", newUser.email);
    return NextResponse.json({ message: "Registration successful!" }, { status: 201 });
  } catch (error: any) {
    console.error("❌ Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong: " + error.message },
      { status: 500 }
    );
  }
}
