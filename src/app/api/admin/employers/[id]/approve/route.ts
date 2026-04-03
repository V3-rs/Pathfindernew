import { NextRequest, NextResponse } from "next/server";
import { updateEmployerStatus, findEmployerById } from "@/lib/employer-store";
import { sendApprovalEmail } from "@/lib/email";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "pf-admin-2026";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://pathfinder-mocha-pi.vercel.app";

function checkAdmin(req: NextRequest): boolean {
  const secret = req.headers.get("x-admin-secret") || new URL(req.url).searchParams.get("secret");
  return secret === ADMIN_SECRET;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!checkAdmin(req)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = params;
  const employer = await findEmployerById(id);
  if (!employer) {
    return new NextResponse("Employer not found", { status: 404 });
  }

  await updateEmployerStatus(id, "approved");
  sendApprovalEmail(employer.email).catch(console.error);

  // Redirect to admin panel with success message
  return NextResponse.redirect(`${BASE_URL}/admin/employers?approved=${encodeURIComponent(employer.email)}`);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const employer = await findEmployerById(id);
  if (!employer) {
    return NextResponse.json({ error: "Employer not found" }, { status: 404 });
  }

  await updateEmployerStatus(id, "approved");
  sendApprovalEmail(employer.email).catch(console.error);

  return NextResponse.json({ success: true, email: employer.email });
}
