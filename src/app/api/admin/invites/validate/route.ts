import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// In-memory fallback (must match the store in the POST route — works only in same process)
const memoryInvites: Record<string, { email?: string; expires_at: string; used: boolean }> = {};

export async function POST(req: NextRequest) {
  const { token, email } = await req.json();

  if (!token?.trim()) {
    return NextResponse.json({ valid: false, error: "No invite token provided." }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  if (admin) {
    const { data, error } = await admin
      .from("employer_invites")
      .select("*")
      .eq("token", token.trim())
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ valid: false, error: "Invite link not found. Please request a new one." }, { status: 404 });
    }
    if (data.used) {
      return NextResponse.json({ valid: false, error: "This invite link has already been used." }, { status: 409 });
    }
    if (new Date(data.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: "This invite link has expired. Please request a new one." }, { status: 410 });
    }
    // If invite was tied to a specific email, enforce it
    if (data.email && email && data.email !== email.trim().toLowerCase()) {
      return NextResponse.json({ valid: false, error: `This invite was sent to ${data.email}. Please use that email address.` }, { status: 403 });
    }

    // Mark as used
    await admin.from("employer_invites").update({ used: true, used_at: new Date().toISOString(), used_by_email: email || null }).eq("token", token.trim());

    return NextResponse.json({ valid: true, email: data.email || null });
  }

  // In-memory fallback
  const invite = memoryInvites[token.trim()];
  if (!invite) return NextResponse.json({ valid: false, error: "Invite not found." }, { status: 404 });
  if (invite.used) return NextResponse.json({ valid: false, error: "Already used." }, { status: 409 });
  if (new Date(invite.expires_at) < new Date()) return NextResponse.json({ valid: false, error: "Expired." }, { status: 410 });

  invite.used = true;
  return NextResponse.json({ valid: true });
}
