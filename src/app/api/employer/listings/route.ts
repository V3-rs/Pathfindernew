import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/employer-auth";
import { getListingsByEmployer, createListing, getCompanyByEmployer } from "@/lib/employer-store";

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const listings = await getListingsByEmployer(session.id);
  return NextResponse.json({ listings });
}

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const company = await getCompanyByEmployer(session.id);
  if (!company) {
    return NextResponse.json(
      { error: "Please complete your company profile before posting internships." },
      { status: 400 }
    );
  }

  const body = await req.json();
  const { title, department, location, duration, pay_type, pay_amount, description, required_skills, demo_task_required, deadline, spots } = body;

  if (!title?.trim() || !department?.trim() || !description?.trim()) {
    return NextResponse.json({ error: "Title, department, and description are required" }, { status: 400 });
  }

  const listing = await createListing(session.id, company.id, {
    title: title.trim(),
    department: department.trim(),
    location: location?.trim() || "Accra, Ghana",
    duration: duration || "3 months",
    pay_type: pay_type || "Unpaid",
    pay_amount,
    description: description.trim(),
    required_skills: required_skills || [],
    demo_task_required: demo_task_required || false,
    deadline,
    spots: spots || 1,
    status: "active",
  });

  return NextResponse.json({ success: true, listing }, { status: 201 });
}
