"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import MobileNav from "@/components/MobileNav";

interface Internship {
    id: string;
    role: string;
    company: string;
    sector: string;
    location: string;
    description: string;
    capacity: number;
    applicants: number;
    isOpen: boolean;
    createdAt: string;
}

const INITIAL_FORM: Omit<Internship, "id" | "applicants" | "createdAt"> = {
    role: "",
    company: "",
    sector: "Tech",
    location: "Accra",
    description: "",
    capacity: 10,
    isOpen: true,
};

const SECTORS = ["Tech", "Finance", "Marketing", "Content", "Business", "Impact", "Healthcare", "Engineering", "Creative"];

export default function ManageInternshipsPage() {
    const [internships, setInternships] = useState<Internship[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(INITIAL_FORM);
    const router = useRouter();

    useEffect(() => {
        if (typeof window === "undefined") return;
        const auth = localStorage.getItem("employer_auth");
        if (!auth) { router.push("/employer/login"); return; }
        try {
            if (!JSON.parse(auth).loggedIn) { router.push("/employer/login"); return; }
        } catch { router.push("/employer/login"); return; }

        // Load saved internships
        const saved = localStorage.getItem("pathfinder_managed_internships");
        if (saved) {
            try { setInternships(JSON.parse(saved)); } catch { /* ignore */ }
        }
    }, [router]);

    function saveInternships(list: Internship[]) {
        setInternships(list);
        localStorage.setItem("pathfinder_managed_internships", JSON.stringify(list));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (editingId) {
            // Update existing
            saveInternships(
                internships.map((i) =>
                    i.id === editingId ? { ...i, ...form } : i
                )
            );
        } else {
            // Create new
            const newInternship: Internship = {
                ...form,
                id: `internship_${Date.now()}`,
                applicants: 0,
                createdAt: new Date().toISOString(),
            };
            saveInternships([newInternship, ...internships]);
        }
        setForm(INITIAL_FORM);
        setEditingId(null);
        setShowForm(false);
    }

    function handleEdit(internship: Internship) {
        setForm({
            role: internship.role,
            company: internship.company,
            sector: internship.sector,
            location: internship.location,
            description: internship.description,
            capacity: internship.capacity,
            isOpen: internship.isOpen,
        });
        setEditingId(internship.id);
        setShowForm(true);
    }

    function toggleOpen(id: string) {
        saveInternships(
            internships.map((i) => (i.id === id ? { ...i, isOpen: !i.isOpen } : i))
        );
    }

    function handleDelete(id: string) {
        if (confirm("Are you sure you want to delete this internship?")) {
            saveInternships(internships.filter((i) => i.id !== id));
        }
    }

    return (
        <main className="min-h-screen relative z-10">
            <header className="glass-strong" style={{ borderBottom: "1px solid var(--glass-border)" }}>
                <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold gradient-text">Manage Internships</h1>
                    <MobileNav />
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* Top bar */}
                <div className="flex justify-between items-center mb-6">
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        {internships.length} internship{internships.length !== 1 ? "s" : ""} created
                    </p>
                    <button
                        onClick={() => {
                            setForm(INITIAL_FORM);
                            setEditingId(null);
                            setShowForm(true);
                        }}
                        className="btn-primary text-sm"
                    >
                        + Add Internship
                    </button>
                </div>

                {/* Form Modal */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
                            onClick={() => setShowForm(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="w-full max-w-lg rounded-2xl p-6"
                                style={{ background: "var(--bg-secondary)", border: "1px solid var(--glass-border)" }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                                    {editingId ? "Edit Internship" : "Add New Internship"}
                                </h2>
                                <form onSubmit={handleSubmit} className="space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Role / Position Title"
                                        value={form.role}
                                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                                        required
                                        className="input-dark w-full"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Company Name"
                                        value={form.company}
                                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                                        required
                                        className="input-dark w-full"
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <select
                                            value={form.sector}
                                            onChange={(e) => setForm({ ...form, sector: e.target.value })}
                                            className="input-dark w-full"
                                        >
                                            {SECTORS.map((s) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="Location"
                                            value={form.location}
                                            onChange={(e) => setForm({ ...form, location: e.target.value })}
                                            className="input-dark w-full"
                                        />
                                    </div>
                                    <textarea
                                        placeholder="Description of the internship..."
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        rows={3}
                                        className="input-dark w-full resize-none"
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs mb-1" style={{ color: "var(--text-muted)" }}>Max Applicants</label>
                                            <input
                                                type="number"
                                                min={1}
                                                max={500}
                                                value={form.capacity}
                                                onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 10 })}
                                                className="input-dark w-full"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs mb-1" style={{ color: "var(--text-muted)" }}>Status</label>
                                            <select
                                                value={form.isOpen ? "open" : "closed"}
                                                onChange={(e) => setForm({ ...form, isOpen: e.target.value === "open" })}
                                                className="input-dark w-full"
                                            >
                                                <option value="open">Open for Applications</option>
                                                <option value="closed">Closed</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button type="submit" className="btn-primary flex-1">
                                            {editingId ? "Save Changes" : "Create Internship"}
                                        </button>
                                        <button type="button" onClick={() => setShowForm(false)} className="btn-ghost flex-1">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Internship List */}
                {internships.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-8 text-center"
                    >
                        <div className="text-5xl mb-4">📋</div>
                        <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>No Internships Yet</h2>
                        <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
                            Create your first internship listing to start receiving applications from students.
                        </p>
                        <button onClick={() => setShowForm(true)} className="btn-primary">
                            + Create First Internship
                        </button>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        {internships.map((internship, i) => (
                            <motion.div
                                key={internship.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass-card p-5"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                                            {internship.role}
                                        </h3>
                                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                                            {internship.company} · {internship.location}
                                        </p>
                                    </div>
                                    <span className={`badge ${internship.isOpen ? "badge-emerald" : "badge-violet"}`}>
                                        {internship.isOpen ? "Open" : "Closed"}
                                    </span>
                                </div>

                                {internship.description && (
                                    <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
                                        {internship.description}
                                    </p>
                                )}

                                <div className="flex items-center gap-4 mb-3">
                                    <span className="badge badge-gold">{internship.sector}</span>
                                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                                        {internship.applicants}/{internship.capacity} applicants
                                    </span>
                                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                                        Created {new Date(internship.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                {/* Applicant progress bar */}
                                <div className="stat-bar mb-4">
                                    <div
                                        className="stat-bar-fill"
                                        style={{
                                            width: `${Math.min(100, (internship.applicants / internship.capacity) * 100)}%`,
                                            background: internship.applicants >= internship.capacity
                                                ? "var(--accent-rose)"
                                                : "linear-gradient(90deg, var(--accent-emerald), var(--accent-blue))",
                                        }}
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(internship)} className="btn-ghost text-xs px-3 py-1.5">
                                        ✏️ Edit
                                    </button>
                                    <button onClick={() => toggleOpen(internship.id)} className="btn-ghost text-xs px-3 py-1.5">
                                        {internship.isOpen ? "🔒 Close" : "🔓 Open"}
                                    </button>
                                    <button onClick={() => handleDelete(internship.id)} className="btn-ghost text-xs px-3 py-1.5" style={{ color: "var(--accent-rose)" }}>
                                        🗑 Delete
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
