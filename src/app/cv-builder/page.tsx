"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import MobileNav from "@/components/MobileNav";
import CoverLetterBuilder from "@/components/CoverLetterBuilder";
import { CAREER_PATHS, getCareerById } from "@/lib/careers";

interface Education { school: string; degree: string; year: string; notes: string; }
interface Experience { company: string; role: string; duration: string; description: string; }
interface Language { name: string; level: string; }
interface Certification { title: string; issuer: string; year: string; }

interface CVData {
  fullName: string; email: string; phone: string; location: string;
  linkedIn: string; portfolio: string;
  targetCareerId: string; summary: string;
  education: Education[]; experience: Experience[];
  skills: string; languages: Language[];
  certifications: Certification[];
  referencesNote: string;
}

type TemplateId = "modern" | "classic" | "minimal" | "executive" | "creative";
type ActiveTab = "cv" | "cover-letter";
type SummaryTone = "professional" | "creative" | "confident";

const TEMPLATES: { id: TemplateId; name: string; desc: string; accent: string }[] = [
  { id: "modern", name: "Modern", desc: "Violet accents, clean", accent: "#8b5cf6" },
  { id: "classic", name: "Classic", desc: "Navy serif, traditional", accent: "#1e3a5f" },
  { id: "minimal", name: "Minimal", desc: "B&W, ultra-clean", accent: "#111827" },
  { id: "executive", name: "Executive", desc: "Dark navy, gold accents", accent: "#c9952f" },
  { id: "creative", name: "Creative", desc: "Gradient header, bold", accent: "#ec4899" },
];

const FONT_OPTIONS = [
  { id: "inter", label: "Inter", value: "'Inter', sans-serif" },
  { id: "georgia", label: "Georgia", value: "'Georgia', serif" },
  { id: "helvetica", label: "Helvetica", value: "'Helvetica Neue', sans-serif" },
  { id: "roboto", label: "Roboto", value: "'Roboto', sans-serif" },
];

const ACCENT_COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#1e3a5f", "#111827"];

const CAREER_RECOMMENDATIONS: Record<string, { suggestedSkills: string[]; keywords: string[]; tips: string[] }> = {
  "software-developer": {
    suggestedSkills: ["Git & Version Control", "REST APIs", "Agile/Scrum", "Unit Testing", "CI/CD Pipelines"],
    keywords: ["full-stack", "scalable", "microservices", "performance optimization", "code review"],
    tips: ["Include links to GitHub projects", "Quantify impact (e.g., reduced load time by 40%)", "Mention specific frameworks"],
  },
  "data-analyst": {
    suggestedSkills: ["SQL & Python", "Data Visualization (Tableau/PowerBI)", "Statistical Analysis", "Excel Advanced", "ETL Processes"],
    keywords: ["data-driven", "actionable insights", "dashboard", "KPI tracking", "trend analysis"],
    tips: ["Highlight business outcomes from your analysis", "Mention dataset sizes", "Show multiple visualization tools"],
  },
  "digital-marketing-manager": {
    suggestedSkills: ["Google Analytics", "SEO/SEM", "Content Marketing", "Social Media Strategy", "A/B Testing"],
    keywords: ["ROI", "conversion rate", "engagement", "campaign optimization", "brand awareness"],
    tips: ["Include metrics: CTR, conversion rates, ROAS", "Mention budget sizes managed", "Show cross-channel experience"],
  },
  "product-owner": {
    suggestedSkills: ["Stakeholder Management", "User Story Writing", "Sprint Planning", "Roadmapping", "A/B Testing"],
    keywords: ["product vision", "user-centric", "backlog prioritization", "data-driven decisions", "cross-functional"],
    tips: ["Quantify product impact on revenue/growth", "Mention team sizes", "Show product analytics tools"],
  },
  "fintech-developer": {
    suggestedSkills: ["API Development", "Mobile Money Integration", "Payment Security", "Database Design", "React Native / Flutter"],
    keywords: ["financial technology", "payment processing", "mobile banking", "USSD", "PCI compliance"],
    tips: ["Highlight African payment platforms (MoMo)", "Mention security certifications", "Show transaction volumes"],
  },
  "agribusiness-manager": {
    suggestedSkills: ["Supply Chain Logistics", "Farm Management Software", "Market Analysis", "Negotiation", "Quality Assurance"],
    keywords: ["value chain", "farm-to-market", "export compliance", "crop yield optimization", "sustainable agriculture"],
    tips: ["Mention specific crops/commodities", "Include tonnage or revenue figures", "Show COCOBOD knowledge"],
  },
  "ngo-programme-officer": {
    suggestedSkills: ["M&E Frameworks", "Grant Writing", "Stakeholder Engagement", "Budget Management", "SPSS/Stata"],
    keywords: ["impact measurement", "theory of change", "capacity building", "community mobilization", "donor reporting"],
    tips: ["Highlight grant amounts secured", "Show beneficiary numbers reached", "Mention specific donors"],
  },
};

const DEFAULT_RECOMMENDATIONS = {
  suggestedSkills: ["Communication", "Problem Solving", "Teamwork", "Time Management", "Adaptability"],
  keywords: ["results-oriented", "collaborative", "innovative", "detail-oriented", "proactive"],
  tips: ["Use action verbs: Led, Developed, Implemented", "Quantify achievements wherever possible", "Tailor CV to each role"],
};

