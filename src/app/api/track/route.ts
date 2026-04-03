import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// In-memory fallback for local dev without Supabase
interface UsageEvent {
    event: string;
    name: string;
    email: string | null;
    timestamp: string;
}

const memoryEvents: UsageEvent[] = [];

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const event: UsageEvent = {
            event: body.event || "unknown",
            name: body.name || "Anonymous",
            email: body.email || null,
            timestamp: body.timestamp || new Date().toISOString(),
        };

        const admin = getSupabaseAdmin();
        if (admin) {
            await admin.from("usage_events").insert({
                event: event.event,
                name: event.name,
                email: event.email,
            });
        } else {
            memoryEvents.push(event);
        }

        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}

export async function GET() {
    try {
        const admin = getSupabaseAdmin();

        if (admin) {
            const { data, error } = await admin
                .from("usage_events")
                .select("*")
                .eq("event", "platform_use")
                .order("created_at", { ascending: false });

            if (error) throw error;

            const events = data || [];
            const totalUsers = events.length;
            const loggedInUsers = events.filter((e: any) => e.email && !e.email.startsWith("anonymous")).length;
            const loginRate = totalUsers > 0 ? Math.round((loggedInUsers / totalUsers) * 100) : 0;

            return NextResponse.json({
                total_users: totalUsers,
                logged_in_users: loggedInUsers,
                login_rate: loginRate,
            });
        } else {
            const totalUsers = memoryEvents.filter((e) => e.event === "platform_use").length;
            const loggedInUsers = memoryEvents.filter((e) => e.event === "platform_use" && e.email).length;
            const loginRate = totalUsers > 0 ? Math.round((loggedInUsers / totalUsers) * 100) : 0;

            return NextResponse.json({
                total_users: totalUsers,
                logged_in_users: loggedInUsers,
                login_rate: loginRate,
            });
        }
    } catch {
        return NextResponse.json({ total_users: 0, logged_in_users: 0, login_rate: 0 });
    }
}
