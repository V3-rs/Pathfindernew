"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import MobileNav from "@/components/MobileNav";

interface StudentData {
    firstName: string;
    lastName: string;
    email: string;
    city: string;
    age: number;
}

interface Application {
    internshipId: string;
    sector: string;
    role: string;
    company: string;
    timestamp: string;
}

export default function DashboardPage() {
    const [student, setStudent] = useState<StudentData | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [verifiedSectors, setVerifiedSectors] = useState<string[]>([]);

    useEffect(() => {
        if (typeof window === "undefined") return;

        // Load student data from localStorage
        const raw = localStorage.getItem("pathfinder_user");
        if (raw) {
            try {
                setStudent(JSON.parse(raw));
            } catch { /* ignore */ }
        }

        // Load applications
        const apps = localStorage.getItem("pathfinder_applications");
        if (apps) {
            try {
                setApplications(JSON.parse(apps));
            } catch { /* ignore */ }
        }

        // Load verified sectors
        const sectors = localStorage.getItem("pathfinder_verified_sectors");
        if (sectors) {
            try {
                setVerifiedSectors(JSON.parse(sectors));
            } catch { /* ignore */ }
        }
    }, []);

    return (
        <main className="min-h-screen relative z-10">
            <header className="glass-strong" style={{ borderBottom: "1px solid var(--glass-border)" }}>
                <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold gradient-text">My Dashboard</h1>
                    <MobileNav />
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-6 py-8">
                {!student ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-8 text-center"
                    >
                        <div className="text-5xl mb-4">👤</div>
                        <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                            No Profile Found
                        </h2>
                        <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
                            Complete the registration on the home page to create your profile and track your progress.
                        </p>
                        <Link href="/" className="btn-primary inline-block">
                            Go to Pathfinder →
                        </Link>
                    </motion.div>
                ) : (
                    <>
                        {/* Profile Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-6 mb-6"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold"
                                    style={{ background: "var(--accent-violet-dim)", color: "var(--accent-violet)" }}
                                >
                                    {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                                        {student.firstName} {student.lastName}
                                    </h2>
                                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                                        {student.email} · {student.city} · Age {student.age}
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                            {[
                                { label: "Applications", value: applications.length, icon: "📋", color: "var(--accent-violet)" },
                                { label: "Verified Sectors", value: verifiedSectors.length, icon: "✅", color: "var(--accent-emerald)" },
                                { label: "Profile Status", value: "Active", icon: "🟢", color: "var(--accent-gold)" },
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + i * 0.05 }}
                                    className="glass-card p-5"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg">{stat.icon}</span>
                                        <span className="text-xs font-medium uppercase" style={{ color: "var(--text-muted)" }}>{stat.label}</span>
                                    </div>
                                    <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* My Applications */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass-card p-6 mb-6"
                        >
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                                <span>📋</span> My Applications
                            </h2>
                            {applications.length > 0 ? (
                                <div className="space-y-3">
                                    {applications.map((app, i) => (
                                        <div key={i} className="p-4 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--glass-border)" }}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{app.role}</p>
                                                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{app.company}</p>
                                                </div>
                                                <span className="badge badge-emerald">Applied</span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="badge badge-violet">{app.sector}</span>
                                                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                                                    {new Date(app.timestamp).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>No applications yet</p>
                                    <Link href="/internships" className="btn-primary text-sm inline-block">
                                        Browse Internships →
                                    </Link>
                                </div>
                            )}
                        </motion.div>

                        {/* Verified Skills */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass-card p-6 mb-6"
                        >
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                                <span>✅</span> Verified Skills
                            </h2>
                            {verifiedSectors.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {verifiedSectors.map((sector) => (
                                        <span key={sector} className="badge badge-emerald">{sector} Verified</span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                                    Complete skill verification quizzes on the internships page to unlock applications.
                                </p>
                            )}
                        </motion.div>

                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                        >
                            <Link href="/cv-builder" className="glass-card p-5 block text-center hover:border-[rgba(139,92,246,0.3)] transition-all">
                                <span className="text-2xl mb-2 block">📄</span>
                                <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Build CV</p>
                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Create a professional CV</p>
                            </Link>
                            <Link href="/internships" className="glass-card p-5 block text-center hover:border-[rgba(139,92,246,0.3)] transition-all">
                                <span className="text-2xl mb-2 block">💼</span>
                                <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Internships</p>
                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Browse opportunities</p>
                            </Link>
                            <Link href="/" className="glass-card p-5 block text-center hover:border-[rgba(139,92,246,0.3)] transition-all">
                                <span className="text-2xl mb-2 block">🧭</span>
                                <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Explorer</p>
                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Discover career paths</p>
                            </Link>
                        </motion.div>
                    </>
                )}
            </div>
        </main>
    );
}
