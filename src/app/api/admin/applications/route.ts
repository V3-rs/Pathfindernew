import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "pf-admin-2026";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const { data, error } = await admin
    .from("employer_applications")
    .select("id, student_name, student_university, student_year, cover_note, cv_url, status, created_at, career_path, listing_id, listings(title, department, companies(name))")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    applications: (data || []).map((a: any) => ({
      id: a.id,
      student_name: a.student_name,
      student_university: a.student_university,
      student_year: a.student_year,
      cover_note: a.cover_note,
      cv_url: a.cv_url,
      status: a.status,
      created_at: a.created_at,
      department: a.career_path || a.listings?.department || "",
      listing_title: a.listings?.title || "Unknown",
      company: a.listings?.companies?.name || "Unknown",
    })),
  });
}
