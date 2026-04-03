"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

const DEPARTMENTS = ["Engineering", "Product", "Design", "Marketing", "Finance", "Operations", "HR", "Legal", "Sales", "Research", "Data & Analytics", "Communications"];
const DURATIONS = ["1 month", "2 months", "3 months", "4 months", "6 months"];
const PAY_TYPES = ["Paid", "Stipend", "Unpaid"];
const SKILL_TAGS = [
    // Tech
    "Python", "JavaScript", "TypeScript", "React", "Vue.js", "Node.js", "SQL", "PostgreSQL", "MongoDB", "Git", "HTML/CSS", "Java", "C++", "R", "MATLAB",
    // Data & Analytics
    "Data Analysis", "Excel", "Google Sheets", "Power BI", "Tableau", "Statistics", "Machine Learning", "Data Visualization",
    // Design
    "Figma", "Adobe Photoshop", "Adobe Illustrator", "Canva", "UI/UX Design", "Video Editing", "Adobe Premiere", "Motion Graphics",
    // Business & Finance
    "Financial Modeling", "Accounting", "Business Development", "Market Research", "Consulting", "Project Management", "Operations", "Supply Chain",
    // Marketing & Content
    "Marketing", "Social Media Management", "SEO/SEM", "Content Writing", "Copywriting", "Email Marketing", "Brand Strategy", "Google Analytics",
    // Soft Skills
    "Research", "Writing", "Communication", "Leadership", "Teamwork", "Problem Solving", "Critical Thinking", "Presentation Skills", "Customer Service",
    // Ghana-specific
    "Twi", "French", "Event Coordination", "Community Engagement", "Fundraising",
];

