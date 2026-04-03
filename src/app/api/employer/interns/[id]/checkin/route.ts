import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/employer-auth";
import { getIntern, addCheckIn, updateMilestone } from "@/lib/employer-store";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const intern = await getIntern(id);
  if (!intern || intern.employer_id !== session.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { week, rating, note, milestone_id, milestone_status } = await req.json();

  if (week && rating) {
    await addCheckIn(id, { week, rating, note: note || "" });
  }

  if (milestone_id && milestone_status) {
    await updateMilestone(id, milestone_id, milestone_status);
  }

  return NextResponse.json({ success: true });
}
