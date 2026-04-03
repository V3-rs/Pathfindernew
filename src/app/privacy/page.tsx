"use client";

import Link from "next/link";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
    return (
        <main className="min-h-screen relative z-10">
            <header className="glass-strong" style={{ borderBottom: "1px solid var(--glass-border)" }}>
                <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold gradient-text">Privacy Policy</h1>
                    <MobileNav />
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-6 py-10">
                <div className="glass-card p-8 md:p-12 space-y-8">
                    <div>
                        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
                            Last updated: March 2026
                        </p>
                        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                            Pathfinder Africa (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting your
                            privacy. This Privacy Policy explains how we collect, use, share, and protect your personal information
                            when you use our platform.
                        </p>
                    </div>

                    <section>
                        <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>1. Information We Collect</h2>
                        <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--text-secondary)" }}>
                            We collect the following types of information:
                        </p>
                        <ul className="list-disc list-inside space-y-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                            <li><strong style={{ color: "var(--text-primary)" }}>Account Information:</strong> Name, email address, city, age, and university when you register</li>
                            <li><strong style={{ color: "var(--text-primary)" }}>Application Data:</strong> CV/resume files, cover letters, and university information submitted with internship applications</li>
                            <li><strong style={{ color: "var(--text-primary)" }}>Assessment Data:</strong> Skill verification results and scores</li>
                            <li><strong style={{ color: "var(--text-primary)" }}>Usage Data:</strong> Pages visited, features used, and career interests you explore</li>
                            <li><strong style={{ color: "var(--text-primary)" }}>Browser Data:</strong> Certain information stored locally in your browser (localStorage) for personalisation</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>2. How We Use Your Information</h2>
                        <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--text-secondary)" }}>
                            We use the information we collect to:
                        </p>
                        <ul className="list-disc list-inside space-y-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                            <li>Provide and personalise the Pathfinder Africa experience</li>
                            <li>Match you with relevant career paths and internship opportunities</li>
                            <li>Process your internship applications and share them with relevant employers</li>
                            <li>Track your skill verification progress</li>
                            <li>Improve our platform and develop new features</li>
                            <li>Communicate with you about your account and the Platform</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>3. Information Sharing</h2>
                        <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--text-secondary)" }}>
                            We do not sell your personal information. We may share your data in the following circumstances:
                        </p>
                        <ul className="list-disc list-inside space-y-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                            <li><strong style={{ color: "var(--text-primary)" }}>With Employers:</strong> When you apply to an internship, your application information (name, university, CV, cover note) is shared with the employer posting the listing</li>
                            <li><strong style={{ color: "var(--text-primary)" }}>Service Providers:</strong> We use Supabase for data storage and hosting. Your data is processed in accordance with their privacy policies</li>
                            <li><strong style={{ color: "var(--text-primary)" }}>Legal Requirements:</strong> If required by law, regulation, or legal process</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>4. Data Storage & Security</h2>
                        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                            Your data is securely stored using Supabase&apos;s cloud infrastructure. We implement appropriate
                            technical and organisational measures to protect your personal information against unauthorised access,
                            alteration, disclosure, or destruction. Some data (such as skill verification progress and preferences)
                            is stored locally in your browser and is not transmitted to our servers.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>5. Your Rights</h2>
                        <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--text-secondary)" }}>
                            You have the right to:
                        </p>
                        <ul className="list-disc list-inside space-y-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                            <li>Access your personal data we hold about you</li>
                            <li>Request correction of inaccurate data</li>
                            <li>Request deletion of your data</li>
                            <li>Withdraw consent for data processing</li>
                            <li>Clear locally stored data by clearing your browser&apos;s localStorage</li>
                        </ul>
                        <p className="text-sm leading-relaxed mt-3" style={{ color: "var(--text-secondary)" }}>
                            To exercise any of these rights, please contact us at{" "}
                            <a href="mailto:pathfinderafrica@protonmail.com" style={{ color: "var(--accent-gold)" }}>
                                pathfinderafrica@protonmail.com
                            </a>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>6. Cookies & Local Storage</h2>
                        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                            We use browser localStorage to store your preferences, skill verification progress, and session
                            information. This data remains on your device and is not automatically transmitted to our servers.
                            You can clear this data at any time through your browser settings.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>7. Children&apos;s Privacy</h2>
                        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                            Pathfinder Africa is not intended for children under 16 years of age. We do not knowingly collect
                            personal information from children under 16. If we become aware that we have collected data from a
                            child under 16, we will take steps to delete such information promptly.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>8. Changes to This Policy</h2>
                        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                            We may update this Privacy Policy from time to time. We will notify you of significant changes by
                            posting a notice on the Platform. Your continued use of the Platform after changes constitutes
                            acceptance of the updated policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>9. Contact Us</h2>
                        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                            If you have any questions or concerns about this Privacy Policy, please contact us at{" "}
                            <a href="mailto:pathfinderafrica@protonmail.com" style={{ color: "var(--accent-gold)" }}>
                                pathfinderafrica@protonmail.com
                            </a>.
                        </p>
                    </section>
                </div>
            </div>

            <Footer />
        </main>
    );
}
