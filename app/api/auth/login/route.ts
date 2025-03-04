import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { generateToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { serialize } from "cookie";
import { Admin } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { email, password }: { email: string; password: string } =
    await req.json();

  try {
    const result = await db.query<Admin>(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    const admin: Admin | undefined = result.rows[0];

    if (!admin) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate token
    const token = await generateToken({ id: admin.id, email: admin.email });
    const cookie = serialize("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600,
      path: "/",
    });

    const response = NextResponse.json(
      { message: "Login successful" },
      { status: 200 }
    );
    response.headers.set("Set-Cookie", cookie);
    return response;
  } catch (error) {
    console.error("Error logging in:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
