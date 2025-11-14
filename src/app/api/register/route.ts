import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { name, email, password, confirmPassword } = await req.json();

    // ✅ Validation
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // ✅ Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    // ✅ Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create new user with hashed password
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    console.log("✅ User registered successfully:", newUser.email);
    return NextResponse.json({ 
      message: "Registration successful", 
      user: { id: newUser.id, email: newUser.email, name: newUser.name } 
    }, { status: 201 });
  } catch (err: any) {
    console.error("❌ Register API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
