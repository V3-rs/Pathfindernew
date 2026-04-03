import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// POST — record a student activity event
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { type, data } = body;

  // type: "career_explorer" | "cv_builder" | "internship_application" | "skill_verification"
  if (!type) return NextResponse.json({ error: "type required" }, { status: 400 });

  const admin = getSupabaseAdmin();
  if (admin) {
    await admin.from("student_activity").insert({
      type,
      data: data || {},
      created_at: new Date().toISOString(),
    }).then(({ error }) => {
      if (error) console.error("Activity insert error:", error.message);
    });
  }

  return NextResponse.json({ success: true });
}

// GET — fetch all activity (admin use)
export async function GET(req: NextRequest) {
  const secret = new URL(req.url).searchParams.get("secret");
  if (secret !== (process.env.ADMIN_SECRET || "pf-admin-2026")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ activity: [] });

  const { data } = await admin
    .from("student_activity")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  return NextResponse.json({ activity: data || [] });
}
