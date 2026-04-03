"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

interface Application {
    id: string;
    student_name: string;
    student_university: string;
    student_year: string;
    career_path?: string;
    cover_note?: string;
    cv_url?: string;
    match_score: number;
    skill_scores: Record<string, boolean>;
    status: string;
    created_at: string;
}

interface Listing {
    title: string;
    department: string;
    status: string;
}

const STATUS_TABS = ["All", "pending", "shortlisted", "demo_task_sent", "accepted", "rejected"];
const STATUS_COLOR: Record<string, string> = {
    pending: "var(--text-muted)",
    shortlisted: "var(--accent-gold)",
    rejected: "var(--accent-rose)",
    demo_task_sent: "var(--accent-blue)",
    accepted: "var(--accent-emerald)",
};

export default function ListingApplicantsPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [listing, setListing] = useState<Listing | null>(null);
    const [tab, setTab] = useState("All");
    const [loading, setLoading] = useState(true);
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    useEffect(() => {
        if (typeof window !== "undefined") {
            const auth = localStorage.getItem("employer_auth");
            if (!auth) { router.push("/employer/login"); return; }
        }
        fetch(`/api/employer/listings/${id}/applicants`)
            .then((r) => { if (r.status === 401) { router.push("/employer/login"); return null; } return r.json(); })
            .then((d) => { if (d) { setApplications(d.applications || []); setListing(d.listing); } })
            .finally(() => setLoading(false));
    }, [id, router]);

    async function action(appId: string, type: "shortlist" | "reject" | "demo-task") {
        await fetch(`/api/employer/applications/${appId}/${type}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
        const newStatus = type === "shortlist" ? "shortlisted" : type === "reject" ? "rejected" : "demo_task_sent";
        setApplications((prev) => prev.map((a) => a.id === appId ? { ...a, status: newStatus } : a));
    }

    const filtered = tab === "All" ? applications : applications.filter((a) => a.status === tab);

    return (
        <main className="min-h-screen relative z-10">
            <header className="glass-strong" style={{ borderBottom: "1px solid var(--glass-border)" }}>
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/employer/listings" className="nav-link text-sm">← Listings</Link>
                        <div>
                            <h1 className="text-lg font-bold gradient-text">{listing?.title || "Loading..."}</h1>
                            {listing && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{listing.department} · {applications.length} applicant{applications.length !== 1 ? "s" : ""}</p>}
                        </div>
                    </div>
                </div>

                {/* Filter tabs */}
                <div className="max-w-5xl mx-auto px-6 pb-0 flex gap-1 overflow-x-auto">
                    {STATUS_TABS.map((t) => {
                        const count = t === "All" ? applications.length : applications.filter((a) => a.status === t).length;
                        return (
                            <button key={t} onClick={() => setTab(t)}
                                className="px-4 py-2 text-sm font-medium rounded-t-lg transition-all whitespace-nowrap"
                                style={{
                                    background: tab === t ? "var(--bg-card)" : "transparent",
                                    color: tab === t ? "var(--text-primary)" : "var(--text-muted)",
                                    borderBottom: tab === t ? "2px solid var(--accent-violet)" : "2px solid transparent",
                                }}>
                                {t === "All" ? "All" : t.replace(/_/g, " ")} ({count})
                            </button>
                        );
                    })}
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-6 py-6">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <svg className="w-8 h-8 animate-spin" style={{ color: "var(--accent-violet)" }} fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-4xl mb-3">📭</p>
                        <p style={{ color: "var(--text-muted)" }}>No applicants in this category yet.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((app, i) => {
                            const skillEntries = Object.entries(app.skill_scores || {});
                            const passed = skillEntries.filter(([, v]) => v).length;
                            return (
                                <motion.div key={app.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass-card p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{app.student_name}</p>
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "var(--bg-card)", color: STATUS_COLOR[app.status] || "var(--text-muted)" }}>
                                                    {app.status.replace(/_/g, " ")}
                                                </span>
                                            </div>
                                            <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
                                                {app.student_university} · Year {app.student_year} · {app.career_path || "Explorer"}
                                            </p>

                                            {/* Skill scores */}
                                            {skillEntries.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mb-2">
                                                    {skillEntries.slice(0, 6).map(([skill, val]) => (
                                                        <span key={skill} className="text-xs px-2 py-0.5 rounded-full"
                                                            style={{ background: val ? "rgba(52, 211, 153, 0.1)" : "rgba(244, 114, 182, 0.1)", color: val ? "var(--accent-emerald)" : "var(--accent-rose)" }}>
                                                            {val ? "✓" : "✗"} {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex items-center gap-4 text-xs flex-wrap" style={{ color: "var(--text-muted)" }}>
                                                <span style={{ color: "var(--accent-gold)" }}>{app.match_score}% match</span>
                                                {skillEntries.length > 0 && <span>{passed}/{skillEntries.length} skills</span>}
                                                <span>{new Date(app.created_at).toLocaleDateString()}</span>
                                                {app.cv_url && (
                                                    <a href={app.cv_url} target="_blank" rel="noopener noreferrer"
                                                        className="font-medium" style={{ color: "var(--accent-violet)" }}>
                                                        📄 Download CV
                                                    </a>
                                                )}
                                            </div>
                                            {app.cover_note && (
                                                <p className="text-xs mt-2 italic" style={{ color: "var(--text-muted)" }}>&ldquo;{app.cover_note}&rdquo;</p>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-2 shrink-0">
                                            <Link href={`/employer/applications/${app.id}`} className="btn-ghost text-xs py-1.5 text-center">
                                                View →
                                            </Link>
                                            {app.status === "pending" && (
                                                <>
                                                    <button onClick={() => action(app.id, "shortlist")} className="btn-ghost text-xs py-1.5" style={{ color: "var(--accent-gold)" }}>Shortlist</button>
                                                    <button onClick={() => action(app.id, "reject")} className="btn-ghost text-xs py-1.5" style={{ color: "var(--accent-rose)" }}>Reject</button>
                                                </>
                                            )}
                                            {app.status === "shortlisted" && (
                                                <button onClick={() => action(app.id, "demo-task")} className="btn-ghost text-xs py-1.5" style={{ color: "var(--accent-blue)" }}>Send Task</button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
