import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest, createToken, SESSION_COOKIE_OPTIONS } from "@/lib/employer-auth";
import { getCompanyByEmployer, upsertCompany, updateEmployerCompany } from "@/lib/employer-store";

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const company = await getCompanyByEmployer(session.id);
  return NextResponse.json({ company });
}

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const fields = await req.json();
  const company = await upsertCompany(session.id, fields);

  // Link company to employer if new
  if (!session.company_id) {
    await updateEmployerCompany(session.id, company.id);
  }

  // Refresh token with company_id
  const newToken = createToken({ id: session.id, email: session.email, company_id: company.id });
  const res = NextResponse.json({ success: true, company });
  res.cookies.set(SESSION_COOKIE_OPTIONS(newToken));
  return res;
}
