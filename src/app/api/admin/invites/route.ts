import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendEmployerInvite } from "@/lib/email";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "pathfinder-admin-2026";

// In-memory fallback for when Supabase tables aren't set up yet
const memoryInvites: Record<string, { email?: string; expires_at: string; used: boolean; created_at: string }> = {};

function checkAdmin(req: NextRequest): boolean {
  const secret = req.headers.get("x-admin-secret") || new URL(req.url).searchParams.get("secret");
  return secret === ADMIN_SECRET;
}

// POST — generate a new invite token
export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email, note } = await req.json().catch(() => ({}));
  const token = randomBytes(20).toString("hex");
  const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const admin = getSupabaseAdmin();
  if (admin) {
    const { error } = await admin.from("employer_invites").insert({
      token,
      email: email?.trim().toLowerCase() || null,
      note: note?.trim() || null,
      expires_at,
      used: false,
    });
    if (error) console.error("Invite insert error:", error.message);
  } else {
    memoryInvites[token] = { email, expires_at, used: false, created_at: new Date().toISOString() };
  }

  // Auto-send email if an address was provided
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pathfinder-mocha-pi.vercel.app";
  const inviteLink = `${baseUrl}/employer/register?token=${token}`;
  let emailSent = false;
  if (email?.trim()) {
    const result = await sendEmployerInvite(email.trim(), inviteLink, note?.trim());
    emailSent = result.sent;
  }

  return NextResponse.json({ token, expires_at, invite_link: inviteLink, email_sent: emailSent });
}

// GET — list all invites
export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getSupabaseAdmin();
  if (admin) {
    const { data } = await admin
      .from("employer_invites")
      .select("*")
      .order("created_at", { ascending: false });
    return NextResponse.json({ invites: data || [] });
  }

  return NextResponse.json({ invites: Object.entries(memoryInvites).map(([token, v]) => ({ token, ...v })) });
}

// DELETE — revoke an invite
export async function DELETE(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token } = await req.json();
  const admin = getSupabaseAdmin();
  if (admin) {
    await admin.from("employer_invites").delete().eq("token", token);
  } else {
    delete memoryInvites[token];
  }

  return NextResponse.json({ success: true });
}
