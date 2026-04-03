"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const INDUSTRIES = ["Technology", "Finance & Banking", "Healthcare", "Education", "Agriculture", "Manufacturing", "Media & Entertainment", "NGO / Social Impact", "Government", "Consulting", "Retail & E-commerce", "Other"];
const SIZES = ["1–10", "11–50", "51–200", "201–500", "500+"];
const INTENTS = ["Hire 1–3 interns", "Hire 4–10 interns", "Build a talent pipeline", "Research / pilot program", "Not sure yet"];

export default function EmployerSetupPage() {
    const [form, setForm] = useState({
        name: "", industry: "", size: "", contact_name: "", contact_email: "",
        website: "", description: "", hiring_intent: "",
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [complete, setComplete] = useState(0);
    const router = useRouter();

    useEffect(() => {
        // Auth check
        if (typeof window !== "undefined") {
            const auth = localStorage.getItem("employer_auth");
            if (!auth) { router.push("/employer/login"); return; }
        }
        // Load existing profile
        fetch("/api/employer/profile")
            .then((r) => r.json())
            .then((d) => {
                if (d.company) {
                    setForm((prev) => ({ ...prev, ...d.company }));
                    setComplete(d.company.profile_complete || 0);
                }
            })
            .catch(() => { });
    }, [router]);

    function updateForm(key: string, value: string) {
        setForm((prev) => {
            const next = { ...prev, [key]: value };
            const fields = [next.name, next.industry, next.size, next.contact_name, next.contact_email, next.description, next.hiring_intent, next.website];
            setComplete(Math.round((fields.filter(Boolean).length / fields.length) * 100));
            return next;
        });
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        if (!form.name || !form.industry || !form.contact_name || !form.contact_email) {
            setError("Please fill in company name, industry, contact name, and contact email.");
            return;
        }
        setSaving(true);
        try {
            const res = await fetch("/api/employer/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (res.ok) {
                router.push("/employer/dashboard");
            } else {
                setError(data.error || "Failed to save profile.");
            }
        } catch {
            setError("Failed to save profile. Please try again.");
        } finally {
            setSaving(false);
        }
    }

    const completeColor = complete >= 80 ? "var(--accent-emerald)" : complete >= 50 ? "var(--accent-gold)" : "var(--accent-rose)";

    return (
        <main className="min-h-screen relative z-10 pb-20">
            <header className="glass-strong" style={{ borderBottom: "1px solid var(--glass-border)" }}>
                <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
                    <span className="text-2xl">🏢</span>
                    <div>
                        <h1 className="text-lg font-bold gradient-text">Company Setup</h1>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Complete your profile to start posting internships</p>
                    </div>
                    <div className="ml-auto text-right">
                        <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Profile complete</p>
                        <p className="text-lg font-bold" style={{ color: completeColor }}>{complete}%</p>
                    </div>
                </div>
                {/* Progress bar */}
                <div className="h-1 w-full" style={{ background: "var(--bg-card)" }}>
                    <motion.div
                        className="h-full"
                        style={{ background: completeColor }}
                        animate={{ width: `${complete}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </header>

            <div className="max-w-2xl mx-auto px-6 py-8">
                <form onSubmit={handleSave} className="space-y-6">
                    {/* Company basics */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
                        <h2 className="text-base font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Company Information</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Company Name *</label>
                                <input type="text" value={form.name} onChange={(e) => updateForm("name", e.target.value)} placeholder="Sankofa Labs" className="input-dark w-full" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Industry *</label>
                                    <select value={form.industry} onChange={(e) => updateForm("industry", e.target.value)} className="input-dark w-full">
                                        <option value="">Select industry</option>
                                        {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Company Size</label>
                                    <select value={form.size} onChange={(e) => updateForm("size", e.target.value)} className="input-dark w-full">
                                        <option value="">Select size</option>
                                        {SIZES.map((s) => <option key={s} value={s}>{s} employees</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Website</label>
                                <input type="url" value={form.website} onChange={(e) => updateForm("website", e.target.value)} placeholder="https://yourcompany.com" className="input-dark w-full" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Company Description</label>
                                <textarea value={form.description} onChange={(e) => updateForm("description", e.target.value)} placeholder="What does your company do? What's your mission?" rows={4} className="input-dark w-full resize-none" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Contact */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
                        <h2 className="text-base font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Contact Person</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Full Name *</label>
                                <input type="text" value={form.contact_name} onChange={(e) => updateForm("contact_name", e.target.value)} placeholder="Kwame Asante" className="input-dark w-full" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Work Email *</label>
                                <input type="email" value={form.contact_email} onChange={(e) => updateForm("contact_email", e.target.value)} placeholder="hr@company.com" className="input-dark w-full" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Hiring intent */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
                        <h2 className="text-base font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Hiring Intent</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {INTENTS.map((intent) => (
                                <button
                                    key={intent}
                                    type="button"
                                    onClick={() => updateForm("hiring_intent", intent)}
                                    className="px-4 py-3 rounded-xl text-sm font-medium text-left transition-all"
                                    style={{
                                        background: form.hiring_intent === intent ? "var(--accent-violet-dim)" : "var(--bg-card)",
                                        border: `1px solid ${form.hiring_intent === intent ? "rgba(139, 92, 246, 0.4)" : "var(--glass-border)"}`,
                                        color: form.hiring_intent === intent ? "#c084fc" : "var(--text-secondary)",
                                    }}
                                >
                                    {intent}
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {error && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm p-3 rounded-xl"
                            style={{ background: "var(--accent-rose-dim)", color: "var(--accent-rose)", border: "1px solid rgba(244, 114, 182, 0.2)" }}>
                            {error}
                        </motion.p>
                    )}

                    <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
                        {saving ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Saving...
                            </>
                        ) : "Save & Continue →"}
                    </button>
                </form>
            </div>
        </main>
    );
}
