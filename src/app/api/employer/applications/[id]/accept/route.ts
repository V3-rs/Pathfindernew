import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/employer-auth";
import { getApplication, updateApplication, createIntern } from "@/lib/employer-store";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const app = await getApplication(id);
  if (!app || app.employer_id !== session.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { role, start_date, end_date } = await req.json();

  const start = start_date || new Date().toISOString().split("T")[0];
  const end = end_date || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const startTs = new Date(start).getTime();
  const duration = new Date(end).getTime() - startTs;
  const third = Math.round(duration / 3);

  const intern = await createIntern({
    application_id: id,
    employer_id: session.id,
    student_name: app.student_name,
    role: role || "Intern",
    start_date: start,
    end_date: end,
    status: "active",
    milestones: [
      { id: `m1_${Date.now()}`, title: "Onboarding & First Week", due_date: new Date(startTs + third).toISOString().split("T")[0], status: "pending" },
      { id: `m2_${Date.now()}`, title: "Mid-Internship Review", due_date: new Date(startTs + third * 2).toISOString().split("T")[0], status: "pending" },
      { id: `m3_${Date.now()}`, title: "Final Presentation", due_date: end, status: "pending" },
    ],
  });

  await updateApplication(id, { status: "accepted" });

  return NextResponse.json({ success: true, intern });
}
