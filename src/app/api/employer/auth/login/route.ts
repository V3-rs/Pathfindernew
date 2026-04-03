import { NextRequest, NextResponse } from "next/server";
import { findEmployerByEmail } from "@/lib/employer-store";
import { hashPassword, createToken, SESSION_COOKIE_OPTIONS } from "@/lib/employer-auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const employer = await findEmployerByEmail(email.trim());
    if (!employer || employer.password_hash !== hashPassword(password)) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (employer.status === "pending") {
      return NextResponse.json({ error: "pending_approval", message: "Your account is pending approval. You'll receive an email once it's reviewed." }, { status: 403 });
    }
    if (employer.status === "rejected") {
      return NextResponse.json({ error: "rejected", message: employer.rejected_reason || "Your employer account application was not approved." }, { status: 403 });
    }

    const token = createToken({ id: employer.id, email: employer.email, company_id: employer.company_id });
    const res = NextResponse.json({
      success: true,
      employer: { id: employer.id, email: employer.email, company_id: employer.company_id },
      needs_setup: !employer.company_id,
    });
    res.cookies.set(SESSION_COOKIE_OPTIONS(token));
    return res;
  } catch (e) {
    console.error("Employer login error:", e);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
