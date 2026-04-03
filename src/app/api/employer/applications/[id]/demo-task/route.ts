import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/employer-auth";
import { getApplication, updateApplication, createDemoTask } from "@/lib/employer-store";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const app = await getApplication(id);
  if (!app || app.employer_id !== session.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { template_id, template_title, deadline_hours } = await req.json();

  const deadline = new Date(Date.now() + (deadline_hours || 72) * 60 * 60 * 1000).toISOString();

  const task = await createDemoTask({
    application_id: id,
    employer_id: session.id,
    template_id: template_id || "writing_001",
    template_title: template_title || "Writing Task",
    deadline,
    status: "sent",
  });

  await updateApplication(id, { status: "demo_task_sent", demo_task_id: task.id });

  return NextResponse.json({ success: true, demoTask: task });
}
