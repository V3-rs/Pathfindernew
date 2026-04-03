"use client";

import Link from "next/link";

export default function Footer() {
    return (
        <footer
            style={{
                borderTop: "1px solid var(--glass-border)",
                background: "rgba(10, 10, 26, 0.8)",
                backdropFilter: "blur(20px)",
            }}
        >
            <div className="max-w-6xl mx-auto px-6 py-10">
                {/* Top row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {/* Brand */}
                    <div>
                        <h3 className="text-lg font-bold gradient-text mb-2">Pathfinder Africa</h3>
                        <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                            Helping students in Ghana and across Africa discover career paths, access internships, and build the skills that matter.
                        </p>
                    </div>

                    {/* Quick links */}
                    <div>
                        <h4 className="text-sm font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>Quick Links</h4>
                        <div className="flex flex-col gap-2">
                            <Link href="/" className="text-sm transition-colors" style={{ color: "var(--text-muted)" }}>
                                Career Explorer
                            </Link>
                            <Link href="/internships" className="text-sm transition-colors" style={{ color: "var(--text-muted)" }}>
                                Internships
                            </Link>
                            <Link href="/resources" className="text-sm transition-colors" style={{ color: "var(--text-muted)" }}>
                                Resources
                            </Link>
                            <Link href="/cv-builder" className="text-sm transition-colors" style={{ color: "var(--text-muted)" }}>
                                CV Builder
                            </Link>
                        </div>
                    </div>

                    {/* Contact & legal */}
                    <div>
                        <h4 className="text-sm font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>Contact & Legal</h4>
                        <div className="flex flex-col gap-2">
                            <a
                                href="mailto:pathfinderafrica@protonmail.com"
                                className="text-sm transition-colors flex items-center gap-2"
                                style={{ color: "var(--accent-gold)" }}
                            >
                                ✉️ pathfinderafrica@protonmail.com
                            </a>
                            <Link href="/terms" className="text-sm transition-colors" style={{ color: "var(--text-muted)" }}>
                                Terms of Use
                            </Link>
                            <Link href="/privacy" className="text-sm transition-colors" style={{ color: "var(--text-muted)" }}>
                                Privacy Policy
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px mb-6" style={{ background: "var(--glass-border)" }} />

                {/* Bottom row */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        © {new Date().getFullYear()} Pathfinder Africa. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                            Built with 💛 in Accra, Ghana
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
