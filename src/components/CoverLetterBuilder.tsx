"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { CAREER_PATHS, getCareerById } from "@/lib/careers";

interface Props {
  cvData: {
    fullName: string; email: string; phone: string; location: string;
    targetCareerId: string; summary: string; skills: string;
    education: { school: string; degree: string; year: string }[];
    experience: { company: string; role: string; duration: string; description: string }[];
  };
}

type Tone = "formal" | "friendly" | "confident";
type LetterLength = "short" | "medium" | "long";

const TONES: { id: Tone; label: string; emoji: string; desc: string }[] = [
  { id: "formal", label: "Formal", emoji: "🎩", desc: "Professional & traditional" },
  { id: "friendly", label: "Friendly", emoji: "😊", desc: "Warm & personable" },
  { id: "confident", label: "Confident", emoji: "💪", desc: "Bold & assertive" },
];

const LENGTHS: { id: LetterLength; label: string; desc: string }[] = [
  { id: "short", label: "Short", desc: "2-3 paragraphs" },
  { id: "medium", label: "Medium", desc: "3-4 paragraphs" },
  { id: "long", label: "Long", desc: "4-5 paragraphs" },
];

export default function CoverLetterBuilder({ cvData }: Props) {
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [tone, setTone] = useState<Tone>("formal");
  const [length, setLength] = useState<LetterLength>("medium");
  const [availableDate, setAvailableDate] = useState("");
  const [letter, setLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string>("");
  const [variationCount, setVariationCount] = useState(0);

  const career = cvData.targetCareerId ? getCareerById(cvData.targetCareerId) : null;

  async function generateLetter(variation?: number) {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/cv/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...cvData, companyName, jobTitle, tone, length, availableDate,
          variationSeed: variation ?? variationCount,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setLetter(data.letter || "");
      setSource(data.source || "template");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally { setLoading(false); }
  }

  function handleRegenerate() {
    const next = variationCount + 1;
    setVariationCount(next);
    generateLetter(next);
  }

  function handleDownload() {
    if (!letter) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Cover Letter - ${cvData.fullName}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;color:#1a1a2e;padding:60px;line-height:1.8;max-width:700px;margin:0 auto}
@media print{body{padding:30px}}
</style></head><body>
<div style="margin-bottom:32px">
<p style="font-weight:600;font-size:18px">${cvData.fullName || ""}</p>
<p style="font-size:13px;color:#666">${[cvData.email, cvData.phone, cvData.location].filter(Boolean).join(" · ")}</p>
</div>
<div style="white-space:pre-wrap;font-size:15px">${letter}</div>
</body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 300);
  }

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--accent-gold)" }}>Company Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Company Name *</label>
            <input className="input-dark w-full" placeholder="e.g. Google" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Job Title *</label>
            <input className="input-dark w-full" placeholder="e.g. Software Engineer Intern" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
          </div>
        </div>
        <div className="mt-3">
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>When are you available to start?</label>
          <input className="input-dark w-full" type="text" placeholder="e.g. Immediately, June 2026, or flexible" value={availableDate} onChange={(e) => setAvailableDate(e.target.value)} />
        </div>
        {career && (
          <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
            💡 Targeting: <strong style={{ color: "var(--accent-gold)" }}>{career.title}</strong> — your CV data will be used to personalize the letter.
          </p>
        )}
      </div>

      {/* Tone selector */}
      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--accent-gold)" }}>Tone</h2>
        <div className="grid grid-cols-3 gap-3">
          {TONES.map((t) => (
            <button key={t.id} onClick={() => setTone(t.id)}
              className="p-3 rounded-xl text-left transition-all"
              style={{
                background: tone === t.id ? "var(--accent-violet-dim)" : "var(--bg-card)",
                border: `2px solid ${tone === t.id ? "rgba(139,92,246,0.4)" : "var(--glass-border)"}`,
              }}>
              <span className="text-xl block mb-1">{t.emoji}</span>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.label}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Length selector */}
      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--accent-gold)" }}>Length</h2>
        <div className="grid grid-cols-3 gap-3">
          {LENGTHS.map((l) => (
            <button key={l.id} onClick={() => setLength(l.id)}
              className="p-3 rounded-xl text-left transition-all"
              style={{
                background: length === l.id ? "var(--accent-emerald-dim)" : "var(--bg-card)",
                border: `2px solid ${length === l.id ? "rgba(52,211,153,0.4)" : "var(--glass-border)"}`,
              }}>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{l.label}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{l.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={() => generateLetter()}
        disabled={loading || !companyName.trim() || !jobTitle.trim()}
        className="btn-primary w-full flex items-center justify-center gap-2 py-3"
      >
        {loading ? (
          <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Generating...</>
        ) : "✨ Generate Cover Letter"}
      </button>
      {error && <p className="text-xs" style={{ color: "var(--accent-rose)" }}>{error}</p>}

      {/* Preview */}
      {letter && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Preview</h2>
              {source && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--accent-violet-dim)", color: "var(--accent-violet)" }}>{source === "ai" ? "✨ AI Generated" : "📝 Template"}</span>}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleRegenerate} disabled={loading}
                className="text-sm flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all"
                style={{ background: "var(--bg-card)", border: "1px solid var(--glass-border)", color: "var(--text-secondary)" }}>
                🔄 Regenerate
              </button>
              <button onClick={handleDownload} className="btn-gold text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                Download PDF
              </button>
            </div>
          </div>
          <div className="p-8 rounded-2xl" style={{ background: "white", color: "#1a1a2e", fontFamily: "'Inter', sans-serif", boxShadow: "0 8px 40px rgba(0,0,0,0.3)" }}>
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontWeight: 600, fontSize: 18, color: "#1a1a2e" }}>{cvData.fullName || "Your Name"}</p>
              <p style={{ fontSize: 13, color: "#666" }}>{[cvData.email, cvData.phone, cvData.location].filter(Boolean).join(" · ")}</p>
            </div>
            <div style={{ whiteSpace: "pre-wrap", fontSize: 15, lineHeight: 1.8, color: "#333" }}>{letter}</div>
          </div>

          {/* Edit area */}
          <div className="mt-4 glass-card p-5">
            <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text-muted)" }}>✏️ Edit your letter</h3>
            <textarea className="input-dark w-full text-sm" rows={12} value={letter} onChange={(e) => setLetter(e.target.value)} style={{ resize: "vertical", lineHeight: 1.7 }}/>
          </div>
        </motion.div>
      )}
    </div>
  );
}
