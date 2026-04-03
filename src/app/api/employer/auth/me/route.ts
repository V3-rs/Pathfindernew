import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/employer-auth";
import { findEmployerById, getCompanyByEmployer } from "@/lib/employer-store";

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const employer = await findEmployerById(session.id);
  if (!employer) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const company = employer.company_id ? await getCompanyByEmployer(employer.id) : null;

  return NextResponse.json({
    authenticated: true,
    employer: { id: employer.id, email: employer.email, company_id: employer.company_id },
    company,
    needs_setup: !employer.company_id,
  });
}
