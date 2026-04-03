import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/employer-auth";
import { getListing, getApplicationsByListing } from "@/lib/employer-store";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const listing = await getListing(id);
  if (!listing || listing.employer_id !== session.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const applications = await getApplicationsByListing(id);
  return NextResponse.json({ applications, listing });
}
