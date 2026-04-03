"use client";

import Link from "next/link";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/Footer";

export default function TermsPage() {
    return (
        <main className="min-h-screen relative z-10">
            <header className="glass-strong" style={{ borderBottom: "1px solid var(--glass-border)" }}>
                <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold gradient-text">Terms of Use</h1>
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
                            Welcome to Pathfinder Africa (&quot;Platform&quot;). By accessing or using our platform, you agree to
                            be bound by these Terms of Use. If you do not agree, please do not use the Platform.
                        </p>
                    </div>

                    <section>
                        <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>1. Acceptance of Terms</h2>
                        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                            By creating an account, browsing, or using any features of Pathfinder Africa, you acknowledge that you
                            have read, understood, and agree to be bound by these Terms of Use and our Privacy Policy. These terms
                            apply to all users, including students, employers, and visitors.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>2. Eligibility</h2>
                        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                            You must be at least 16 years old to use the Platform. If you are under 18, you represent that you have
                            obtained parental or guardian consent before using Pathfinder Africa. Employers must represent legitimate
                            organisations and agree to provide accurate information about their companies and job listings.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>3. User Accounts</h2>
                        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                            You are responsible for maintaining the confidentiality of your account credentials and for all
                            activities that occur under your account. You agree to provide accurate and complete information during
                            registration and to update it as necessary. Pathfinder Africa reserves the right to suspend or
                            terminate accounts that violate these terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>4. Permitted Use</h2>
                        <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--text-secondary)" }}>
                            You may use the Platform for:
                        </p>
                        <ul className="list-disc list-inside space-y-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                            <li>Exploring career paths and internship opportunities</li>
                            <li>Completing skill verification assessments</li>
                            <li>Applying to internships and submitting applications</li>
                            <li>Accessing educational resources and scholarship information</li>
                            <li>Building CVs and professional profiles</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>5. Prohibited Conduct</h2>
                        <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--text-secondary)" }}>
                            You agree not to:
                        </p>
                        <ul className="list-disc list-inside space-y-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                            <li>Submit false, misleading, or fraudulent information</li>
                            <li>Attempt to gain unauthorised access to the Platform or other users&apos; data</li>
                            <li>Post misleading internship or job listings</li>
                            <li>Use the Platform for any unlawful purpose</li>
                            <li>Scrape, harvest, or collect user data without authorisation</li>
                            <li>Interfere with the proper functioning of the Platform</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>6. Skill Verification</h2>
                        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                            Pathfinder Africa provides skill verification assessments to help students demonstrate their competency.
                            These assessments are for informational purposes and do not constitute a professional certification.
                            Users who fail an assessment 3 or more times will be subject to a 30-day cooldown period before they
                            can reattempt the assessment for that sector.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>7. Intellectual Property</h2>
                        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                            All content on the Platform, including text, graphics, logos, and software, is the property of
                            Pathfinder Africa or its licensors and is protected by applicable intellectual property laws. You may
                            not reproduce, distribute, or create derivative works without our prior written consent.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>8. Limitation of Liability</h2>
                        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                            Pathfinder Africa is provided &quot;as is&quot; without warranties of any kind. We are not responsible
                            for the accuracy of third-party content, employer listings, or scholarship information. We shall not be
                            liable for any indirect, incidental, special, or consequential damages arising from your use of the
                            Platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>9. Contact</h2>
                        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                            If you have any questions about these Terms, please contact us at{" "}
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
