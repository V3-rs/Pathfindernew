"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getVerifiedSectors, getSectorCooldown } from "@/lib/skill-tasks";
import SkillVerification from "@/components/SkillVerification";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/Footer";

interface Internship {
  id: string;
  company: string;
  title: string;
  location: string;
  duration: string;
  description: string;
  required_skills: string[];
  department: string;
  deadline?: string;
  spots?: number;
  demo_task_required?: boolean;
}

export default function InternshipsPage() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("All");
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [verifiedSectors, setVerifiedSectors] = useState<Set<string>>(new Set());
  const [verifyingSector, setVerifyingSector] = useState<string | null>(null);
  const [applyingTo, setApplyingTo] = useState<Internship | null>(null);
  const [appForm, setAppForm] = useState({ name: "", university: "", year: "", cover: "" });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [appLoading, setAppLoading] = useState(false);
  const [appDone, setAppDone] = useState(false);

  useEffect(() => {
    setVerifiedSectors(getVerifiedSectors());

    // Load applied state from localStorage
    if (typeof window !== "undefined") {
      const saved = JSON.parse(localStorage.getItem("pathfinder_applications") || "[]");
      setApplied(new Set(saved.map((a: { internshipId: string }) => a.internshipId)));
    }

    // Fetch real listings from employer portal
    fetch("/api/employer/listings/public")
      .then((r) => r.json())
      .then((d) => setInternships(d.listings || []))
      .catch(() => setInternships([]))
      .finally(() => setLoading(false));
  }, []);

  const departments = ["All", ...Array.from(new Set(internships.map((i) => i.department)))].filter(Boolean);
  const filtered = filter === "All" ? internships : internships.filter((i) => i.department === filter);

  async function submitApplication(internship: Internship) {
    if (!appForm.name.trim() || !appForm.university.trim() || !appForm.year.trim()) return;
    setAppLoading(true);
    try {
      const fd = new FormData();
      fd.append("listing_id", internship.id);
      fd.append("student_name", appForm.name.trim());
      fd.append("student_university", appForm.university.trim());
      fd.append("student_year", appForm.year.trim());
      fd.append("cover_note", appForm.cover.trim());
      fd.append("department", internship.department);
      if (cvFile) fd.append("cv", cvFile);
      await fetch("/api/applications/submit", { method: "POST", body: fd });
      setApplied((prev) => new Set(prev).add(internship.id));
      if (typeof window !== "undefined") {
        const apps = JSON.parse(localStorage.getItem("pathfinder_applications") || "[]");
        apps.push({ internshipId: internship.id, role: internship.title, company: internship.company, timestamp: new Date().toISOString() });
        localStorage.setItem("pathfinder_applications", JSON.stringify(apps));
      }
      setAppDone(true);
      setTimeout(() => { setApplyingTo(null); setAppDone(false); setAppForm({ name: "", university: "", year: "", cover: "" }); setCvFile(null); }, 2000);
    } catch {
      // still mark locally even if API fails
      setApplied((prev) => new Set(prev).add(internship.id));
      setApplyingTo(null);
    }
    setAppLoading(false);
  }


  return (
    <main className="min-h-screen relative z-10">
      <header className="glass-strong" style={{ borderBottom: "1px solid var(--glass-border)" }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold gradient-text">Internships in Accra</h1>
          <MobileNav />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
          style={{ color: "var(--text-secondary)" }}
        >
          Browse and apply to verified internship opportunities posted by employers on Pathfinder.
        </motion.p>

        {loading ? (
          <div className="flex justify-center py-20">
            <svg className="w-8 h-8 animate-spin" style={{ color: "var(--accent-violet)" }} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : internships.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <p className="text-5xl mb-4">📋</p>
            <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>No internships posted yet</h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Employers are setting up their profiles. Check back soon — opportunities are coming.
            </p>
          </motion.div>
        ) : (
          <>
            {/* Department filter pills */}
            {departments.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {departments.map((d, i) => (
                  <motion.button
                    key={d}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setFilter(d)}
                    className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                    style={{
                      background: filter === d ? "linear-gradient(135deg, var(--accent-violet), #a855f7)" : "var(--bg-card)",
                      border: `1px solid ${filter === d ? "rgba(139, 92, 246, 0.4)" : "var(--glass-border)"}`,
                      color: filter === d ? "white" : "var(--text-secondary)",
                      boxShadow: filter === d ? "0 4px 15px rgba(139, 92, 246, 0.3)" : "none",
                    }}
                  >
                    {d}
                    {d !== "All" && verifiedSectors.has(d) && " ✓"}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Internship cards */}
            <div className="space-y-5">
              {filtered.map((internship, i) => {
                const isVerified = verifiedSectors.has(internship.department);
                const isApplied = applied.has(internship.id);
                const daysLeft = internship.deadline
                  ? Math.max(0, Math.ceil((new Date(internship.deadline).getTime() - Date.now()) / 86400000))
                  : null;

                return (
                  <motion.div
                    key={internship.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card p-6"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="badge badge-gold">{internship.department}</span>
                          {internship.demo_task_required && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ color: "var(--accent-violet)", background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
                              Demo task required
                            </span>
                          )}
                          {daysLeft !== null && daysLeft <= 7 && (
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--accent-rose-dim)", color: "var(--accent-rose)" }}>
                              {daysLeft === 0 ? "Closes today" : `${daysLeft}d left`}
                            </span>
                          )}
                          {isVerified && <span className="badge badge-emerald">✓ Verified</span>}
                        </div>

                        <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                          {internship.title}
                        </h2>
                        <p className="font-medium" style={{ color: "var(--accent-gold)" }}>{internship.company}</p>
                        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                          {internship.location} · {internship.duration}
                          {internship.spots && ` · ${internship.spots} spot${internship.spots > 1 ? "s" : ""}`}
                        </p>
                        <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                          {internship.description.slice(0, 200)}{internship.description.length > 200 ? "..." : ""}
                        </p>

                        {internship.required_skills?.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {internship.required_skills.slice(0, 6).map((skill, j) => (
                              <span key={j} className="tag text-xs">{skill}</span>
                            ))}
                            {internship.required_skills.length > 6 && (
                              <span className="text-xs" style={{ color: "var(--text-muted)" }}>+{internship.required_skills.length - 6} more</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 shrink-0">
                        {(() => {
                          const cooldown = getSectorCooldown(internship.department);
                          if (cooldown.locked) {
                            return (
                              <div className="text-center">
                                <div
                                  className="px-5 py-2.5 rounded-xl text-sm font-semibold"
                                  style={{
                                    background: "var(--accent-rose-dim)",
                                    border: "1px solid rgba(244, 114, 182, 0.2)",
                                    color: "var(--accent-rose)",
                                  }}
                                >
                                  🔒 Locked
                                </div>
                                <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
                                  Until {cooldown.unlockDate?.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                                </p>
                              </div>
                            );
                          }
                          if (!isVerified) {
                            return (
                              <button
                                onClick={() => setVerifyingSector(internship.department)}
                                className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
                                style={{
                                  background: "var(--accent-gold-dim)",
                                  border: "1px solid rgba(245, 183, 49, 0.3)",
                                  color: "var(--accent-gold)",
                                }}
                              >
                                🎯 Verify Skills
                              </button>
                            );
                          }
                          return (
                            <button
                              onClick={() => !isApplied && setApplyingTo(internship)}
                              disabled={isApplied}
                              className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
                              style={{
                                background: isApplied ? "var(--bg-card)" : "linear-gradient(135deg, var(--accent-violet), #a855f7)",
                                color: isApplied ? "var(--text-muted)" : "white",
                                boxShadow: isApplied ? "none" : "0 4px 15px rgba(139, 92, 246, 0.3)",
                                cursor: isApplied ? "default" : "pointer",
                              }}
                            >
                              {isApplied ? "✓ Applied" : "Apply →"}
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {verifyingSector && (
          <SkillVerification
            sector={verifyingSector}
            onClose={() => setVerifyingSector(null)}
            onVerified={() => setVerifiedSectors(getVerifiedSectors())}
          />
        )}
      </AnimatePresence>

      {/* Application modal */}
      <AnimatePresence>
        {applyingTo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(12px)" }}
            onClick={() => setApplyingTo(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="w-full max-w-md rounded-2xl overflow-hidden"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--glass-border)", boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 pb-4" style={{ borderBottom: "1px solid var(--glass-border)" }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>{applyingTo.title}</h3>
                    <p className="text-sm" style={{ color: "var(--accent-gold)" }}>{applyingTo.company}</p>
                  </div>
                  <button onClick={() => setApplyingTo(null)} style={{ color: "var(--text-muted)" }}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                {appDone ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                    <div className="text-5xl mb-3">✅</div>
                    <h4 className="font-bold text-lg gradient-text mb-1">Application Submitted!</h4>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>The employer will review your application.</p>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Full Name *</label>
                      <input className="input-dark w-full" placeholder="e.g. Ama Owusu" value={appForm.name} onChange={(e) => setAppForm((f) => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>University *</label>
                      <input className="input-dark w-full" placeholder="e.g. University of Ghana" value={appForm.university} onChange={(e) => setAppForm((f) => ({ ...f, university: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Year of Study *</label>
                      <select className="input-dark w-full" value={appForm.year} onChange={(e) => setAppForm((f) => ({ ...f, year: e.target.value }))}>
                        <option value="">Select year</option>
                        <option>Year 1</option>
                        <option>Year 2</option>
                        <option>Year 3</option>
                        <option>Year 4</option>
                        <option>Graduate</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Why do you want this role? (optional)</label>
                      <textarea
                        className="input-dark w-full"
                        rows={3}
                        placeholder="Tell the employer why you're a great fit..."
                        value={appForm.cover}
                        onChange={(e) => setAppForm((f) => ({ ...f, cover: e.target.value }))}
                        style={{ resize: "none" }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>CV / Resume (optional · PDF or Word)</label>
                      <label className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                        style={{ background: "var(--bg-card)", border: `1.5px dashed ${cvFile ? "rgba(139,92,246,0.5)" : "var(--glass-border)"}` }}>
                        <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => setCvFile(e.target.files?.[0] || null)} />
                        <span className="text-lg">{cvFile ? "📄" : "⬆️"}</span>
                        <span className="text-sm" style={{ color: cvFile ? "var(--accent-violet)" : "var(--text-muted)" }}>
                          {cvFile ? cvFile.name : "Click to upload your CV"}
                        </span>
                        {cvFile && (
                          <button type="button" onClick={(e) => { e.preventDefault(); setCvFile(null); }}
                            className="ml-auto text-xs" style={{ color: "var(--accent-rose)" }}>Remove</button>
                        )}
                      </label>
                    </div>
                    <button
                      onClick={() => submitApplication(applyingTo)}
                      disabled={appLoading || !appForm.name.trim() || !appForm.university.trim() || !appForm.year}
                      className="btn-primary w-full"
                    >
                      {appLoading ? "Submitting..." : "Submit Application →"}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
