"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";

interface Employer {
    id: string;
    email: string;
    status: "pending" | "approved" | "rejected";
    approved_at?: string;
    rejected_reason?: string;
    created_at: string;
}

function AdminEmployersContent() {
    const [secret, setSecret] = useState("");
    const [authenticated, setAuthenticated] = useState(false);
    const [employers, setEmployers] = useState<Employer[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [toast, setToast] = useState("");
    const [rejectModal, setRejectModal] = useState<{ id: string; email: string } | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const searchParams = useSearchParams();

    useEffect(() => {
        const approved = searchParams.get("approved");
        const rejected = searchParams.get("rejected");
        if (approved) setToast(`✓ Approved: ${approved}`);
        if (rejected) setToast(`✗ Rejected: ${rejected}`);
        if (approved || rejected) setTimeout(() => setToast(""), 4000);
    }, [searchParams]);

    async function login() {
        setError("");
        setLoading(true);
        const res = await fetch("/api/admin/employers", { headers: { "x-admin-secret": secret } });
        if (res.ok) {
            const data = await res.json();
            setEmployers(data.employers || []);
            setAuthenticated(true);
        } else {
            setError("Wrong admin password.");
        }
        setLoading(false);
    }

    async function approve(id: string) {
        setActionLoading(id);
        const res = await fetch(`/api/admin/employers/${id}/approve`, {
            method: "POST",
            headers: { "x-admin-secret": secret },
        });
        if (res.ok) {
            setEmployers((prev) => prev.map((e) => e.id === id ? { ...e, status: "approved", approved_at: new Date().toISOString() } : e));
            setToast("✓ Employer approved and notified by email");
            setTimeout(() => setToast(""), 4000);
        }
        setActionLoading(null);
    }

    async function reject(id: string, reason?: string) {
        setActionLoading(id);
        const res = await fetch(`/api/admin/employers/${id}/reject`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-admin-secret": secret },
            body: JSON.stringify({ reason }),
        });
        if (res.ok) {
            setEmployers((prev) => prev.map((e) => e.id === id ? { ...e, status: "rejected", rejected_reason: reason } : e));
            setToast("Employer rejected and notified.");
            setTimeout(() => setToast(""), 4000);
        }
        setActionLoading(null);
        setRejectModal(null);
        setRejectReason("");
    }

    const pending = employers.filter((e) => e.status === "pending");
    const others = employers.filter((e) => e.status !== "pending");

    if (!authenticated) {
        return (
            <main className="min-h-screen flex items-center justify-center px-6 relative z-10">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
                    <div className="glass-card p-8 text-center" style={{ borderRadius: "24px" }}>
                        <div className="text-4xl mb-4">🔐</div>
                        <h1 className="text-xl font-bold gradient-text mb-2">Admin Access</h1>
                        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>Manage employer approvals</p>
                        <input
                            type="password"
                            value={secret}
                            onChange={(e) => setSecret(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && login()}
                            placeholder="Admin password"
                            className="input-dark w-full mb-3"
                        />
                        {error && <p className="text-xs mb-3" style={{ color: "var(--accent-rose)" }}>{error}</p>}
                        <button onClick={login} disabled={loading} className="btn-primary w-full">
                            {loading ? "Checking..." : "Enter →"}
                        </button>
                    </div>
                </motion.div>
            </main>
        );
    }

    return (
        <main className="min-h-screen relative z-10 pb-20">
            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-lg"
                        style={{ background: "#1e1e30", color: "var(--accent-emerald)", border: "1px solid rgba(52,211,153,0.3)" }}
                    >
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reject modal */}
            <AnimatePresence>
                {rejectModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center px-6"
                        style={{ background: "rgba(0,0,0,0.7)" }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="glass-card p-6 w-full max-w-md"
                            style={{ borderRadius: "20px" }}
                        >
                            <h3 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Reject {rejectModal.email}?</h3>
                            <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>Optional: add a reason (sent to the employer).</p>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="e.g. We couldn't verify your company details."
                                rows={3}
                                className="input-dark w-full mb-4"
                                style={{ resize: "none" }}
                            />
                            <div className="flex gap-3">
                                <button onClick={() => setRejectModal(null)} className="btn-ghost flex-1">Cancel</button>
                                <button
                                    onClick={() => reject(rejectModal.id, rejectReason.trim() || undefined)}
                                    disabled={actionLoading === rejectModal.id}
                                    className="btn-primary flex-1"
                                    style={{ background: "var(--accent-rose)" }}
                                >
                                    {actionLoading === rejectModal.id ? "Rejecting..." : "Reject"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <header className="glass-strong" style={{ borderBottom: "1px solid var(--glass-border)" }}>
                <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-xl">👥</span>
                        <h1 className="text-lg font-bold gradient-text">Employer Approvals</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        {pending.length > 0 && (
                            <span className="text-xs px-2 py-1 rounded-full font-semibold" style={{ background: "rgba(251,191,36,0.15)", color: "var(--accent-gold)" }}>
                                {pending.length} pending
                            </span>
                        )}
                        <a href="/admin/invites" className="btn-ghost text-xs py-1.5">Manage Invites →</a>
                    </div>
                </div>
            </header>

            <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
                {/* Pending section */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
                    <h2 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                        Pending Review ({pending.length})
                    </h2>
                    {pending.length === 0 ? (
                        <p className="text-sm text-center py-6" style={{ color: "var(--text-muted)" }}>No pending employers. All clear!</p>
                    ) : (
                        <div className="space-y-3">
                            {pending.map((emp) => (
                                <motion.div
                                    key={emp.id}
                                    layout
                                    className="p-4 rounded-xl flex items-center justify-between gap-4"
                                    style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)" }}
                                >
                                    <div className="min-w-0">
                                        <p className="font-medium text-sm truncate" style={{ color: "var(--text-primary)" }}>{emp.email}</p>
                                        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                                            Registered {new Date(emp.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <button
                                            onClick={() => approve(emp.id)}
                                            disabled={actionLoading === emp.id}
                                            className="btn-primary text-xs py-1.5 px-4"
                                            style={{ background: "#059669" }}
                                        >
                                            {actionLoading === emp.id ? "..." : "Approve"}
                                        </button>
                                        <button
                                            onClick={() => setRejectModal({ id: emp.id, email: emp.email })}
                                            disabled={actionLoading === emp.id}
                                            className="btn-ghost text-xs py-1.5"
                                            style={{ color: "var(--accent-rose)" }}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* All employers */}
                {others.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
                        <h2 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>All Employers ({others.length})</h2>
                        <div className="space-y-3">
                            {others.map((emp) => (
                                <div
                                    key={emp.id}
                                    className="p-4 rounded-xl flex items-center justify-between gap-4"
                                    style={{ background: "var(--bg-card)", border: "1px solid var(--glass-border)", opacity: emp.status === "rejected" ? 0.6 : 1 }}
                                >
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            {emp.status === "approved" ? (
                                                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(52,211,153,0.1)", color: "var(--accent-emerald)" }}>Approved</span>
                                            ) : (
                                                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--accent-rose-dim)", color: "var(--accent-rose)" }}>Rejected</span>
                                            )}
                                        </div>
                                        <p className="font-medium text-sm truncate" style={{ color: "var(--text-primary)" }}>{emp.email}</p>
                                        {emp.rejected_reason && (
                                            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Reason: {emp.rejected_reason}</p>
                                        )}
                                        {emp.approved_at && (
                                            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                                                Approved {new Date(emp.approved_at).toLocaleDateString("en-GB")}
                                            </p>
                                        )}
                                    </div>
                                    {emp.status === "rejected" && (
                                        <button
                                            onClick={() => approve(emp.id)}
                                            disabled={actionLoading === emp.id}
                                            className="btn-ghost text-xs py-1.5 shrink-0"
                                            style={{ color: "var(--accent-emerald)" }}
                                        >
                                            Re-approve
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </main>
    );
}

export default function AdminEmployersPage() {
    return (
        <Suspense>
            <AdminEmployersContent />
        </Suspense>
    );
}