const ACTION_VERBS = ["Achieved","Developed","Implemented","Led","Managed","Designed","Analyzed","Coordinated","Established","Improved","Launched","Negotiated","Optimized","Spearheaded","Streamlined","Transformed"];

const INITIAL_CV: CVData = {
  fullName: "", email: "", phone: "", location: "",
  linkedIn: "", portfolio: "",
  targetCareerId: "", summary: "",
  education: [{ school: "", degree: "", year: "", notes: "" }],
  experience: [{ company: "", role: "", duration: "", description: "" }],
  skills: "", languages: [{ name: "", level: "" }],
  certifications: [{ title: "", issuer: "", year: "" }],
  referencesNote: "",
};

function getTemplateStyles(t: TemplateId, customAccent?: string, customFont?: string) {
  const accent = customAccent || TEMPLATES.find((x) => x.id === t)?.accent || "#8b5cf6";
  const font = customFont || (t === "classic" ? "'Georgia', serif" : t === "minimal" ? "'Helvetica Neue', sans-serif" : "'Inter', sans-serif");
  switch (t) {
    case "modern": return { bg: "white", color: "#1a1a2e", accent, accentLight: "#ede9fe", accentText: accent, font, headingBorder: `2px solid ${accent}40` };
    case "classic": return { bg: "#fefefe", color: "#1e3a5f", accent, accentLight: "#e8eef5", accentText: accent, font, headingBorder: `2px solid ${accent}` };
    case "minimal": return { bg: "white", color: "#111827", accent, accentLight: "#f3f4f6", accentText: "#374151", font, headingBorder: "1px solid #d1d5db" };
    case "executive": return { bg: "#fafaf8", color: "#1a1a2e", accent, accentLight: "#fef3c7", accentText: accent, font, headingBorder: `2px solid ${accent}` };
    case "creative": return { bg: "white", color: "#1a1a2e", accent, accentLight: `${accent}18`, accentText: accent, font, headingBorder: `3px solid ${accent}` };
  }
}

function calcATSScore(cv: CVData): number {
  let score = 0;
  if (cv.fullName.trim()) score += 10;
  if (cv.email.trim()) score += 8;
  if (cv.phone.trim()) score += 5;
  if (cv.location.trim()) score += 5;
  if (cv.summary.trim()) score += 15;
  if (cv.summary.length > 100) score += 5;
  const skills = cv.skills.split(",").map(s => s.trim()).filter(Boolean);
  score += Math.min(skills.length * 3, 15);
  const expCount = cv.experience.filter(e => e.company && e.role).length;
  score += Math.min(expCount * 8, 16);
  const descWords = cv.experience.reduce((n, e) => n + e.description.split(" ").length, 0);
  if (descWords > 30) score += 5;
  const eduCount = cv.education.filter(e => e.school || e.degree).length;
  score += Math.min(eduCount * 6, 12);
  if (cv.linkedIn.trim()) score += 2;
  if (cv.portfolio.trim()) score += 2;
  if (cv.targetCareerId) {
    const recs = CAREER_RECOMMENDATIONS[cv.targetCareerId];
    if (recs) {
      const matchedKw = recs.keywords.filter(kw => cv.summary.toLowerCase().includes(kw) || cv.skills.toLowerCase().includes(kw));
      score += Math.min(matchedKw.length * 2, 6);
    }
  }
  return Math.min(score, 100);
}

