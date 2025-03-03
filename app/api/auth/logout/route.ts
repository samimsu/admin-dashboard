import { NextResponse } from "next/server";
import { serialize } from "cookie";

export async function POST() {
  const cookie = serialize("auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: -1,
    path: "/",
  });

  return NextResponse.json(
    { message: "Logged out" },
    {
      status: 200,
      headers: { "Set-Cookie": cookie },
    }
  );
}
