import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/employer-auth";
import { getApplication, updateApplication } from "@/lib/employer-store";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const app = await getApplication(id);
  if (!app || app.employer_id !== session.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await updateApplication(id, { status: "shortlisted" });
  return NextResponse.json({ success: true, application: updated });
}
