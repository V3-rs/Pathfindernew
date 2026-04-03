import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const ADMIN_SECRET = "pf-admin-2026";

// GET /api/admin/feedback?secret=... — fetch all feedback with student names
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ feedback: [] });
  }

  // Fetch feedback with student info via join
  const { data: feedback, error } = await admin
    .from("user_feedback")
    .select(`
      id,
      student_id,
      rating,
      note,
      created_at,
      platform_students (
        first_name,
        last_name,
        email
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Feedback fetch error:", error);
    return NextResponse.json({ feedback: [] });
  }

  // Flatten the joined data
  const enriched = (feedback || []).map((f: any) => ({
    id: f.id,
    student_id: f.student_id,
    rating: f.rating,
    note: f.note,
    created_at: f.created_at,
    student_name: f.platform_students
      ? `${f.platform_students.first_name} ${f.platform_students.last_name}`
      : null,
    student_email: f.platform_students?.email || null,
  }));

  return NextResponse.json({ feedback: enriched });
}