function CVBuilderContent() {
  const searchParams = useSearchParams();
  const previewRef = useRef<HTMLDivElement>(null);
  const [cv, setCv] = useState<CVData>(INITIAL_CV);
  const [template, setTemplate] = useState<TemplateId>("modern");
  const [customAccent, setCustomAccent] = useState<string>("#8b5cf6");
  const [customFont, setCustomFont] = useState<string>("'Inter', sans-serif");
  const [activeTab, setActiveTab] = useState<ActiveTab>("cv");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showRecs, setShowRecs] = useState(false);
  const [summaryTone, setSummaryTone] = useState<SummaryTone>("professional");
  const [bulletLoading, setBulletLoading] = useState<number | null>(null);
  const [educationFirst, setEducationFirst] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [nameFontSize, setNameFontSize] = useState(28);
  const [titleFontSize, setTitleFontSize] = useState(14);
  const [bodyFontSize, setBodyFontSize] = useState(14);

  useEffect(() => {
    const careerId = searchParams.get("career");
    if (careerId) setCv((prev) => ({ ...prev, targetCareerId: careerId }));
  }, [searchParams]);

  const targetCareer = cv.targetCareerId ? getCareerById(cv.targetCareerId) : null;
  const recs = CAREER_RECOMMENDATIONS[cv.targetCareerId] || DEFAULT_RECOMMENDATIONS;
  const skillsList = cv.skills.split(",").map((s) => s.trim()).filter(Boolean);
  const atsScore = calcATSScore(cv);
  const s = getTemplateStyles(template, customAccent, customFont);

  // Skills gap
  const gapSkills = targetCareer
    ? targetCareer.growthAreas.map(g => g.skill).filter(sk => !skillsList.some(s => s.toLowerCase().includes(sk.toLowerCase())))
    : [];

  function updateField(field: keyof CVData, value: string) { setCv((prev) => ({ ...prev, [field]: value })); }
  function updateEducation(i: number, field: keyof Education, value: string) { setCv((prev) => { const ed = [...prev.education]; ed[i] = { ...ed[i], [field]: value }; return { ...prev, education: ed }; }); }
  function addEducation() { setCv((prev) => ({ ...prev, education: [...prev.education, { school: "", degree: "", year: "", notes: "" }] })); }
  function removeEducation(i: number) { setCv((prev) => ({ ...prev, education: prev.education.filter((_, j) => j !== i) })); }
  function updateExperience(i: number, field: keyof Experience, value: string) { setCv((prev) => { const exp = [...prev.experience]; exp[i] = { ...exp[i], [field]: value }; return { ...prev, experience: exp }; }); }
  function addExperience() { setCv((prev) => ({ ...prev, experience: [...prev.experience, { company: "", role: "", duration: "", description: "" }] })); }
  function removeExperience(i: number) { setCv((prev) => ({ ...prev, experience: prev.experience.filter((_, j) => j !== i) })); }
  function updateLanguage(i: number, field: keyof Language, value: string) { setCv((prev) => { const l = [...prev.languages]; l[i] = { ...l[i], [field]: value }; return { ...prev, languages: l }; }); }
  function addLanguage() { setCv((prev) => ({ ...prev, languages: [...prev.languages, { name: "", level: "" }] })); }
  function removeLanguage(i: number) { setCv((prev) => ({ ...prev, languages: prev.languages.filter((_, j) => j !== i) })); }
  function updateCertification(i: number, field: keyof Certification, value: string) { setCv((prev) => { const c = [...prev.certifications]; c[i] = { ...c[i], [field]: value }; return { ...prev, certifications: c }; }); }
  function addCertification() { setCv((prev) => ({ ...prev, certifications: [...prev.certifications, { title: "", issuer: "", year: "" }] })); }
  function removeCertification(i: number) { setCv((prev) => ({ ...prev, certifications: prev.certifications.filter((_, j) => j !== i) })); }
  function addSkillFromRec(skill: string) { const current = cv.skills.split(",").map(s => s.trim()).filter(Boolean); if (!current.includes(skill)) updateField("skills", [...current, skill].join(", ")); }
  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setPhotoPreview(reader.result as string); reader.readAsDataURL(file); } }

  async function handleAIEnhance() {
    setAiLoading(true); setAiError(null);
    try {
      const res = await fetch("/api/cv/generate", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: cv.fullName, targetCareerId: cv.targetCareerId, skills: cv.skills, experience: cv.experience, education: cv.education, tone: summaryTone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      if (data.summary) setCv((prev) => ({ ...prev, summary: data.summary }));
      if (data.skills) setCv((prev) => ({ ...prev, skills: data.skills }));
    } catch (err) { setAiError(err instanceof Error ? err.message : "AI enhancement failed"); }
    finally { setAiLoading(false); }
  }

  async function enhanceBullet(i: number) {
    setBulletLoading(i);
    const exp = cv.experience[i];
    try {
      const res = await fetch("/api/cv/generate", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: cv.fullName, targetCareerId: cv.targetCareerId, skills: cv.skills, experience: [exp], education: cv.education, enhanceBullet: true, enhanceRole: exp.role, enhanceCompany: exp.company }),
      });
      const data = await res.json();
      if (data.summary) {
        updateExperience(i, "description", data.summary);
      }
    } catch {} finally { setBulletLoading(null); }
  }

  function handleDownloadPDF() {
    const content = previewRef.current; if (!content) return;
    fetch("/api/activity", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "cv_builder", data: { name: cv.fullName, target_career: cv.targetCareerId, template } }) }).catch(() => {});
    const printWindow = window.open("", "_blank"); if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html><html><head><title>${cv.fullName || "CV"} - Resume</title>
