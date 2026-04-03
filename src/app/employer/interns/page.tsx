"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Milestone {
    id: string;
    title: string;
    due_date: string;
    status: "pending" | "in_progress" | "complete";
}

interface CheckIn {
    id: string;
    week: string;
    rating: number;
    note: string;
}

interface Intern {
    id: string;
    student_name: string;
    role: string;
    start_date: string;
    end_date: string;
    status: string;
    milestones: Milestone[];
    check_ins: CheckIn[];
}

const MILESTONE_COLORS = { pending: "var(--text-muted)", in_progress: "var(--accent-gold)", complete: "var(--accent-emerald)" };

export default function InternsPage() {
    const [interns, setInterns] = useState<Intern[]>([]);
    const [loading, setLoading] = useState(true);
    const [checkInIntern, setCheckInIntern] = useState<Intern | null>(null);
    const [checkInForm, setCheckInForm] = useState({ week: "", rating: "5", note: "" });
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== "undefined") {
            const auth = localStorage.getItem("employer_auth");
            if (!auth) { router.push("/employer/login"); return; }
        }
        fetch("/api/employer/interns")
            .then((r) => { if (r.status === 401) { router.push("/employer/login"); return null; } return r.json(); })
            .then((d) => { if (d) setInterns(d.interns || []); })
            .finally(() => setLoading(false));
    }, [router]);

    async function updateMilestone(internId: string, milestoneId: string, newStatus: Milestone["status"]) {
        await fetch(`/api/employer/interns/${internId}/checkin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ milestone_id: milestoneId, milestone_status: newStatus }),
        });
        setInterns((prev) => prev.map((i) => i.id === internId ? {
            ...i,
            milestones: i.milestones.map((m) => m.id === milestoneId ? { ...m, status: newStatus } : m),
        } : i));
    }

    async function submitCheckIn() {
        if (!checkInIntern || !checkInForm.week) return;
        setSaving(true);
        await fetch(`/api/employer/interns/${checkInIntern.id}/checkin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ week: checkInForm.week, rating: parseInt(checkInForm.rating), note: checkInForm.note }),
        });
        setSaving(false);
        setCheckInIntern(null);
        setCheckInForm({ week: "", rating: "5", note: "" });
    }

    const daysLeft = (end: string) => Math.max(0, Math.ceil((new Date(end).getTime() - Date.now()) / 86400000));

    return (
        <main className="min-h-screen relative z-10">
            <header className="glass-strong" style={{ borderBottom: "1px solid var(--glass-border)" }}>
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
                    <Link href="/employer/dashboard" className="nav-link text-sm">← Dashboard</Link>
                    <h1 className="text-lg font-bold gradient-text">Intern Tracker</h1>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--accent-emerald-dim)", color: "var(--accent-emerald)" }}>{interns.filter((i) => i.status === "active").length} Active</span>
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
                ) : interns.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-5xl mb-4">🎓</p>
                        <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>No active interns yet</h2>
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Accept applicants to start tracking their internship progress.</p>
                        <Link href="/employer/listings" className="btn-primary mt-4 inline-block">View Applicants</Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {interns.map((intern, i) => (
                            <motion.div key={intern.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-card p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h2 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>{intern.student_name}</h2>
                                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>{intern.role} · {new Date(intern.start_date).toLocaleDateString()} – {new Date(intern.end_date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-medium" style={{ color: "var(--accent-gold)" }}>{daysLeft(intern.end_date)} days left</p>
                                        <button onClick={() => setCheckInIntern(intern)} className="btn-ghost text-xs mt-1">+ Check-in</button>
                                    </div>
                                </div>

                                {/* Milestones */}
                                <div className="space-y-2">
                                    {(intern.milestones || []).map((m) => (
                                        <div key={m.id} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                            <div>
                                                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{m.title}</p>
                                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Due {new Date(m.due_date).toLocaleDateString()}</p>
                                            </div>
                                            <select
                                                value={m.status}
                                                onChange={(e) => updateMilestone(intern.id, m.id, e.target.value as Milestone["status"])}
                                                className="input-dark text-xs py-1 px-2"
                                                style={{ color: MILESTONE_COLORS[m.status] }}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="complete">Complete</option>
                                            </select>
                                        </div>
                                    ))}
                                </div>

                                {/* Check-ins summary */}
                                {intern.check_ins?.length > 0 && (
                                    <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--glass-border)" }}>
                                        <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>Recent Check-ins</p>
                                        <div className="flex gap-2 overflow-x-auto">
                                            {intern.check_ins.slice(-5).map((c) => (
                                                <div key={c.id} className="shrink-0 text-center px-3 py-2 rounded-lg" style={{ background: "var(--bg-card)", minWidth: "60px" }}>
                                                    <p className="text-lg font-bold" style={{ color: c.rating >= 4 ? "var(--accent-emerald)" : c.rating >= 3 ? "var(--accent-gold)" : "var(--accent-rose)" }}>{c.rating}/5</p>
                                                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{c.week}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Check-in modal */}
            <AnimatePresence>
                {checkInIntern && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center px-6"
                        style={{ background: "rgba(0,0,0,0.7)" }}
                        onClick={() => setCheckInIntern(null)}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="glass-card p-6 w-full max-w-md"
                            onClick={(e) => e.stopPropagation()}>
                            <h3 className="font-bold mb-1" style={{ color: "var(--text-primary)" }}>Weekly Check-in</h3>
                            <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>{checkInIntern.student_name}</p>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Week</label>
                                    <input type="text" value={checkInForm.week} onChange={(e) => setCheckInForm((p) => ({ ...p, week: e.target.value }))} placeholder="e.g. Week 3" className="input-dark w-full" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Performance Rating (1–5)</label>
                                    <input type="range" min="1" max="5" value={checkInForm.rating} onChange={(e) => setCheckInForm((p) => ({ ...p, rating: e.target.value }))} className="w-full" />
                                    <p className="text-center text-lg font-bold" style={{ color: "var(--accent-gold)" }}>{checkInForm.rating}/5</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Notes</label>
                                    <textarea value={checkInForm.note} onChange={(e) => setCheckInForm((p) => ({ ...p, note: e.target.value }))} rows={3} className="input-dark w-full resize-none" placeholder="How is the intern performing this week?" />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-5">
                                <button onClick={() => setCheckInIntern(null)} className="btn-ghost flex-1">Cancel</button>
                                <button onClick={submitCheckIn} disabled={saving || !checkInForm.week} className="btn-primary flex-1">
                                    {saving ? "Saving..." : "Save Check-in"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
