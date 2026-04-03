import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "pf-admin-2026";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const body = await req.json();
  const { title, department, location, duration, description, required_skills, demo_task_required, deadline, spots, company_name } = body;

  if (!title?.trim() || !department?.trim() || !description?.trim() || !company_name?.trim()) {
    return NextResponse.json({ error: "Title, department, description, and company name are required" }, { status: 400 });
  }

  // Find or create a company record for this admin-added listing
  let company_id: string;
  let employer_id: string;

  const { data: existingCompany } = await admin
    .from("companies")
    .select("id, employer_id")
    .eq("name", company_name.trim())
    .maybeSingle();

  if (existingCompany) {
    company_id = existingCompany.id;
    employer_id = existingCompany.employer_id;
  } else {
    // Use the first approved employer as a placeholder for admin-created listings
    const { data: emp } = await admin
      .from("employer_accounts")
      .select("id")
      .eq("status", "approved")
      .limit(1)
      .maybeSingle();

    if (!emp) return NextResponse.json({ error: "No approved employer found to associate listing with" }, { status: 400 });

    employer_id = emp.id;

    const { data: newCompany, error: companyError } = await admin
      .from("companies")
      .insert({ name: company_name.trim(), employer_id: emp.id })
      .select("id")
      .single();

    if (companyError) return NextResponse.json({ error: companyError.message }, { status: 500 });
    company_id = newCompany.id;
  }

  const { data: listing, error } = await admin
    .from("listings")
    .insert({
      title: title.trim(),
      department: department.trim(),
      location: location?.trim() || "Accra, Ghana",
      duration: duration || "3 months",
      description: description.trim(),
      required_skills: required_skills || [],
      demo_task_required: demo_task_required || false,
      deadline: deadline || null,
      spots: spots || 1,
      status: "active",
      company_id,
      employer_id,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, id: listing.id }, { status: 201 });
}