<style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Roboto:wght@400;500;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}body{font-family:${s.font};color:${s.color};background:white;padding:40px;line-height:1.6}
@media print{body{padding:20px}}</style></head><body>${content.innerHTML}</body></html>`);
    printWindow.document.close(); setTimeout(() => printWindow.print(), 300);
  }

  // Preview sections
  const eduSection = cv.education.filter(e => e.school || e.degree).length > 0;
  const expSection = cv.experience.filter(e => e.company || e.role).length > 0;
  const langSection = cv.languages.filter(l => l.name).length > 0;
  const certSection = cv.certifications.filter(c => c.title).length > 0;

  return (
    <main className="min-h-screen relative z-10">
      <header className="glass-strong" style={{ borderBottom: "1px solid var(--glass-border)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-lg font-bold gradient-text">Pathfinder</Link>
          <MobileNav />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mb-6">
          {([{ id: "cv", label: "📄 CV Builder" }, { id: "cover-letter", label: "✉️ Cover Letter" }] as const).map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all"
              style={{
                background: activeTab === tab.id ? "linear-gradient(135deg, var(--accent-violet), #a855f7)" : "var(--bg-card)",
                border: `1px solid ${activeTab === tab.id ? "rgba(139,92,246,0.4)" : "var(--glass-border)"}`,
                color: activeTab === tab.id ? "white" : "var(--text-secondary)",
                boxShadow: activeTab === tab.id ? "0 4px 15px rgba(139,92,246,0.3)" : "none",
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
        {activeTab === "cover-letter" ? (
          <motion.div key="cl" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <h1 className="text-3xl font-bold gradient-text-violet mb-2">Cover Letter Builder</h1>
            <p className="mb-6" style={{ color: "var(--text-secondary)" }}>Generate a personalized cover letter using your CV data and AI.</p>
            <CoverLetterBuilder cvData={cv} />
          </motion.div>
        ) : (
          <motion.div key="cv" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <h1 className="text-3xl font-bold gradient-text-violet mb-2">CV Builder</h1>
            <p className="mb-6" style={{ color: "var(--text-secondary)" }}>Build a professional CV with AI-powered suggestions, advanced personalization, and multiple templates.</p>

            {/* ATS Score Bar */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>📊 ATS Compatibility Score</span>
                <span className="text-lg font-bold" style={{ color: atsScore >= 70 ? "var(--accent-emerald)" : atsScore >= 40 ? "var(--accent-gold)" : "var(--accent-rose)" }}>{atsScore}/100</span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-card)" }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${atsScore}%` }} transition={{ duration: 0.8 }}
                  className="h-full rounded-full" style={{ background: atsScore >= 70 ? "var(--accent-emerald)" : atsScore >= 40 ? "var(--accent-gold)" : "var(--accent-rose)" }} />
              </div>
              <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
                {atsScore >= 70 ? "Great! Your CV is well-optimized." : atsScore >= 40 ? "Good start — add more details to boost your score." : "Tip: Fill in more sections to improve your ATS score."}
              </p>
            </motion.div>

            {/* Template + Personalization */}
            <div className="glass-card p-5 mb-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--accent-gold)" }}>Template & Style</h2>
              <div className="grid grid-cols-5 gap-3 mb-4">
                {TEMPLATES.map((t) => (
                  <button key={t.id} onClick={() => { setTemplate(t.id); setCustomAccent(t.accent); }}
                    className="relative p-3 rounded-xl text-left transition-all"
                    style={{ background: template === t.id ? "var(--accent-violet-dim)" : "var(--bg-card)", border: template === t.id ? "2px solid rgba(139,92,246,0.4)" : "2px solid var(--glass-border)" }}>
                    {template === t.id && <span className="absolute top-1.5 right-1.5 text-xs px-1.5 py-0.5 rounded-full" style={{ background: "var(--accent-violet)", color: "white", fontSize: 10 }}>✓</span>}
                    <div className="h-6 w-full rounded-md mb-2 flex items-end p-0.5 gap-0.5" style={{ background: "white", border: "1px solid #e5e7eb" }}>
                      <div className="h-1.5 rounded" style={{ width: "60%", background: t.accent }} />
                      <div className="h-1 rounded" style={{ width: "30%", background: "#e5e7eb" }} />
                    </div>
                    <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{t.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)", fontSize: 10 }}>{t.desc}</p>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Accent Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {ACCENT_COLORS.map((c) => (
                      <button key={c} onClick={() => setCustomAccent(c)} className="w-7 h-7 rounded-full transition-transform" style={{ background: c, border: customAccent === c ? "3px solid white" : "2px solid transparent", transform: customAccent === c ? "scale(1.2)" : "scale(1)" }} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Font</label>
                  <select className="input-dark w-full text-sm" value={customFont} onChange={(e) => setCustomFont(e.target.value)}>
                    {FONT_OPTIONS.map((f) => <option key={f.id} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Section Order</label>
                  <button onClick={() => setEducationFirst(!educationFirst)} className="input-dark w-full text-sm text-left">
                    {educationFirst ? "📚 Education → 💼 Experience" : "💼 Experience → 📚 Education"}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Name Size</label>
                  <select className="input-dark w-full text-sm" value={nameFontSize} onChange={(e) => setNameFontSize(Number(e.target.value))}>
                    <option value={24}>Small (24px)</option>
                    <option value={28}>Medium (28px)</option>
                    <option value={32}>Large (32px)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Title Size</label>
                  <select className="input-dark w-full text-sm" value={titleFontSize} onChange={(e) => setTitleFontSize(Number(e.target.value))}>
                    <option value={12}>Small (12px)</option>
                    <option value={14}>Medium (14px)</option>
                    <option value={16}>Large (16px)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Body Text Size</label>
                  <select className="input-dark w-full text-sm" value={bodyFontSize} onChange={(e) => setBodyFontSize(Number(e.target.value))}>
                    <option value={12}>Small (12px)</option>
                    <option value={13}>Medium (13px)</option>
                    <option value={14}>Large (14px)</option>
                    <option value={15}>Extra Large (15px)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form Side */}
              <div className="space-y-5">
                {/* Target Career */}
                <div className="glass-card p-5">
                  <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--accent-gold)" }}>Target Career</h2>
                  <select value={cv.targetCareerId} onChange={(e) => updateField("targetCareerId", e.target.value)} className="input-dark w-full">
                    <option value="">Select a career to target...</option>
                    {CAREER_PATHS.map((c) => (<option key={c.id} value={c.id}>{c.title}</option>))}
                  </select>
                  {targetCareer && (
                    <div className="mt-3 p-3 rounded-xl" style={{ background: "var(--accent-gold-dim)", border: "1px solid rgba(245,183,49,0.15)" }}>
                      <p className="text-sm" style={{ color: "var(--accent-gold)" }}><strong>{targetCareer.title}</strong>{targetCareer.salaryRange && ` · ${targetCareer.salaryRange}`}</p>
                    </div>
                  )}
                </div>

                {/* AI Recs */}
                <div className="glass-card p-5">
                  <button onClick={() => setShowRecs(!showRecs)} className="w-full flex items-center justify-between">
                    <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--accent-emerald)" }}>🤖 AI Recommendations</h2>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{showRecs ? "▲ Hide" : "▼ Show"}</span>
                  </button>
                  {showRecs && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 space-y-4">
                      <div>
                        <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>Suggested Skills — click to add:</p>
                        <div className="flex flex-wrap gap-2">
                          {recs.suggestedSkills.map((skill) => (
                            <button key={skill} onClick={() => addSkillFromRec(skill)} className="text-xs px-3 py-1.5 rounded-lg transition-all"
                              style={{ background: skillsList.includes(skill) ? "var(--accent-emerald)" : "var(--bg-secondary)", color: skillsList.includes(skill) ? "white" : "var(--text-secondary)", border: `1px solid ${skillsList.includes(skill) ? "transparent" : "var(--glass-border)"}` }}>
                              {skillsList.includes(skill) ? "✓ " : "+ "}{skill}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>Industry Keywords:</p>
                        <div className="flex flex-wrap gap-2">
                          {recs.keywords.map((kw) => (<span key={kw} className="text-xs px-2 py-1 rounded-md" style={{ background: "var(--accent-violet-dim)", color: "#c084fc", border: "1px solid rgba(139,92,246,0.2)" }}>{kw}</span>))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>Pro Tips:</p>
                        <ul className="space-y-1.5">{recs.tips.map((tip, i) => (<li key={i} className="text-xs flex items-start gap-2" style={{ color: "var(--text-secondary)" }}><span style={{ color: "var(--accent-gold)" }}>💡</span> {tip}</li>))}</ul>
                      </div>
                      {/* Skills Gap */}
                      {gapSkills.length > 0 && (
                        <div className="p-3 rounded-xl" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
                          <p className="text-xs font-semibold mb-2" style={{ color: "var(--accent-rose)" }}>🔍 Skills Gap — Missing for {targetCareer?.title}:</p>
                          <div className="flex flex-wrap gap-2">
                            {gapSkills.map((sk) => (
                              <button key={sk} onClick={() => addSkillFromRec(sk)} className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(239,68,68,0.1)", color: "var(--accent-rose)", border: "1px solid rgba(239,68,68,0.2)" }}>+ {sk}</button>
                            ))}
                          </div>
                        </div>
                      )}
                      <div><p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Action Verbs:</p><p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{ACTION_VERBS.join(" · ")}</p></div>
                    </motion.div>
                  )}
                </div>

                {/* Personal Info */}
                <div className="glass-card p-5">
                  <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--accent-gold)" }}>Personal Information</h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <label className="shrink-0 w-16 h-16 rounded-full flex items-center justify-center cursor-pointer overflow-hidden" style={{ background: "var(--bg-card)", border: "2px dashed var(--glass-border)" }}>
                        {photoPreview ? <img src={photoPreview} alt="" className="w-full h-full object-cover" /> : <span className="text-xs" style={{ color: "var(--text-muted)" }}>📷</span>}
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                      </label>
                      <input type="text" placeholder="Full Name" value={cv.fullName} onChange={(e) => updateField("fullName", e.target.value)} className="input-dark flex-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="email" placeholder="Email" value={cv.email} onChange={(e) => updateField("email", e.target.value)} className="input-dark" />
                      <input type="tel" placeholder="Phone" value={cv.phone} onChange={(e) => updateField("phone", e.target.value)} className="input-dark" />
                    </div>
                    <input type="text" placeholder="Location (e.g. Accra, Ghana)" value={cv.location} onChange={(e) => updateField("location", e.target.value)} className="input-dark w-full" />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="url" placeholder="LinkedIn URL (optional)" value={cv.linkedIn} onChange={(e) => updateField("linkedIn", e.target.value)} className="input-dark text-sm" />
                      <input type="url" placeholder="Portfolio URL (optional)" value={cv.portfolio} onChange={(e) => updateField("portfolio", e.target.value)} className="input-dark text-sm" />
                    </div>
                  </div>
                </div>

                {/* Summary with tone */}
                <div className="glass-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--accent-gold)" }}>Professional Summary</h2>
                    <div className="flex items-center gap-2">
                      <select className="input-dark text-xs py-1 px-2" value={summaryTone} onChange={(e) => setSummaryTone(e.target.value as SummaryTone)}>
                        <option value="professional">Professional</option>
                        <option value="creative">Creative</option>
                        <option value="confident">Confident</option>
                      </select>
                      <button onClick={handleAIEnhance} disabled={aiLoading} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5">
                        {aiLoading ? (<><svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Enhancing...</>) : "✨ AI Enhance"}
                      </button>
                    </div>
                  </div>
                  {aiError && <p className="text-xs mb-2" style={{ color: "var(--accent-rose)" }}>{aiError}</p>}
                  <textarea placeholder="Write a brief professional summary, or click 'AI Enhance'..." value={cv.summary} onChange={(e) => updateField("summary", e.target.value)} rows={4} className="input-dark w-full resize-none" />
                </div>

                {/* Education */}
                <div className="glass-card p-5">
                  <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--accent-gold)" }}>Education</h2>
                  {cv.education.map((edu, i) => (
                    <div key={i} className="mb-4 last:mb-0">
                      {i > 0 && <div className="mb-3" style={{ borderTop: "1px solid var(--glass-border)" }} />}
                      <div className="space-y-2">
                        <input type="text" placeholder="School / University" value={edu.school} onChange={(e) => updateEducation(i, "school", e.target.value)} className="input-dark w-full text-sm" />
                        <div className="grid grid-cols-3 gap-2">
                          <input type="text" placeholder="Degree" value={edu.degree} onChange={(e) => updateEducation(i, "degree", e.target.value)} className="input-dark col-span-2 text-sm" />
                          <input type="text" placeholder="Year" value={edu.year} onChange={(e) => updateEducation(i, "year", e.target.value)} className="input-dark text-sm" />
                        </div>
                        {cv.education.length > 1 && <button onClick={() => removeEducation(i)} className="text-xs" style={{ color: "var(--accent-rose)" }}>Remove</button>}
                        <textarea placeholder="Notes (e.g. GPA, honors, relevant coursework)" value={edu.notes || ""} onChange={(e) => updateEducation(i, "notes", e.target.value)} rows={2} className="input-dark w-full text-sm resize-none mt-1" />
                      </div>
                    </div>
                  ))}
                  <button onClick={addEducation} className="mt-2 text-sm font-medium" style={{ color: "var(--accent-violet)" }}>+ Add Education</button>
                </div>

                {/* Experience with bullet enhancer */}
                <div className="glass-card p-5">
                  <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--accent-gold)" }}>Experience</h2>
                  {cv.experience.map((exp, i) => (
                    <div key={i} className="mb-4 last:mb-0">
                      {i > 0 && <div className="mb-3" style={{ borderTop: "1px solid var(--glass-border)" }} />}
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <input type="text" placeholder="Company" value={exp.company} onChange={(e) => updateExperience(i, "company", e.target.value)} className="input-dark text-sm" />
                          <input type="text" placeholder="Role" value={exp.role} onChange={(e) => updateExperience(i, "role", e.target.value)} className="input-dark text-sm" />
                        </div>
                        <input type="text" placeholder="Duration (e.g. Jun 2024 – Present)" value={exp.duration} onChange={(e) => updateExperience(i, "duration", e.target.value)} className="input-dark w-full text-sm" />
                        <div className="relative">
                          <textarea placeholder="Describe your responsibilities..." value={exp.description} onChange={(e) => updateExperience(i, "description", e.target.value)} rows={3} className="input-dark w-full text-sm resize-none" />
                          {exp.description.trim() && (
                            <button onClick={() => enhanceBullet(i)} disabled={bulletLoading === i}
                              className="absolute top-2 right-2 text-xs px-2 py-1 rounded-lg"
                              style={{ background: "var(--accent-violet-dim)", color: "var(--accent-violet)", border: "1px solid rgba(139,92,246,0.2)" }}>
                              {bulletLoading === i ? "..." : "✨ Enhance"}
                            </button>
                          )}
                        </div>
                        {cv.experience.length > 1 && <button onClick={() => removeExperience(i)} className="text-xs" style={{ color: "var(--accent-rose)" }}>Remove</button>}
                      </div>
                    </div>
                  ))}
                  <button onClick={addExperience} className="mt-2 text-sm font-medium" style={{ color: "var(--accent-violet)" }}>+ Add Experience</button>
                </div>

                {/* Skills */}
                <div className="glass-card p-5">
                  <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--accent-gold)" }}>Skills</h2>
                  <textarea placeholder="Enter skills separated by commas" value={cv.skills} onChange={(e) => updateField("skills", e.target.value)} rows={3} className="input-dark w-full resize-none" />
                </div>

                {/* Languages */}
                <div className="glass-card p-5">
                  <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--accent-gold)" }}>🌍 Languages</h2>
                  {cv.languages.map((lang, i) => (
                    <div key={i} className="flex items-center gap-2 mb-2">
                      <input type="text" placeholder="Language" value={lang.name} onChange={(e) => updateLanguage(i, "name", e.target.value)} className="input-dark flex-1 text-sm" />
                      <select value={lang.level} onChange={(e) => updateLanguage(i, "level", e.target.value)} className="input-dark text-sm" style={{ width: 140 }}>
                        <option value="">Level</option>
                        <option>Native</option><option>Fluent</option><option>Advanced</option><option>Intermediate</option><option>Basic</option>
                      </select>
                      {cv.languages.length > 1 && <button onClick={() => removeLanguage(i)} className="text-xs" style={{ color: "var(--accent-rose)" }}>✕</button>}
                    </div>
                  ))}
                  <button onClick={addLanguage} className="text-sm font-medium" style={{ color: "var(--accent-violet)" }}>+ Add Language</button>
                </div>

                {/* Certifications */}
                <div className="glass-card p-5">
                  <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--accent-gold)" }}>🏆 Certifications & Awards</h2>
                  {cv.certifications.map((cert, i) => (
                    <div key={i} className="mb-3 last:mb-0">
                      {i > 0 && <div className="mb-2" style={{ borderTop: "1px solid var(--glass-border)" }} />}
                      <div className="grid grid-cols-3 gap-2">
                        <input type="text" placeholder="Certificate title" value={cert.title} onChange={(e) => updateCertification(i, "title", e.target.value)} className="input-dark col-span-2 text-sm" />
                        <input type="text" placeholder="Year" value={cert.year} onChange={(e) => updateCertification(i, "year", e.target.value)} className="input-dark text-sm" />
                      </div>
                      <input type="text" placeholder="Issuing organization" value={cert.issuer} onChange={(e) => updateCertification(i, "issuer", e.target.value)} className="input-dark w-full text-sm mt-2" />
                      {cv.certifications.length > 1 && <button onClick={() => removeCertification(i)} className="text-xs mt-1" style={{ color: "var(--accent-rose)" }}>Remove</button>}
                    </div>
                  ))}
                  <button onClick={addCertification} className="text-sm font-medium" style={{ color: "var(--accent-violet)" }}>+ Add Certification</button>
                </div>

                {/* References */}
                <div className="glass-card p-5">
                  <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--accent-gold)" }}>📋 References</h2>
                  <textarea placeholder="Available upon request (or list references here)" value={cv.referencesNote} onChange={(e) => updateField("referencesNote", e.target.value)} rows={2} className="input-dark w-full resize-none text-sm" />
                </div>
              </div>

              {/* Preview Side */}
              <div className="lg:sticky lg:top-8 lg:self-start">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Live Preview</h2>
                  <button onClick={handleDownloadPDF} disabled={!cv.fullName} className="btn-gold text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    Download PDF
                  </button>
                </div>

                <div ref={previewRef} className="p-8 rounded-2xl min-h-[600px]" style={{ background: s.bg, color: s.color, fontFamily: s.font, boxShadow: "0 8px 40px rgba(0,0,0,0.3)" }}>
                  {/* Header */}
                  {template === "creative" && <div style={{ height: 6, background: `linear-gradient(90deg, ${s.accent}, ${s.accent}88)`, borderRadius: 3, marginBottom: 16 }} />}
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 4 }}>
                    {photoPreview && <img src={photoPreview} alt="" style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: `2px solid ${s.accent}` }} />}
                    <div>
                      <h1 style={{ fontSize: nameFontSize, fontWeight: "bold", color: s.color }}>{cv.fullName || "Your Name"}</h1>
                      <p style={{ fontSize: bodyFontSize - 1, color: "#666" }}>{[cv.email, cv.phone, cv.location].filter(Boolean).join(" · ") || "email · phone · location"}</p>
                      {(cv.linkedIn || cv.portfolio) && <p style={{ fontSize: bodyFontSize - 2, color: s.accent }}>{[cv.linkedIn, cv.portfolio].filter(Boolean).join(" · ")}</p>}
                    </div>
                  </div>

                  {cv.summary && (<><h2 style={{ fontSize: titleFontSize, fontWeight: 600, textTransform: "uppercase", letterSpacing: "2px", color: s.accent, borderBottom: s.headingBorder, paddingBottom: 4, marginTop: 16, marginBottom: 6 }}>Professional Summary</h2><p style={{ fontSize: bodyFontSize, color: "#444", lineHeight: 1.6 }}>{cv.summary}</p></>)}

                  {/* Experience / Education — order depends on toggle */}
                  {educationFirst ? (<>
                    {eduSection && (<><h2 style={{ fontSize: titleFontSize, fontWeight: 600, textTransform: "uppercase", letterSpacing: "2px", color: s.accent, borderBottom: s.headingBorder, paddingBottom: 4, marginTop: 16, marginBottom: 6 }}>Education</h2>{cv.education.filter(e => e.school || e.degree).map((edu, i) => (<div key={i} style={{ marginBottom: 8 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><h3 style={{ fontSize: bodyFontSize + 2, fontWeight: "bold", color: s.color }}>{edu.degree || "Degree"}</h3><span style={{ fontSize: bodyFontSize - 1, color: "#888" }}>{edu.year}</span></div><p style={{ fontSize: bodyFontSize - 1, color: s.accent, fontWeight: 600 }}>{edu.school}</p>{edu.notes && <p style={{ fontSize: bodyFontSize - 1, color: "#666", fontStyle: "italic", marginTop: 2 }}>{edu.notes}</p>}</div>))}</>)}
                    {expSection && (<><h2 style={{ fontSize: titleFontSize, fontWeight: 600, textTransform: "uppercase", letterSpacing: "2px", color: s.accent, borderBottom: s.headingBorder, paddingBottom: 4, marginTop: 16, marginBottom: 6 }}>Experience</h2>{cv.experience.filter(e => e.company || e.role).map((exp, i) => (<div key={i} style={{ marginBottom: 10 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><h3 style={{ fontSize: bodyFontSize + 2, fontWeight: "bold", color: s.color }}>{exp.role || "Role"}</h3><span style={{ fontSize: bodyFontSize - 1, color: "#888" }}>{exp.duration}</span></div><p style={{ fontSize: bodyFontSize - 1, color: s.accent, fontWeight: 600 }}>{exp.company}</p>{exp.description && <p style={{ fontSize: bodyFontSize, color: "#444", marginTop: 3, lineHeight: 1.6 }}>{exp.description}</p>}</div>))}</>)}
                  </>) : (<>
                    {expSection && (<><h2 style={{ fontSize: titleFontSize, fontWeight: 600, textTransform: "uppercase", letterSpacing: "2px", color: s.accent, borderBottom: s.headingBorder, paddingBottom: 4, marginTop: 16, marginBottom: 6 }}>Experience</h2>{cv.experience.filter(e => e.company || e.role).map((exp, i) => (<div key={i} style={{ marginBottom: 10 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><h3 style={{ fontSize: bodyFontSize + 2, fontWeight: "bold", color: s.color }}>{exp.role || "Role"}</h3><span style={{ fontSize: bodyFontSize - 1, color: "#888" }}>{exp.duration}</span></div><p style={{ fontSize: bodyFontSize - 1, color: s.accent, fontWeight: 600 }}>{exp.company}</p>{exp.description && <p style={{ fontSize: bodyFontSize, color: "#444", marginTop: 3, lineHeight: 1.6 }}>{exp.description}</p>}</div>))}</>)}
                    {eduSection && (<><h2 style={{ fontSize: titleFontSize, fontWeight: 600, textTransform: "uppercase", letterSpacing: "2px", color: s.accent, borderBottom: s.headingBorder, paddingBottom: 4, marginTop: 16, marginBottom: 6 }}>Education</h2>{cv.education.filter(e => e.school || e.degree).map((edu, i) => (<div key={i} style={{ marginBottom: 8 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><h3 style={{ fontSize: bodyFontSize + 2, fontWeight: "bold", color: s.color }}>{edu.degree || "Degree"}</h3><span style={{ fontSize: bodyFontSize - 1, color: "#888" }}>{edu.year}</span></div><p style={{ fontSize: bodyFontSize - 1, color: s.accent, fontWeight: 600 }}>{edu.school}</p>{edu.notes && <p style={{ fontSize: bodyFontSize - 1, color: "#666", fontStyle: "italic", marginTop: 2 }}>{edu.notes}</p>}</div>))}</>)}
                  </>)}

                  {skillsList.length > 0 && (<><h2 style={{ fontSize: titleFontSize, fontWeight: 600, textTransform: "uppercase", letterSpacing: "2px", color: s.accent, borderBottom: s.headingBorder, paddingBottom: 4, marginTop: 16, marginBottom: 6 }}>Skills</h2><div>{skillsList.map((skill, i) => (<span key={i} style={{ display: "inline-block", background: s.accentLight, color: s.accentText, padding: "2px 10px", borderRadius: 12, fontSize: bodyFontSize - 1, margin: "2px 4px 2px 0" }}>{skill}</span>))}</div></>)}

                  {langSection && (<><h2 style={{ fontSize: titleFontSize, fontWeight: 600, textTransform: "uppercase", letterSpacing: "2px", color: s.accent, borderBottom: s.headingBorder, paddingBottom: 4, marginTop: 16, marginBottom: 6 }}>Languages</h2><div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>{cv.languages.filter(l => l.name).map((l, i, arr) => (<span key={i} style={{ fontSize: bodyFontSize, color: "#444" }}>{l.name}{l.level ? ` — ${l.level}` : ""}{i < arr.length - 1 ? " ·" : ""}</span>))}</div></>)}

                  {certSection && (<><h2 style={{ fontSize: titleFontSize, fontWeight: 600, textTransform: "uppercase", letterSpacing: "2px", color: s.accent, borderBottom: s.headingBorder, paddingBottom: 4, marginTop: 16, marginBottom: 6 }}>Certifications</h2><div>{cv.certifications.filter(c => c.title).map((c, i) => (<div key={i} style={{ marginBottom: 6 }}><p style={{ fontSize: bodyFontSize, fontWeight: 600, color: s.color }}>{c.title}</p>{(c.issuer || c.year) && <p style={{ fontSize: bodyFontSize - 1, color: "#666" }}>{[c.issuer, c.year].filter(Boolean).join(" · ")}</p>}</div>))}</div></>)}

                  {cv.referencesNote.trim() && (<><h2 style={{ fontSize: titleFontSize, fontWeight: 600, textTransform: "uppercase", letterSpacing: "2px", color: s.accent, borderBottom: s.headingBorder, paddingBottom: 4, marginTop: 16, marginBottom: 6 }}>References</h2><p style={{ fontSize: bodyFontSize, color: "#444", fontStyle: "italic" }}>{cv.referencesNote}</p></>)}

                  {!cv.fullName && !cv.summary && !cv.experience.some(e => e.company) && (
                    <div style={{ textAlign: "center", padding: "60px 20px", color: "#aaa" }}>
                      <p style={{ fontSize: 36, marginBottom: 12 }}>📄</p>
                      <p style={{ fontSize: bodyFontSize }}>Fill in the form to see your CV preview here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </main>
  );
}

export default function CVBuilderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}><p style={{ color: "var(--text-muted)" }}>Loading CV Builder...</p></div>}>
      <CVBuilderContent />
    </Suspense>
  );
}
