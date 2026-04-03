import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/employer-auth";
import { getListing, updateListing } from "@/lib/employer-store";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const listing = await getListing(id);
  if (!listing || listing.employer_id !== session.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ listing });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getListing(id);
  if (!existing || existing.employer_id !== session.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const fields = await req.json();
  const updated = await updateListing(id, fields);
  return NextResponse.json({ success: true, listing: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getListing(id);
  if (!existing || existing.employer_id !== session.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await updateListing(id, { status: "closed" });
  return NextResponse.json({ success: true });
}
