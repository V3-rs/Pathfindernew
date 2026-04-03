import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const formData = await req.formData().catch(() => null);

  let listing_id: string, student_name: string, student_university: string, student_year: string, cover_note: string, department: string;
  let cvFile: File | null = null;

  if (formData) {
    listing_id = formData.get("listing_id") as string;
    student_name = formData.get("student_name") as string;
    student_university = formData.get("student_university") as string;
    student_year = formData.get("student_year") as string;
    cover_note = formData.get("cover_note") as string || "";
    department = formData.get("department") as string || "";
    cvFile = formData.get("cv") as File | null;
  } else {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!listing_id || !student_name || !student_university || !student_year) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const { data: listing } = await admin.from("listings").select("employer_id").eq("id", listing_id).maybeSingle();
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  // Upload CV if provided
  let cv_url: string | null = null;
  if (cvFile && cvFile.size > 0) {
    const ext = cvFile.name.split(".").pop() || "pdf";
    const path = `${Date.now()}_${student_name.replace(/\s+/g, "_")}.${ext}`;
    const buffer = Buffer.from(await cvFile.arrayBuffer());

    const { error: uploadError } = await admin.storage.from("cvs").upload(path, buffer, {
      contentType: cvFile.type,
      upsert: false,
    });

    if (!uploadError) {
      const { data: urlData } = admin.storage.from("cvs").getPublicUrl(path);
      cv_url = urlData.publicUrl;
    }
  }

  const { error } = await admin.from("employer_applications").insert({
    listing_id,
    employer_id: listing.employer_id,
    student_id: null,
    student_name,
    student_university,
    student_year,
    cover_note: cover_note || null,
    career_path: department || null,
    skill_scores: {},
    match_score: 0,
    status: "pending",
    cv_url,
  });

  if (error) {
    console.error("Application insert error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
