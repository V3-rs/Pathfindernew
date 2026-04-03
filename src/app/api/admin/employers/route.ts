import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "pf-admin-2026";

function checkAdmin(req: NextRequest): boolean {
  const secret = req.headers.get("x-admin-secret") || new URL(req.url).searchParams.get("secret");
  return secret === ADMIN_SECRET;
}

export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ employers: [] });

  const { data } = await admin
    .from("employer_accounts")
    .select("id, email, status, approved_at, rejected_reason, created_at")
    .order("created_at", { ascending: false });

  return NextResponse.json({ employers: data || [] });
}
