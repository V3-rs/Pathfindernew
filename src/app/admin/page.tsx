"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Submission {
  id: string;
  dream_text: string;
  created_at: string;
  embedding?: number[] | null;
}

interface Insights {
  total_submissions: number;
  top_archetypes: { id: string; count: number }[];
  top_keywords: { word: string; count: number }[];
  summary_archetypes: { id: string; title: string; score: number }[];
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  age: number;
  registeredAt: string;
}

interface Application {
  id: string;
  student_name: string;
  student_university: string;
  student_year: string;
  cover_note: string;
  cv_url: string | null;
  status: string;
  created_at: string;
  department: string;
  listing_title: string;
  company: string;
}

interface AdminResource {
  id: string;
  name: string;
  url: string;
  description: string;
  emoji: string;
  tags: string[];
  created_at: string;
}

interface AdminBacheca {
  id: string;
  title: string;
  description: string;
  link: string;
  type: "scholarship" | "program" | "exchange";
  deadline?: string;
  location?: string;
  created_at: string;
}

interface LiveListing {
  id: string;
  title: string;
  department: string;
  company: string;
  location: string;
  spots: number;
}

interface FeedbackEntry {
  id: string;
  student_id: string;
  rating: number;
  note: string | null;
  created_at: string;
  student_name?: string;
  student_email?: string;
}

