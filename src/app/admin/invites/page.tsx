"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Invite {
    id?: string;
    token: string;
    email?: string;
    note?: string;
    used: boolean;
    used_by_email?: string;
    used_at?: string;
    expires_at: string;
    created_at: string;
}

export default function AdminInvitesPage() {
    const [secret, setSecret] = useState("");
    const [authenticated, setAuthenticated] = useState(false);
    const [invites, setInvites] = useState<Invite[]>([]);
    const [email, setEmail] = useState("");
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [newLink, setNewLink] = useState("");
    const [newToken, setNewToken] = useState("");
    const [emailSent, setEmailSent] = useState(false);
    const [copied, setCopied] = useState("");
    const [error, setError] = useState("");

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

    async function login() {
        setError("");
        const res = await fetch("/api/admin/invites", { headers: { "x-admin-secret": secret } });
        if (res.ok) {
            const data = await res.json();
            setInvites(data.invites || []);
            setAuthenticated(true);
        } else {
            setError("Wrong admin password.");
        }
    }

    async function generateInvite() {
        setLoading(true);
        setNewLink("");
        const res = await fetch("/api/admin/invites", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-admin-secret": secret },
            body: JSON.stringify({ email: email.trim() || null, note: note.trim() || null }),
        });
        const data = await res.json();
        if (data.token) {
            const link = data.invite_link || `${baseUrl}/employer/register?token=${data.token}`;
            setNewLink(link);
            setNewToken(data.token);
            setEmailSent(data.email_sent || false);
            setInvites((prev) => [{ token: data.token, email: email.trim() || undefined, note: note.trim() || undefined, used: false, expires_at: data.expires_at, created_at: new Date().toISOString() }, ...prev]);
            setEmail("");
            setNote("");
        }
        setLoading(false);
    }

    async function revokeInvite(token: string) {
        await fetch("/api/admin/invites", {
            method: "DELETE",
            headers: { "Content-Type": "application/json", "x-admin-secret": secret },
            body: JSON.stringify({ token }),
        });
        setInvites((prev) => prev.filter((i) => i.token !== token));
    }

    function copyLink(link: string, key: string) {
        navigator.clipboard.writeText(link).then(() => {
            setCopied(key);
            setTimeout(() => setCopied(""), 2000);
        });
    }

    const daysLeft = (expires: string) => Math.max(0, Math.ceil((new Date(expires).getTime() - Date.now()) / 86400000));

    if (!authenticated) {
        return (
            <main className="min-h-screen flex items-center justify-center px-6 relative z-10">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
                    <div className="glass-card p-8 text-center" style={{ borderRadius: "24px" }}>
                        <div className="text-4xl mb-4">🔐</div>
                        <h1 className="text-xl font-bold gradient-text mb-2">Admin Access</h1>
                        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>Enter your admin password to manage employer invites</p>
                        <input
                            type="password"
                            value={secret}
                            onChange={(e) => setSecret(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && login()}
                            placeholder="Admin password"
                            className="input-dark w-full mb-3"
                        />
                        {error && <p className="text-xs mb-3" style={{ color: "var(--accent-rose)" }}>{error}</p>}
                        <button onClick={login} className="btn-primary w-full">Enter →</button>
                    </div>
                </motion.div>
            </main>
        );
    }

    return (
        <main className="min-h-screen relative z-10 pb-20">
            <header className="glass-strong" style={{ borderBottom: "1px solid var(--glass-border)" }}>
                <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-xl">🔗</span>
                        <h1 className="text-lg font-bold gradient-text">Employer Invites</h1>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full" style={{ background: "var(--accent-emerald-dim)", color: "var(--accent-emerald)" }}>
                        {invites.filter((i) => !i.used).length} active
                    </span>
                </div>
            </header>

            <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
                {/* Generate new invite */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
                    <h2 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Generate Invite Link</h2>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
                                Lock to specific email (optional)
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="e.g. hr@sankofalabs.com — leave blank for any email"
                                className="input-dark w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
                                Note (optional — for your reference)
                            </label>
                            <input
                                type="text"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="e.g. Lilijana from BMT — sent via WhatsApp"
                                className="input-dark w-full"
                            />
                        </div>
                        <button onClick={generateInvite} disabled={loading} className="btn-primary">
                            {loading ? "Generating..." : "Generate Link →"}
                        </button>
                    </div>

                    {/* New link result */}
                    <AnimatePresence>
                        {newLink && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 p-4 rounded-xl"
                                style={{ background: "rgba(52, 211, 153, 0.08)", border: "1px solid rgba(52,211,153,0.2)" }}
                            >
                                <p className="text-xs font-medium mb-2" style={{ color: "var(--accent-emerald)" }}>
                                    ✓ Invite link ready{emailSent ? " · Email sent automatically" : " — share via WhatsApp or any channel"}:
                                </p>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 text-xs p-2 rounded-lg overflow-hidden text-ellipsis whitespace-nowrap"
                                        style={{ background: "var(--bg-card)", color: "var(--text-secondary)" }}>
                                        {newLink}
                                    </code>
                                    <button
                                        onClick={() => copyLink(newLink, "new")}
                                        className="btn-primary text-xs px-3 py-2 shrink-0"
                                    >
                                        {copied === "new" ? "✓ Copied!" : "Copy"}
                                    </button>
                                </div>
                                <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                                    Expires in 7 days · Single use · Employer fills in email + password
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Invite list */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
                    <h2 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>All Invites ({invites.length})</h2>
                    {invites.length === 0 ? (
                        <p className="text-sm text-center py-6" style={{ color: "var(--text-muted)" }}>No invites generated yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {invites.map((invite) => {
                                const link = `${baseUrl}/employer/register?token=${invite.token}`;
                                const expired = new Date(invite.expires_at) < new Date();
                                return (
                                    <div key={invite.token} className="p-4 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--glass-border)", opacity: invite.used || expired ? 0.6 : 1 }}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    {invite.used ? (
                                                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--glass-border)" }}>Used</span>
                                                    ) : expired ? (
                                                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--accent-rose-dim)", color: "var(--accent-rose)" }}>Expired</span>
                                                    ) : (
                                                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(52,211,153,0.1)", color: "var(--accent-emerald)" }}>Active · {daysLeft(invite.expires_at)}d left</span>
                                                    )}
                                                    {invite.email && <span className="text-xs" style={{ color: "var(--accent-gold)" }}>{invite.email}</span>}
                                                </div>
                                                {invite.note && <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>{invite.note}</p>}
                                                {invite.used && invite.used_by_email && (
                                                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Used by {invite.used_by_email}</p>
                                                )}
                                                <code className="text-xs" style={{ color: "var(--text-muted)" }}>{invite.token.slice(0, 16)}...</code>
                                            </div>
                                            <div className="flex gap-2 shrink-0">
                                                {!invite.used && !expired && (
                                                    <button onClick={() => copyLink(link, invite.token)} className="btn-ghost text-xs py-1.5">
                                                        {copied === invite.token ? "✓" : "Copy link"}
                                                    </button>
                                                )}
                                                <button onClick={() => revokeInvite(invite.token)} className="btn-ghost text-xs py-1.5" style={{ color: "var(--accent-rose)" }}>
                                                    Revoke
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            </div>
        </main>
    );
}
