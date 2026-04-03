"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

interface Listing {
    id: string;
    title: string;
    department: string;
    location: string;
    duration: string;
    pay_type: string;
    pay_amount?: string;
    spots?: number;
    status: string;
    created_at: string;
}

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
    active: { label: "Active", color: "var(--accent-emerald)" },
    paused: { label: "Paused", color: "var(--accent-gold)" },
    draft: { label: "Draft", color: "var(--text-muted)" },
    closed: { label: "Closed", color: "var(--accent-rose)" },
    filled: { label: "Filled", color: "var(--accent-blue)" },
};

export default function ListingsPage() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== "undefined") {
            const auth = localStorage.getItem("employer_auth");
            if (!auth) { router.push("/employer/login"); return; }
        }
        fetch("/api/employer/listings")
            .then((r) => { if (r.status === 401) { router.push("/employer/login"); return null; } return r.json(); })
            .then((d) => { if (d) setListings(d.listings || []); })
            .finally(() => setLoading(false));
    }, [router]);

    async function toggleStatus(id: string, current: string) {
        const newStatus = current === "active" ? "paused" : "active";
        await fetch(`/api/employer/listings/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
        });
        setListings((prev) => prev.map((l) => l.id === id ? { ...l, status: newStatus } : l));
    }

    async function closeListing(id: string) {
        if (!confirm("Close this listing? Students will no longer be able to apply.")) return;
        await fetch(`/api/employer/listings/${id}`, { method: "DELETE" });
        setListings((prev) => prev.map((l) => l.id === id ? { ...l, status: "closed" } : l));
    }

    return (
        <main className="min-h-screen relative z-10">
            <header className="glass-strong" style={{ borderBottom: "1px solid var(--glass-border)" }}>
                <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Link href="/employer/dashboard" className="nav-link text-sm">← Dashboard</Link>
                        <h1 className="text-lg font-bold gradient-text">Internship Listings</h1>
                    </div>
                    <Link href="/employer/listings/new" className="btn-primary text-sm">+ Post New</Link>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-6 py-8">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <svg className="w-8 h-8 animate-spin" style={{ color: "var(--accent-violet)" }} fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    </div>
                ) : listings.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-5xl mb-4">📋</p>
                        <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>No listings yet</h2>
                        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>Post your first internship to start receiving applicants.</p>
                        <Link href="/employer/listings/new" className="btn-primary">Post an Internship</Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {listings.map((l, i) => {
                            const badge = STATUS_BADGE[l.status] || { label: l.status, color: "var(--text-muted)" };
                            return (
                                <motion.div key={l.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h2 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>{l.title}</h2>
                                                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "var(--bg-card)", color: badge.color, border: `1px solid ${badge.color}40` }}>
                                                    {badge.label}
                                                </span>
                                            </div>
                                            <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>
                                                {l.department} · {l.location} · {l.duration}
                                                {l.pay_type === "Paid" ? ` · GHS ${l.pay_amount || "—"}` : ` · ${l.pay_type}`}
                                                {l.spots && ` · ${l.spots} spot${l.spots > 1 ? "s" : ""}`}
                                            </p>
                                            <Link href={`/employer/listings/${l.id}`} className="text-sm font-semibold" style={{ color: "var(--accent-violet)" }}>
                                                View applicants →
                                            </Link>
                                        </div>
                                        <div className="flex flex-col gap-2 shrink-0">
                                            {l.status !== "closed" && l.status !== "filled" && (
                                                <button onClick={() => toggleStatus(l.id, l.status)} className="btn-ghost text-xs py-1.5">
                                                    {l.status === "active" ? "Pause" : "Activate"}
                                                </button>
                                            )}
                                            {l.status === "active" && (
                                                <button onClick={() => closeListing(l.id)} className="btn-ghost text-xs py-1.5" style={{ color: "var(--accent-rose)" }}>
                                                    Close
                                                </button>
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