export default function NewListingPage() {
    const [form, setForm] = useState({
        title: "", department: "", location: "Accra, Ghana", duration: "3 months",
        pay_type: "Unpaid", pay_amount: "", description: "", spots: "1",
        deadline: "", demo_task_required: false,
    });
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [customSkill, setCustomSkill] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== "undefined") {
            const auth = localStorage.getItem("employer_auth");
            if (!auth) router.push("/employer/login");
        }
    }, [router]);

    function set(key: string, value: string | boolean) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    function toggleSkill(skill: string) {
        setSelectedSkills((prev) => prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]);
    }

    function addCustomSkill() {
        const trimmed = customSkill.trim();
        if (trimmed && !selectedSkills.includes(trimmed)) {
            setSelectedSkills((prev) => [...prev, trimmed]);
        }
        setCustomSkill("");
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (!form.title || !form.department || !form.description) {
            setError("Title, department, and description are required.");
            return;
        }
        if (form.description.split(/\s+/).length < 30) {
            setError("Please write a more detailed description (at least 30 words).");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch("/api/employer/listings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    spots: parseInt(form.spots) || 1,
                    required_skills: selectedSkills,
                }),
            });
            const data = await res.json();

            if (res.ok) {
                router.push("/employer/listings");
            } else {
                setError(data.error || "Failed to post listing.");
            }
        } catch {
            setError("Failed to post listing. Please try again.");
        } finally {
            setSaving(false);
        }
    }

    const wordCount = form.description.trim().split(/\s+/).filter(Boolean).length;

    return (
        <main className="min-h-screen relative z-10 pb-20">
            <header className="glass-strong" style={{ borderBottom: "1px solid var(--glass-border)" }}>
                <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
                    <Link href="/employer/listings" className="nav-link text-sm">← Listings</Link>
                    <h1 className="text-lg font-bold gradient-text">Post an Internship</h1>
                </div>
            </header>

            <div className="max-w-2xl mx-auto px-6 py-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-4">
                        <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>Role Details</h2>

                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Job Title *</label>
                            <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Software Engineering Intern" className="input-dark w-full" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Department *</label>
                                <select value={form.department} onChange={(e) => set("department", e.target.value)} className="input-dark w-full">
                                    <option value="">Select</option>
                                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Location</label>
                                <input type="text" value={form.location} onChange={(e) => set("location", e.target.value)} className="input-dark w-full" />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Duration</label>
                                <select value={form.duration} onChange={(e) => set("duration", e.target.value)} className="input-dark w-full">
                                    {DURATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Pay Type</label>
                                <select value={form.pay_type} onChange={(e) => set("pay_type", e.target.value)} className="input-dark w-full">
                                    {PAY_TYPES.map((p) => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Spots</label>
                                <input type="number" value={form.spots} onChange={(e) => set("spots", e.target.value)} min="1" max="50" className="input-dark w-full" />
                            </div>
                        </div>

                        {form.pay_type === "Paid" && (
                            <div>
                                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Monthly Pay (GHS)</label>
                                <input type="text" value={form.pay_amount} onChange={(e) => set("pay_amount", e.target.value)} placeholder="e.g. 800" className="input-dark w-full" />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Application Deadline</label>
                            <input type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} className="input-dark w-full" />
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>Description *</h2>
                            <span className="text-xs" style={{ color: wordCount >= 30 ? "var(--accent-emerald)" : "var(--text-muted)" }}>{wordCount} words {wordCount < 30 ? `(need ${30 - wordCount} more)` : "✓"}</span>
                        </div>
                        <textarea
                            value={form.description}
                            onChange={(e) => set("description", e.target.value)}
                            rows={8}
                            className="input-dark w-full resize-none"
                            placeholder="Describe the role, responsibilities, what the intern will learn, and any requirements..."
                        />
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
                        <h2 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Required Skills</h2>
                        {/* Selected skills summary */}
                        {selectedSkills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4 p-3 rounded-xl" style={{ background: "var(--accent-violet-dim)", border: "1px solid rgba(139,92,246,0.2)" }}>
                                {selectedSkills.map((skill) => (
                                    <span key={skill} className="flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium" style={{ background: "var(--bg-card)", color: "#c084fc" }}>
                                        {skill}
                                        <button type="button" onClick={() => setSelectedSkills((prev) => prev.filter((s) => s !== skill))} className="ml-1 opacity-60 hover:opacity-100">×</button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Custom skill input */}
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={customSkill}
                                onChange={(e) => setCustomSkill(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomSkill(); } }}
                                placeholder="Type a custom skill and press Enter or Add..."
                                className="input-dark flex-1"
                            />
                            <button type="button" onClick={addCustomSkill} disabled={!customSkill.trim()} className="btn-ghost px-4 text-sm" style={{ color: "var(--accent-violet)" }}>
                                + Add
                            </button>
                        </div>

                        {/* Preset skill tags */}
                        <div className="flex flex-wrap gap-2">
                            {SKILL_TAGS.map((skill) => (
                                <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                                    style={{
                                        background: selectedSkills.includes(skill) ? "var(--accent-violet-dim)" : "var(--bg-card)",
                                        border: `1px solid ${selectedSkills.includes(skill) ? "rgba(139, 92, 246, 0.4)" : "var(--glass-border)"}`,
                                        color: selectedSkills.includes(skill) ? "#c084fc" : "var(--text-muted)",
                                    }}>
                                    {selectedSkills.includes(skill) ? "✓ " : ""}{skill}
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>Require Demo Task</h2>
                                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Shortlisted applicants will receive a task to prove their skills</p>
                            </div>
                            <button type="button" onClick={() => set("demo_task_required", !form.demo_task_required)}
                                className="w-12 h-6 rounded-full transition-all relative"
                                style={{ background: form.demo_task_required ? "var(--accent-violet)" : "var(--bg-card)", border: "1px solid var(--glass-border)" }}>
                                <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                                    style={{ left: form.demo_task_required ? "calc(100% - 1.375rem)" : "0.125rem" }} />
                            </button>
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
                                Posting...
                            </>
                        ) : "Post Internship →"}
                    </button>
                </form>
            </div>
        </main>
    );
}
