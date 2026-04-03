import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/employer-auth";
import { getApplication, getDemoTaskByApplication } from "@/lib/employer-store";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const application = await getApplication(id);
  if (!application || application.employer_id !== session.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const demoTask = application.demo_task_id
    ? await getDemoTaskByApplication(id)
    : null;

  return NextResponse.json({ application, demoTask });
}
