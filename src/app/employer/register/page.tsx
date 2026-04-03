"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function EmployerRegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [accessCode, setAccessCode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (password !== confirm) { setError("Passwords do not match."); return; }
        if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
        if (!accessCode.trim()) { setError("Access code is required."); return; }

        setLoading(true);
        try {
            const res = await fetch("/api/employer/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, accessCode }),
            });
            const data = await res.json();

            if (res.ok && data.success) {
                if (typeof window !== "undefined") {
                    localStorage.setItem("pathfinder_role", "employer");
                    localStorage.setItem("employer_auth", JSON.stringify({ email, loggedIn: true, timestamp: Date.now() }));
                }
                router.push("/employer/setup");
            } else {
                setError(data.error || "Registration failed. Please try again.");
            }
        } catch {
            setError("Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center px-6 relative z-10">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-md"
            >
                <Link href="/employer/login" className="nav-link inline-flex items-center gap-1 mb-8">
                    ← Back to login
                </Link>

                <div className="glass-card p-8" style={{ borderRadius: "24px" }}>
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1, type: "spring" }}
                            className="text-5xl mb-4 inline-block"
                        >
                            🏢
                        </motion.div>
                        <h1 className="text-2xl font-bold gradient-text mb-2">Create Employer Account</h1>
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                            Post internships and find your next hire on Pathfinder
                        </p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Work Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@company.com" required className="input-dark w-full" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                placeholder="At least 6 characters" required className="input-dark w-full" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Confirm Password</label>
                            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                                placeholder="Repeat your password" required className="input-dark w-full" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Access Code</label>
                            <input type="text" value={accessCode} onChange={(e) => setAccessCode(e.target.value)}
                                placeholder="Enter your access code" required className="input-dark w-full" />
                            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                                Contact <a href="mailto:ingkar.shokan@scalekindai.com" style={{ color: "var(--accent-gold)" }}>ingkar.shokan@scalekindai.com</a> to get your code.
                            </p>
                        </div>

                        {error && (
                            <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                                className="text-sm p-3 rounded-xl"
                                style={{ background: "var(--accent-rose-dim)", color: "var(--accent-rose)", border: "1px solid rgba(244, 114, 182, 0.2)" }}>
                                {error}
                            </motion.p>
                        )}

                        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                            {loading ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Creating account...
                                </>
                            ) : "Create Account →"}
                        </button>
                    </form>

                    <p className="text-center text-sm mt-6" style={{ color: "var(--text-muted)" }}>
                        Already have an account?{" "}
                        <Link href="/employer/login" style={{ color: "var(--accent-gold)" }} className="font-semibold hover:opacity-80">
                            Sign in
                        </Link>
                    </p>
                </div>
            </motion.div>
        </main>
    );
}