const ADMIN_SECRET = "pf-admin-2026";

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "students" | "applications" | "add-listing" | "content" | "feedback">("dashboard");
  const [feedbackEntries, setFeedbackEntries] = useState<FeedbackEntry[]>([]);

  // Content manager state
  const [adminResources, setAdminResources] = useState<AdminResource[]>([]);
  const [adminBacheca, setAdminBacheca] = useState<AdminBacheca[]>([]);
  const [liveListings, setLiveListings] = useState<LiveListing[]>([]);
  const [contentSection, setContentSection] = useState<"resources" | "scholarships" | "internships">("resources");

  // Content code protection
  const [contentUnlocked, setContentUnlocked] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState(false);

  // Content forms
  const [resourceForm, setResourceForm] = useState({ name: "", url: "", description: "", emoji: "🔗", tags: "" });
  const [bachecaForm, setBachecaForm] = useState({ title: "", link: "", description: "", type: "scholarship" as const, deadline: "", location: "" });
  const [contentSubmitting, setContentSubmitting] = useState(false);
  const [contentSuccess, setContentSuccess] = useState("");

  // Add listing form state
  const [listingForm, setListingForm] = useState({
    title: "", department: "", location: "Accra, Ghana", duration: "3 months",
    description: "", required_skills: "", spots: "1", deadline: "",
    demo_task_required: false, company_name: "",
  });
  const [listingSubmitting, setListingSubmitting] = useState(false);
  const [listingSuccess, setListingSuccess] = useState(false);
  const [listingError, setListingError] = useState<string | null>(null);

  function loadData() {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch("/api/admin/submissions").then((r) => (r.ok ? r.json() : r.json().then((j) => { throw new Error(j.error || "Failed to load"); }))),
      fetch("/api/admin/insights").then((r) => (r.ok ? r.json() : r.json().then((j) => { throw new Error(j.error || "Failed to load"); }))),
      fetch("/api/students/register").then((r) => r.json()).catch(() => ({ students: [] })),
      fetch(`/api/admin/applications?secret=${ADMIN_SECRET}`).then((r) => r.json()).catch(() => ({ applications: [] })),
      fetch("/api/admin/content").then((r) => r.json()).catch(() => ({ resources: [], bacheca: [] })),
      fetch("/api/employer/listings/public").then((r) => r.json()).catch(() => ({ listings: [] })),
      fetch(`/api/admin/feedback?secret=${ADMIN_SECRET}`).then((r) => r.json()).catch(() => ({ feedback: [] })),
    ])
      .then(([subData, insData, stuData, appData, contentData, listingsData, feedbackData]) => {
        setSubmissions(subData?.submissions ?? []);
        setInsights(insData?.total_submissions !== undefined ? insData : null);
        setStudents(stuData?.students ?? []);
        setApplications(appData?.applications ?? []);
        setAdminResources(contentData?.resources ?? []);
        setAdminBacheca(contentData?.bacheca ?? []);
        setLiveListings((listingsData?.listings || []).map((l: any) => ({
          id: l.id, title: l.title, department: l.department, company: l.company, location: l.location, spots: l.spots || 1,
        })));
        setFeedbackEntries(feedbackData?.feedback ?? []);
      })
      .catch((err) => {
        setError(err?.message ?? "Could not load admin data.");
        setSubmissions([]);
        setInsights(null);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => loadData(), []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this submission?")) return;
    const res = await fetch(`/api/admin/submissions/${id}`, { method: "DELETE" });
    if (res.ok) loadData();
  }

  function handleUnlockContent() {
    if (codeInput === ADMIN_SECRET) {
      setContentUnlocked(true);
      setCodeError(false);
    } else {
      setCodeError(true);
    }
  }

  async function handleAddResource(e: React.FormEvent) {
    e.preventDefault();
    setContentSubmitting(true);
    setContentSuccess("");
    const res = await fetch(`/api/admin/content?secret=${ADMIN_SECRET}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content_type: "resource",
        ...resourceForm,
        tags: resourceForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
      }),
    });
    if (res.ok) {
      setContentSuccess("Resource added successfully!");
      setResourceForm({ name: "", url: "", description: "", emoji: "🔗", tags: "" });
      loadData();
    }
    setContentSubmitting(false);
  }

  async function handleAddBacheca(e: React.FormEvent) {
    e.preventDefault();
    setContentSubmitting(true);
    setContentSuccess("");
    const res = await fetch(`/api/admin/content?secret=${ADMIN_SECRET}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content_type: "bacheca", ...bachecaForm }),
    });
    if (res.ok) {
      setContentSuccess("Entry added successfully!");
      setBachecaForm({ title: "", link: "", description: "", type: "scholarship", deadline: "", location: "" });
      loadData();
    }
    setContentSubmitting(false);
  }

  async function handleDeleteContent(type: "resource" | "bacheca", id: string) {
    if (!confirm("Delete this item? It will be removed from the resources page.")) return;
    await fetch(`/api/admin/content?secret=${ADMIN_SECRET}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content_type: type, id }),
    });
    loadData();
  }

  async function handleDeleteListing(id: string) {
    if (!confirm("Delete this internship listing? Students will no longer see it.")) return;
    const res = await fetch(`/api/admin/listings/${id}?secret=${ADMIN_SECRET}`, { method: "DELETE" });
    if (res.ok) loadData();
  }

  async function handleAddListing(e: React.FormEvent) {
    e.preventDefault();
    setListingSubmitting(true);
    setListingError(null);
    setListingSuccess(false);

    const res = await fetch(`/api/admin/listings?secret=${ADMIN_SECRET}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...listingForm,
        required_skills: listingForm.required_skills.split(",").map((s) => s.trim()).filter(Boolean),
        spots: parseInt(listingForm.spots) || 1,
        deadline: listingForm.deadline || null,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      setListingError(json.error || "Failed to create listing");
    } else {
      setListingSuccess(true);
      setListingForm({ title: "", department: "", location: "Accra, Ghana", duration: "3 months", description: "", required_skills: "", spots: "1", deadline: "", demo_task_required: false, company_name: "" });
      loadData();
    }
    setListingSubmitting(false);
  }

  function exportCSV(data: any[], filename: string) {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const csv = [headers.join(","), ...data.map((row) => headers.map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const archetypeLabels: Record<string, string> = {
    tech: "Tech Innovator",
    research: "Research Pioneer",
    impact: "Social Impact",
    creative: "Creative",
    business: "Business Builder",
  };

  const cityBreakdown = students.reduce<Record<string, number>>((acc, s) => {
    const c = s.city || "Unknown";
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});

  const ageBreakdown = students.reduce<Record<string, number>>((acc, s) => {
    const bracket = s.age < 18 ? "Under 18" : s.age <= 22 ? "18-22" : s.age <= 26 ? "23-26" : "27+";
    acc[bracket] = (acc[bracket] || 0) + 1;
    return acc;
  }, {});

  const avgRating = feedbackEntries.length > 0 ? (feedbackEntries.reduce((sum, f) => sum + f.rating, 0) / feedbackEntries.length).toFixed(1) : "—";

  const tabs = [
    { id: "dashboard", label: `📊 Dashboard` },
    { id: "applications", label: `📋 Applications (${applications.length})` },
    { id: "students", label: `👥 Students (${students.length})` },
    { id: "content", label: `📝 Content Manager` },
    { id: "add-listing", label: `➕ Add Listing` },
    { id: "feedback", label: `⭐ Feedback (${feedbackEntries.length})` },
  ] as const;

  return (
    <main className="min-h-screen relative z-10">
      <header className="glass-strong" style={{ borderBottom: "1px solid var(--glass-border)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold gradient-text">Pathfinder · Admin</h1>
          <div className="flex items-center gap-2">
            <Link href="/" className="nav-link">← Student intake</Link>
            <Link href="/resources" className="nav-link">Resources</Link>
            <Link href="/internships" className="nav-link">Internships</Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl" style={{ background: "var(--accent-gold-dim)", border: "1px solid rgba(245, 183, 49, 0.2)" }}>
            <p className="font-medium" style={{ color: "var(--accent-gold)" }}>Could not load dashboard</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{error}</p>
            <button onClick={loadData} className="mt-3 text-sm font-medium" style={{ color: "var(--accent-gold)" }}>Retry</button>
          </div>
        )}

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Students", value: students.length, color: "var(--accent-emerald)" },
            { label: "Applications", value: applications.length, color: "var(--accent-violet)" },
            { label: "Internships", value: liveListings.length, color: "var(--accent-blue)" },
            { label: "Resources", value: adminResources.length + 10, color: "var(--accent-gold)" },
            { label: "Scholarships", value: adminBacheca.length + 8, color: "var(--accent-rose)" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-4 text-center">
              <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all"
              style={{
                background: activeTab === tab.id
                  ? "linear-gradient(135deg, var(--accent-violet), #a855f7)"
                  : "var(--bg-card)",
                border: `1px solid ${activeTab === tab.id ? "rgba(139, 92, 246, 0.4)" : "var(--glass-border)"}`,
                color: activeTab === tab.id ? "white" : "var(--text-secondary)",
                boxShadow: activeTab === tab.id ? "0 4px 15px rgba(139, 92, 246, 0.3)" : "none",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── DASHBOARD TAB ─── */}
        {activeTab === "dashboard" && (
          <>
            <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <h2 className="text-2xl font-bold mb-6 gradient-text-violet">Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6">
                  <h3 className="text-sm font-medium mb-1" style={{ color: "var(--text-muted)" }}>Total submissions</h3>
                  <p className="text-3xl font-bold" style={{ color: "var(--accent-gold)" }}>{insights?.total_submissions ?? 0}</p>
                </div>
                <div className="glass-card p-6">
                  <h3 className="text-sm font-medium mb-3" style={{ color: "var(--text-muted)" }}>Top archetypes</h3>
                  <div className="space-y-2">
                    {insights?.top_archetypes?.length ? (
                      insights.top_archetypes.map((a) => (
                        <div key={a.id} className="flex justify-between text-sm">
                          <span style={{ color: "var(--text-secondary)" }}>{archetypeLabels[a.id] || a.id}</span>
                          <span className="font-semibold" style={{ color: "var(--accent-violet)" }}>{a.count}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm" style={{ color: "var(--text-muted)" }}>No data yet</p>
                    )}
                  </div>
                </div>
                <div className="glass-card p-6">
                  <h3 className="text-sm font-medium mb-3" style={{ color: "var(--text-muted)" }}>Top keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {insights?.top_keywords?.length ? (
                      insights.top_keywords.map((k) => (
                        <span key={k.word} className="badge badge-gold">{k.word} ({k.count})</span>
                      ))
                    ) : (
                      <p className="text-sm" style={{ color: "var(--text-muted)" }}>No data yet</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.section>

            <section>
              <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                Submissions ({submissions.length})
              </h2>
              {loading ? (
                <p style={{ color: "var(--text-muted)" }}>Loading...</p>
              ) : submissions.length === 0 ? (
                <p style={{ color: "var(--text-muted)" }}>No submissions yet.</p>
              ) : (
                <div className="space-y-4">
                  {submissions.map((s, i) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass-card p-4 flex justify-between items-start gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate max-w-2xl" style={{ color: "var(--text-primary)" }}>{s.dream_text}</p>
                        <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                          {new Date(s.created_at).toLocaleString()}
                          {s.embedding && " · ✓ embedded"}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                        style={{ color: "var(--accent-rose)", background: "var(--accent-rose-dim)" }}
                      >
                        Delete
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* ─── APPLICATIONS TAB ─── */}
        {activeTab === "applications" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold gradient-text-violet">Student Applications</h2>
              {applications.length > 0 && (
                <button
                  onClick={() => exportCSV(applications, "pathfinder_applications")}
                  className="btn-ghost text-xs"
                >
                  📥 Export CSV
                </button>
              )}
            </div>
            {loading ? (
              <p style={{ color: "var(--text-muted)" }}>Loading...</p>
            ) : applications.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <span className="text-4xl block mb-3">📋</span>
                <p className="font-medium mb-1" style={{ color: "var(--text-secondary)" }}>No applications yet</p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Applications will appear here when students apply to internships.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((a, i) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="glass-card p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>{a.student_name}</p>
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>{a.student_university} · {a.student_year}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="badge badge-violet">{a.company}</span>
                        <span className="badge badge-gold">{a.listing_title}</span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            background: a.status === "pending" ? "rgba(245,183,49,0.15)" : a.status === "accepted" ? "rgba(5,150,105,0.15)" : "rgba(220,38,38,0.15)",
                            color: a.status === "pending" ? "var(--accent-gold)" : a.status === "accepted" ? "var(--accent-emerald)" : "var(--accent-rose)",
                          }}
                        >
                          {a.status}
                        </span>
                      </div>
                    </div>

                    {a.cover_note && (
                      <p className="text-sm mb-3 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        &ldquo;{a.cover_note}&rdquo;
                      </p>
                    )}

                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Applied {new Date(a.created_at).toLocaleDateString()}
                      </p>
                      {a.cv_url && (
                        <a
                          href={a.cv_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                          style={{ background: "rgba(139,92,246,0.15)", color: "var(--accent-violet)", border: "1px solid rgba(139,92,246,0.2)" }}
                        >
                          View CV →
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ─── STUDENTS TAB ─── */}
        {activeTab === "students" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold gradient-text-violet">Registered Students</h2>
              {students.length > 0 && (
                <button
                  onClick={() => exportCSV(students.map((s) => ({
                    name: `${s.firstName} ${s.lastName}`, email: s.email, city: s.city, age: s.age, registered: s.registeredAt,
                  })), "pathfinder_students")}
                  className="btn-ghost text-xs"
                >
                  📥 Export CSV
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="glass-card p-6">
                <h3 className="text-sm font-medium mb-1" style={{ color: "var(--text-muted)" }}>Total Students</h3>
                <p className="text-3xl font-bold" style={{ color: "var(--accent-emerald)" }}>{students.length}</p>
              </div>
              <div className="glass-card p-6">
                <h3 className="text-sm font-medium mb-3" style={{ color: "var(--text-muted)" }}>By City</h3>
                <div className="space-y-2">
                  {Object.entries(cityBreakdown).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([city, count]) => (
                    <div key={city} className="flex justify-between text-sm">
                      <span style={{ color: "var(--text-secondary)" }}>{city}</span>
                      <span className="font-semibold" style={{ color: "var(--accent-blue)" }}>{count}</span>
                    </div>
                  ))}
                  {Object.keys(cityBreakdown).length === 0 && <p className="text-sm" style={{ color: "var(--text-muted)" }}>No data yet</p>}
                </div>
              </div>
              <div className="glass-card p-6">
                <h3 className="text-sm font-medium mb-3" style={{ color: "var(--text-muted)" }}>Age Distribution</h3>
                <div className="space-y-2">
                  {Object.entries(ageBreakdown).sort((a, b) => ["Under 18","18-22","23-26","27+"].indexOf(a[0]) - ["Under 18","18-22","23-26","27+"].indexOf(b[0])).map(([bracket, count]) => (
                    <div key={bracket} className="flex justify-between text-sm">
                      <span style={{ color: "var(--text-secondary)" }}>{bracket}</span>
                      <span className="font-semibold" style={{ color: "var(--accent-gold)" }}>{count}</span>
                    </div>
                  ))}
                  {Object.keys(ageBreakdown).length === 0 && <p className="text-sm" style={{ color: "var(--text-muted)" }}>No data yet</p>}
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>All Students</h3>
            {loading ? (
              <p style={{ color: "var(--text-muted)" }}>Loading...</p>
            ) : students.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <span className="text-4xl block mb-3">👥</span>
                <p className="font-medium mb-1" style={{ color: "var(--text-secondary)" }}>No students registered yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {students.map((s, i) => (
                  <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass-card p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "linear-gradient(135deg, var(--accent-violet), #a855f7)", color: "white" }}>
                          {s.firstName[0]}{s.lastName[0]}
                        </div>
                        <div>
                          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{s.firstName} {s.lastName}</p>
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{s.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="badge badge-blue">📍 {s.city}</span>
                        <span className="badge badge-gold">🎂 {s.age} yrs</span>
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>{new Date(s.registeredAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ─── CONTENT MANAGER TAB ─── */}
        {activeTab === "content" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-2xl font-bold mb-2 gradient-text-violet">Content Manager</h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              Add and remove resources, scholarships, and internship listings on the student-facing pages.
            </p>

            {/* Code lock gate */}
            {!contentUnlocked ? (
              <div className="glass-card p-8 max-w-md mx-auto text-center">
                <div className="text-5xl mb-4">🔐</div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>Enter Admin Code</h3>
                <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>To add or remove content, enter the admin code.</p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    className="input-dark flex-1"
                    placeholder="Admin code..."
                    value={codeInput}
                    onChange={(e) => { setCodeInput(e.target.value); setCodeError(false); }}
                    onKeyDown={(e) => e.key === "Enter" && handleUnlockContent()}
                  />
                  <button onClick={handleUnlockContent} className="btn-primary">Unlock</button>
                </div>
                {codeError && (
                  <p className="text-xs mt-3" style={{ color: "var(--accent-rose)" }}>Incorrect code. Try again.</p>
                )}
              </div>
            ) : (
              <>
                {/* Content sub-tabs */}
                <div className="flex gap-2 mb-6">
                  {([
                    { id: "resources", label: "🧰 Resources", count: adminResources.length },
                    { id: "scholarships", label: "📌 Scholarships", count: adminBacheca.length },
                    { id: "internships", label: "💼 Internships", count: liveListings.length },
                  ] as const).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setContentSection(s.id)}
                      className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                      style={{
                        background: contentSection === s.id ? "var(--accent-violet-dim)" : "var(--bg-card)",
                        border: `1px solid ${contentSection === s.id ? "rgba(139,92,246,0.3)" : "var(--glass-border)"}`,
                        color: contentSection === s.id ? "var(--accent-violet)" : "var(--text-secondary)",
                      }}
                    >
                      {s.label} ({s.count})
                    </button>
                  ))}
                </div>

                {contentSuccess && (
                  <div className="mb-4 p-3 rounded-xl" style={{ background: "rgba(5,150,105,0.1)", border: "1px solid rgba(5,150,105,0.2)" }}>
                    <p className="text-sm font-medium" style={{ color: "var(--accent-emerald)" }}>✓ {contentSuccess}</p>
                  </div>
                )}

                {/* ── Resources Section ── */}
                {contentSection === "resources" && (
                  <div className="space-y-6">
                    {/* Built-in default resources (read-only) */}
                    <div>
                      <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-muted)" }}>Built-in Resources (10)</h3>
                      <div className="space-y-2">
                        {[
                          { emoji: "🎬", name: "Savannah Skills", url: "savannah-vert.vercel.app" },
                          { emoji: "🚀", name: "The Forage", url: "theforage.com" },
                          { emoji: "🎓", name: "Coursera", url: "coursera.org" },
                          { emoji: "🌱", name: "Grow with Google", url: "grow.google" },
                          { emoji: "🌍", name: "ALX Africa", url: "alxafrica.com" },
                          { emoji: "💼", name: "LinkedIn Learning", url: "linkedin.com/learning" },
                          { emoji: "📖", name: "edX", url: "edx.org" },
                          { emoji: "🇬🇭", name: "Jobberman Ghana", url: "jobberman.com.gh" },
                          { emoji: "🤝", name: "YALI Network", url: "yali.state.gov" },
                          { emoji: "🐙", name: "GitHub Student Pack", url: "education.github.com/pack" },
                        ].map((r) => (
                          <div key={r.name} className="glass-card p-3 flex items-center justify-between gap-3" style={{ opacity: 0.7 }}>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm truncate" style={{ color: "var(--text-primary)" }}>{r.emoji} {r.name}</p>
                              <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{r.url}</p>
                            </div>
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-muted)" }}>Built-in</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Admin-added resources */}
                    {adminResources.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-muted)" }}>Admin-Added Resources ({adminResources.length})</h3>
                        <div className="space-y-2">
                          {adminResources.map((r) => (
                            <div key={r.id} className="glass-card p-4 flex items-center justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <p className="font-medium truncate" style={{ color: "var(--text-primary)" }}>{r.emoji} {r.name}</p>
                                <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{r.url}</p>
                              </div>
                              <button
                                onClick={() => handleDeleteContent("resource", r.id)}
                                className="shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg"
                                style={{ color: "var(--accent-rose)", background: "var(--accent-rose-dim)" }}
                              >
                                ❌ Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add resource form */}
                    <div className="glass-card p-6">
                      <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Add New Resource</h3>
                      <form onSubmit={handleAddResource} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Name *</label>
                            <input className="input-dark w-full" placeholder="e.g. Khan Academy" value={resourceForm.name} onChange={(e) => setResourceForm((f) => ({ ...f, name: e.target.value }))} required />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>URL *</label>
                            <input className="input-dark w-full" placeholder="https://..." value={resourceForm.url} onChange={(e) => setResourceForm((f) => ({ ...f, url: e.target.value }))} required />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Emoji</label>
                            <input className="input-dark w-full" placeholder="🔗" value={resourceForm.emoji} onChange={(e) => setResourceForm((f) => ({ ...f, emoji: e.target.value }))} />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Tags (comma-separated)</label>
                            <input className="input-dark w-full" placeholder="e.g. Free, STEM, Courses" value={resourceForm.tags} onChange={(e) => setResourceForm((f) => ({ ...f, tags: e.target.value }))} />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Description</label>
                          <textarea className="input-dark w-full" rows={2} placeholder="Brief description..." value={resourceForm.description} onChange={(e) => setResourceForm((f) => ({ ...f, description: e.target.value }))} style={{ resize: "none" }} />
                        </div>
                        <button type="submit" disabled={contentSubmitting} className="btn-primary">
                          {contentSubmitting ? "Adding..." : "Add Resource →"}
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* ── Scholarships Section ── */}
                {contentSection === "scholarships" && (
                  <div className="space-y-6">
                    {/* Built-in default scholarships (read-only) */}
                    <div>
                      <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-muted)" }}>Built-in Scholarships &amp; Programs (8)</h3>
                      <div className="space-y-2">
                        {[
                          { title: "Erasmus+ Exchange Program", type: "exchange", loc: "Europe" },
                          { title: "Chevening Scholarships", type: "scholarship", loc: "UK" },
                          { title: "Fulbright Student Program", type: "scholarship", loc: "Worldwide" },
                          { title: "DAAD — Study in Germany", type: "program", loc: "Germany" },
                          { title: "Mastercard Foundation Scholars", type: "scholarship", loc: "Africa & Global" },
                          { title: "Africa Oxford Initiative", type: "program", loc: "UK" },
                          { title: "Aga Khan Foundation", type: "scholarship", loc: "Worldwide" },
                          { title: "Mandela Washington Fellowship", type: "program", loc: "USA" },
                        ].map((b) => (
                          <div key={b.title} className="glass-card p-3 flex items-center justify-between gap-3" style={{ opacity: 0.7 }}>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="font-medium text-sm truncate" style={{ color: "var(--text-primary)" }}>{b.title}</p>
                                <span className="text-xs px-2 py-0.5 rounded-full" style={{
                                  background: b.type === "scholarship" ? "var(--accent-gold-dim)" : b.type === "program" ? "var(--accent-violet-dim)" : "var(--accent-emerald-dim)",
                                  color: b.type === "scholarship" ? "var(--accent-gold)" : b.type === "program" ? "var(--accent-violet)" : "var(--accent-emerald)",
                                }}>
                                  {b.type}
                                </span>
                              </div>
                              <p className="text-xs" style={{ color: "var(--text-muted)" }}>📍 {b.loc}</p>
                            </div>
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-muted)" }}>Built-in</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {adminBacheca.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-muted)" }}>Admin-Added Entries</h3>
                        <div className="space-y-2">
                          {adminBacheca.map((b) => (
                            <div key={b.id} className="glass-card p-4 flex items-center justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <p className="font-medium truncate" style={{ color: "var(--text-primary)" }}>{b.title}</p>
                                  <span className="text-xs px-2 py-0.5 rounded-full" style={{
                                    background: b.type === "scholarship" ? "var(--accent-gold-dim)" : b.type === "program" ? "var(--accent-violet-dim)" : "var(--accent-emerald-dim)",
                                    color: b.type === "scholarship" ? "var(--accent-gold)" : b.type === "program" ? "var(--accent-violet)" : "var(--accent-emerald)",
                                  }}>
                                    {b.type}
                                  </span>
                                </div>
                                <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{b.location || "Global"} · {b.deadline || "Open"}</p>
                              </div>
                              <button
                                onClick={() => handleDeleteContent("bacheca", b.id)}
                                className="shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg"
                                style={{ color: "var(--accent-rose)", background: "var(--accent-rose-dim)" }}
                              >
                                ❌ Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="glass-card p-6">
                      <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Add New Scholarship / Program / Exchange</h3>
                      <form onSubmit={handleAddBacheca} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Title *</label>
                            <input className="input-dark w-full" placeholder="e.g. Rhodes Scholarship" value={bachecaForm.title} onChange={(e) => setBachecaForm((f) => ({ ...f, title: e.target.value }))} required />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Link *</label>
                            <input className="input-dark w-full" placeholder="https://..." value={bachecaForm.link} onChange={(e) => setBachecaForm((f) => ({ ...f, link: e.target.value }))} required />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Type</label>
                            <select className="input-dark w-full" value={bachecaForm.type} onChange={(e) => setBachecaForm((f) => ({ ...f, type: e.target.value as any }))}>
                              <option value="scholarship">💰 Scholarship</option>
                              <option value="program">📚 Program</option>
                              <option value="exchange">🌍 Exchange</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Location</label>
                            <input className="input-dark w-full" placeholder="e.g. United Kingdom" value={bachecaForm.location} onChange={(e) => setBachecaForm((f) => ({ ...f, location: e.target.value }))} />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Deadline</label>
                            <input className="input-dark w-full" placeholder="e.g. November 2026" value={bachecaForm.deadline} onChange={(e) => setBachecaForm((f) => ({ ...f, deadline: e.target.value }))} />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Description</label>
                          <textarea className="input-dark w-full" rows={3} placeholder="Describe the opportunity..." value={bachecaForm.description} onChange={(e) => setBachecaForm((f) => ({ ...f, description: e.target.value }))} style={{ resize: "none" }} />
                        </div>
                        <button type="submit" disabled={contentSubmitting} className="btn-primary">
                          {contentSubmitting ? "Adding..." : "Add Entry →"}
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* ── Internships Section ── */}
                {contentSection === "internships" && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-muted)" }}>Live Internship Listings ({liveListings.length})</h3>
                    {liveListings.length === 0 ? (
                      <div className="glass-card p-6 text-center">
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>No live listings. Use the &ldquo;Add Listing&rdquo; tab to create one.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {liveListings.map((l) => (
                          <div key={l.id} className="glass-card p-4 flex items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="font-medium truncate" style={{ color: "var(--text-primary)" }}>{l.title}</p>
                                <span className="badge badge-gold text-xs">{l.department}</span>
                              </div>
                              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{l.company} · {l.location} · {l.spots} spot{l.spots !== 1 ? "s" : ""}</p>
                            </div>
                            <button
                              onClick={() => handleDeleteListing(l.id)}
                              className="shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg"
                              style={{ color: "var(--accent-rose)", background: "var(--accent-rose-dim)" }}
                            >
                              ❌ Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-xs mt-4" style={{ color: "var(--text-muted)" }}>
                      To add a new listing, go to the <button onClick={() => setActiveTab("add-listing")} className="underline" style={{ color: "var(--accent-violet)" }}>Add Listing</button> tab.
                    </p>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* ─── ADD LISTING TAB ─── */}
        {activeTab === "add-listing" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <h2 className="text-2xl font-bold mb-2 gradient-text-violet">Add Internship Listing</h2>
            <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>Post a new internship directly on behalf of a partner company.</p>

            {listingSuccess && (
              <div className="mb-6 p-4 rounded-xl" style={{ background: "rgba(5,150,105,0.1)", border: "1px solid rgba(5,150,105,0.2)" }}>
                <p className="font-medium" style={{ color: "var(--accent-emerald)" }}>Listing created successfully! It is now live for students.</p>
              </div>
            )}
            {listingError && (
              <div className="mb-6 p-4 rounded-xl" style={{ background: "var(--accent-rose-dim)", border: "1px solid rgba(220,38,38,0.2)" }}>
                <p className="font-medium" style={{ color: "var(--accent-rose)" }}>{listingError}</p>
              </div>
            )}

            <form onSubmit={handleAddListing} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Company Name *</label>
                  <input className="input-dark w-full" placeholder="e.g. MojoPay" value={listingForm.company_name} onChange={(e) => setListingForm((f) => ({ ...f, company_name: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Job Title *</label>
                  <input className="input-dark w-full" placeholder="e.g. Software Engineering Intern" value={listingForm.title} onChange={(e) => setListingForm((f) => ({ ...f, title: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Department *</label>
                  <select className="input-dark w-full" value={listingForm.department} onChange={(e) => setListingForm((f) => ({ ...f, department: e.target.value }))} required>
                    <option value="">Select department</option>
                    <option>Tech</option>
                    <option>Engineering</option>
                    <option>Finance</option>
                    <option>Marketing</option>
                    <option>Content</option>
                    <option>Business</option>
                    <option>Product</option>
                    <option>Data</option>
                    <option>Impact</option>
                    <option>Operations</option>
                    <option>Design</option>
                    <option>HR</option>
                    <option>Legal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Location</label>
                  <input className="input-dark w-full" placeholder="e.g. Accra, Ghana" value={listingForm.location} onChange={(e) => setListingForm((f) => ({ ...f, location: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Duration</label>
                  <input className="input-dark w-full" placeholder="e.g. 3 months" value={listingForm.duration} onChange={(e) => setListingForm((f) => ({ ...f, duration: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Spots Available</label>
                  <input type="number" min="1" className="input-dark w-full" value={listingForm.spots} onChange={(e) => setListingForm((f) => ({ ...f, spots: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Application Deadline</label>
                  <input type="date" className="input-dark w-full" value={listingForm.deadline} onChange={(e) => setListingForm((f) => ({ ...f, deadline: e.target.value }))} />
                </div>
                <div className="flex items-center gap-3 pt-5">
                  <input type="checkbox" id="demo_task" checked={listingForm.demo_task_required} onChange={(e) => setListingForm((f) => ({ ...f, demo_task_required: e.target.checked }))} className="w-4 h-4" />
                  <label htmlFor="demo_task" className="text-sm" style={{ color: "var(--text-secondary)" }}>Demo task required</label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Description *</label>
                <textarea
                  className="input-dark w-full"
                  rows={4}
                  placeholder="Describe the role, responsibilities, and what the intern will learn..."
                  value={listingForm.description}
                  onChange={(e) => setListingForm((f) => ({ ...f, description: e.target.value }))}
                  style={{ resize: "vertical" }}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Required Skills (comma-separated)</label>
                <input className="input-dark w-full" placeholder="e.g. JavaScript, React, Node.js" value={listingForm.required_skills} onChange={(e) => setListingForm((f) => ({ ...f, required_skills: e.target.value }))} />
              </div>

              <button type="submit" disabled={listingSubmitting} className="btn-primary w-full">
                {listingSubmitting ? "Creating..." : "Create Listing →"}
              </button>
            </form>
          </motion.div>
        )}

        {/* ─── FEEDBACK TAB ─── */}
        {activeTab === "feedback" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold gradient-text-violet">User Feedback</h2>
              {feedbackEntries.length > 0 && (
                <button
                  onClick={() => exportCSV(feedbackEntries.map((f) => ({
                    rating: f.rating,
                    note: f.note || "",
                    student: f.student_name || f.student_email || f.student_id,
                    date: new Date(f.created_at).toLocaleDateString(),
                  })), "pathfinder_feedback")}
                  className="btn-ghost text-xs"
                >
                  📥 Export CSV
                </button>
              )}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="glass-card p-6 text-center">
                <p className="text-4xl font-bold mb-1" style={{ color: "var(--accent-gold)" }}>{avgRating}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Average Rating</p>
                <div className="flex justify-center gap-0.5 mt-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className="text-lg" style={{ opacity: s <= Math.round(Number(avgRating) || 0) ? 1 : 0.2 }}>⭐</span>
                  ))}
                </div>
              </div>
              <div className="glass-card p-6 text-center">
                <p className="text-4xl font-bold mb-1" style={{ color: "var(--accent-emerald)" }}>{feedbackEntries.length}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Total Responses</p>
              </div>
              <div className="glass-card p-6">
                <h3 className="text-sm font-medium mb-3" style={{ color: "var(--text-muted)" }}>Rating Distribution</h3>
                <div className="space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = feedbackEntries.filter((f) => f.rating === star).length;
                    const pct = feedbackEntries.length > 0 ? (count / feedbackEntries.length) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-2 text-xs">
                        <span style={{ color: "var(--text-muted)", width: "20px" }}>{star}⭐</span>
                        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: star >= 4 ? "var(--accent-emerald)" : star >= 3 ? "var(--accent-gold)" : "var(--accent-rose)" }} />
                        </div>
                        <span className="font-medium" style={{ color: "var(--text-secondary)", width: "24px", textAlign: "right" }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Feedback list */}
            {feedbackEntries.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <span className="text-4xl block mb-3">⭐</span>
                <p className="font-medium mb-1" style={{ color: "var(--text-secondary)" }}>No feedback yet</p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Feedback will appear here when students rate Pathfinder.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {feedbackEntries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((f, i) => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="glass-card p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <span key={s} className="text-sm" style={{ opacity: s <= f.rating ? 1 : 0.2 }}>⭐</span>
                            ))}
                          </div>
                          {f.student_name && (
                            <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{f.student_name}</span>
                          )}
                        </div>
                        {f.note && (
                          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                            &ldquo;{f.note}&rdquo;
                          </p>
                        )}
                      </div>
                      <span className="text-xs shrink-0" style={{ color: "var(--text-muted)" }}>
                        {new Date(f.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </main>
  );
}
