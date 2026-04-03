import { NextRequest, NextResponse } from "next/server";
import { createEmployer, findEmployerByEmail } from "@/lib/employer-store";
import { createToken, SESSION_COOKIE_OPTIONS } from "@/lib/employer-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

const VALID_CODE = (process.env.EMPLOYER_ACCESS_CODE || "PATHFINDER2026").toUpperCase();

export async function POST(req: NextRequest) {
  try {
    const { email, password, accessCode } = await req.json();

    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }
    if (!accessCode?.trim() || accessCode.trim().toUpperCase() !== VALID_CODE) {
      return NextResponse.json({ error: "Invalid access code. Contact ingkar.shokan@scalekindai.com to get one." }, { status: 403 });
    }

    const existing = await findEmployerByEmail(email.trim());
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists. Sign in instead." }, { status: 409 });
    }

    const employer = await createEmployer(email.trim(), password);
    if (!employer) {
      return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
    }

    // Immediately approve — no pending flow needed
    const admin = getSupabaseAdmin();
    if (admin) {
      await admin.from("employer_accounts").update({ status: "approved", approved_at: new Date().toISOString() }).eq("id", employer.id);
    }

    const token = createToken({ id: employer.id, email: employer.email });
    const res = NextResponse.json({ success: true, employer: { id: employer.id, email: employer.email } });
    res.cookies.set(SESSION_COOKIE_OPTIONS(token));
    return res;
  } catch (e) {
    console.error("Employer register error:", e);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
