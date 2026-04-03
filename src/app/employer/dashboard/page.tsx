"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

interface DashStats {
    active_listings: number;
    total_applicants: number;
    shortlisted: number;
    demo_tasks_sent: number;
    accepted: number;
    active_interns: number;
    recent_applications: Array<{
        id: string;
        student_name: string;
        career_path?: string;
        match_score: number;
        status: string;
        created_at: string;
    }>;
}

const STATUS_COLORS: Record<string, string> = {
    pending: "var(--text-muted)",
    shortlisted: "var(--accent-gold)",
    rejected: "var(--accent-rose)",
    demo_task_sent: "var(--accent-blue)",
    accepted: "var(--accent-emerald)",
};

export default function EmployerDashboardPage() {
    const [stats, setStats] = useState<DashStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [employerEmail, setEmployerEmail] = useState("");
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== "undefined") {
            const auth = localStorage.getItem("employer_auth");
            if (!auth) { router.push("/employer/login"); return; }
            try {
                const parsed = JSON.parse(auth);
                if (!parsed.loggedIn) { router.push("/employer/login"); return; }
                setEmployerEmail(parsed.email || "");
            } catch { router.push("/employer/login"); return; }
        }

        fetch("/api/employer/dashboard")
            .then((r) => {
                if (r.status === 401) {
                    if (typeof window !== "undefined") {
                        localStorage.removeItem("employer_auth");
                        localStorage.removeItem("pathfinder_role");
                    }
                    router.push("/employer/login");
                    return null;
                }
                return r.json();
            })
            .then((data) => { if (data) setStats(data); })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [router]);

    async function handleLogout() {
        await fetch("/api/employer/auth/logout", { method: "POST" });
        if (typeof window !== "undefined") {
            localStorage.removeItem("employer_auth");
            localStorage.removeItem("pathfinder_role");
        }
        router.push("/");
    }

    const statCards = stats ? [
        { label: "Active Listings", value: stats.active_listings, icon: "📋", color: "var(--accent-violet)" },
        { label: "Total Applicants", value: stats.total_applicants, icon: "👥", color: "var(--accent-blue)" },
        { label: "Shortlisted", value: stats.shortlisted, icon: "⭐", color: "var(--accent-gold)" },
        { label: "Tasks Sent", value: stats.demo_tasks_sent, icon: "📝", color: "#c084fc" },
        { label: "Accepted", value: stats.accepted, icon: "✅", color: "var(--accent-emerald)" },
        { label: "Active Interns", value: stats.active_interns, icon: "🎓", color: "var(--accent-rose)" },
    ] : [];

    return (
        <main className="min-h-screen relative z-10">
            <header className="glass-strong" style={{ borderBottom: "1px solid var(--glass-border)" }}>
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🏢</span>
                        <div>
                            <h1 className="text-lg font-bold gradient-text">Employer Portal</h1>
                            {employerEmail && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{employerEmail}</p>}
                        </div>
                    </div>
                    <nav className="hidden md:flex items-center gap-2">
                        {[
                            { href: "/employer/dashboard", label: "Dashboard" },
                            { href: "/employer/listings", label: "Listings" },
                            { href: "/employer/interns", label: "Interns" },
                            { href: "/employer/setup", label: "Profile" },
                        ].map((link) => (
                            <Link key={link.href} href={link.href} className="nav-link text-sm px-3 py-1.5 rounded-lg">
                                {link.label}
                            </Link>
                        ))}
                        <button onClick={handleLogout} className="btn-ghost text-sm ml-2">Sign Out</button>
                    </nav>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <svg className="w-8 h-8 animate-spin" style={{ color: "var(--accent-violet)" }} fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    </div>
                ) : (
                    <>
                        {/* Quick actions */}
                        <div className="flex flex-wrap gap-3 mb-8">
                            <Link href="/employer/listings/new" className="btn-primary flex items-center gap-2">
                                <span>+</span> Post Internship
                            </Link>
                            <Link href="/employer/listings" className="btn-ghost flex items-center gap-2">
                                View All Listings
                            </Link>
                            <Link href="/employer/interns" className="btn-ghost flex items-center gap-2">
                                Track Interns
                            </Link>
                        </div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                            {statCards.map((s, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xl">{s.icon}</span>
                                        <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{s.label}</p>
                                    </div>
                                    <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Recent applicants */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                                    <span>👥</span> Recent Applicants
                                </h2>
                                <Link href="/employer/listings" className="text-sm font-medium" style={{ color: "var(--accent-violet)" }}>
                                    View all →
                                </Link>
                            </div>
                            {stats?.recent_applications?.length ? (
                                <div className="space-y-3">
                                    {stats.recent_applications.map((app, i) => (
                                        <div key={i} className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                            <div>
                                                <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{app.student_name}</p>
                                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{app.career_path || "Career explorer"}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-semibold" style={{ color: STATUS_COLORS[app.status] || "var(--text-muted)" }}>
                                                    {app.status.replace(/_/g, " ")}
                                                </p>
                                                <p className="text-xs" style={{ color: "var(--accent-gold)" }}>{app.match_score}% match</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-4xl mb-3">📭</p>
                                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>No applicants yet.</p>
                                    <Link href="/employer/listings/new" className="btn-primary mt-4 inline-block">Post your first internship</Link>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </div>
        </main>
    );
}
