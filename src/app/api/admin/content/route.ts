import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "pf-admin-2026";

export const dynamic = "force-dynamic";

// In-memory fallback for when Supabase is unavailable
const memoryResources: any[] = [];
const memoryBacheca: any[] = [];

function uid() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function GET() {
  const admin = getSupabaseAdmin();

  if (admin) {
    const [resResult, bachResult] = await Promise.all([
      admin.from("admin_resources").select("*").order("created_at", { ascending: false }),
      admin.from("admin_bacheca").select("*").order("created_at", { ascending: false }),
    ]);

    return NextResponse.json({
      resources: resResult.data || [],
      bacheca: bachResult.data || [],
    });
  }

  return NextResponse.json({
    resources: memoryResources,
    bacheca: memoryBacheca,
  });
}

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { content_type } = body; // "resource" or "bacheca"

  if (content_type === "resource") {
    const { name, url, description, emoji, tags } = body;
    if (!name?.trim() || !url?.trim()) {
      return NextResponse.json({ error: "Name and URL are required" }, { status: 400 });
    }

    const record = {
      id: uid(),
      name: name.trim(),
      url: url.trim(),
      description: description?.trim() || "",
      emoji: emoji || "🔗",
      tags: tags || [],
      created_at: new Date().toISOString(),
    };

    const admin = getSupabaseAdmin();
    if (admin) {
      const { data, error } = await admin.from("admin_resources").insert(record).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, item: data }, { status: 201 });
    }

    memoryResources.push(record);
    return NextResponse.json({ success: true, item: record }, { status: 201 });
  }

  if (content_type === "bacheca") {
    const { title, description, link, type, deadline, location } = body;
    if (!title?.trim() || !link?.trim()) {
      return NextResponse.json({ error: "Title and link are required" }, { status: 400 });
    }

    const record = {
      id: uid(),
      title: title.trim(),
      description: description?.trim() || "",
      link: link.trim(),
      type: type || "scholarship",
      deadline: deadline || null,
      location: location || null,
      created_at: new Date().toISOString(),
    };

    const admin = getSupabaseAdmin();
    if (admin) {
      const { data, error } = await admin.from("admin_bacheca").insert(record).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, item: data }, { status: 201 });
    }

    memoryBacheca.push(record);
    return NextResponse.json({ success: true, item: record }, { status: 201 });
  }

  return NextResponse.json({ error: "Invalid content_type" }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { content_type, id } = body;

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const admin = getSupabaseAdmin();

  if (content_type === "resource") {
    if (admin) {
      const { error } = await admin.from("admin_resources").delete().eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      const idx = memoryResources.findIndex((r) => r.id === id);
      if (idx >= 0) memoryResources.splice(idx, 1);
    }
    return NextResponse.json({ success: true });
  }

  if (content_type === "bacheca") {
    if (admin) {
      const { error } = await admin.from("admin_bacheca").delete().eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      const idx = memoryBacheca.findIndex((r) => r.id === id);
      if (idx >= 0) memoryBacheca.splice(idx, 1);
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid content_type" }, { status: 400 });
}
