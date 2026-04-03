"use client";

import { motion } from "framer-motion";

interface Props {
    onSelectStudent: () => void;
    onSelectEmployer: () => void;
}

export default function RoleSelection({ onSelectStudent, onSelectEmployer }: Props) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative z-10">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-lg text-center"
            >
                {/* Logo */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                    className="text-6xl mb-6 inline-block"
                    style={{ filter: "drop-shadow(0 0 30px rgba(139, 92, 246, 0.4))" }}
                >
                    🧭
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl font-bold gradient-text mb-3"
                >
                    Welcome to Pathfinder
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-lg mb-12"
                    style={{ color: "var(--text-muted)" }}
                >
                    Ghana&apos;s early-career platform connecting talent with opportunity.
                    <br />How are you joining us today?
                </motion.p>

                {/* Role cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Student card */}
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        onClick={onSelectStudent}
                        className="glass-card p-8 text-left group cursor-pointer transition-all hover:scale-[1.02]"
                        style={{
                            borderRadius: "24px",
                            border: "1px solid rgba(139, 92, 246, 0.2)",
                        }}
                    >
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5"
                            style={{ background: "var(--accent-violet-dim)" }}
                        >
                            🎓
                        </div>
                        <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                            I&apos;m a Student
                        </h2>
                        <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--text-muted)" }}>
                            Discover your career path, explore internships, and verify your skills.
                        </p>
                        <span
                            className="inline-flex items-center gap-2 text-sm font-semibold"
                            style={{ color: "var(--accent-violet)" }}
                        >
                            Start exploring →
                        </span>
                    </motion.button>

                    {/* Employer card */}
                    <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.45 }}
                        onClick={onSelectEmployer}
                        className="glass-card p-8 text-left group cursor-pointer transition-all hover:scale-[1.02]"
                        style={{
                            borderRadius: "24px",
                            border: "1px solid rgba(245, 183, 49, 0.2)",
                        }}
                    >
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5"
                            style={{ background: "var(--accent-gold-dim)" }}
                        >
                            🏢
                        </div>
                        <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                            I&apos;m an Employer
                        </h2>
                        <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--text-muted)" }}>
                            Post internships, review applicants, and find your next hire.
                        </p>
                        <span
                            className="inline-flex items-center gap-2 text-sm font-semibold"
                            style={{ color: "var(--accent-gold)" }}
                        >
                            Access portal →
                        </span>
                    </motion.button>
                </div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-xs mt-8"
                    style={{ color: "var(--text-muted)", opacity: 0.4 }}
                >
                    pathfinderafrica.org · Connecting Ghanaian talent to opportunity
                </motion.p>
            </motion.div>
        </div>
    );
}
