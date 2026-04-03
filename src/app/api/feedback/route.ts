import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// GET /api/feedback?student_id=... — check if user already submitted feedback
export async function GET(req: NextRequest) {
  const studentId = req.nextUrl.searchParams.get("student_id");
  if (!studentId) {
    return NextResponse.json({ has_feedback: false });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ has_feedback: false });
  }

  const { data } = await admin
    .from("user_feedback")
    .select("id")
    .eq("student_id", studentId)
    .maybeSingle();

  return NextResponse.json({ has_feedback: !!data });
}

// POST /api/feedback — submit feedback
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { student_id, rating, note } = body;

    if (!student_id) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    // Upsert: if they already submitted, update it
    const { data, error } = await admin
      .from("user_feedback")
      .upsert(
        {
          student_id,
          rating: Math.round(rating),
          note: note?.trim() || null,
        },
        { onConflict: "student_id" }
      )
      .select()
      .single();

    if (error) {
      console.error("Feedback insert error:", error);
      return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
    }

    return NextResponse.json({ success: true, feedback: data });
  } catch (e) {
    console.error("Feedback error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
