import { NextRequest, NextResponse } from "next/server";

const ADMIN_USERNAME = "dylandibona";
const ADMIN_PASSWORD = "calliope05";

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const response = NextResponse.json({ success: true });

    // Set auth cookie (expires in 7 days)
    response.cookies.set("admin_auth", `${ADMIN_USERNAME}:${ADMIN_PASSWORD}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  }

  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}
