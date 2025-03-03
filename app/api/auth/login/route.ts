import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { generateToken } from "@/lib/auth";
import { getAdminByEmail } from "@/lib/db";
import { serialize } from "cookie";

export async function POST(req: NextRequest) {
  const { email, password }: { email: string; password: string } =
    await req.json();

  const admin = getAdminByEmail(email);
  if (!admin) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const passwordMatch = await bcrypt.compare(password, admin.password);
  if (!passwordMatch) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await generateToken({ id: admin.id, email: admin.email }); // Await async
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
}
