"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/Footer";

/* ─── Resource Data ─── */
interface Resource {
    id: string;
    name: string;
    url: string;
    description: string;
    emoji: string;
    gradient: string;
    tags: string[];
    isAdmin?: boolean;
}

const DEFAULT_RESOURCES: Resource[] = [
    {
        id: "savannah-skills",
        name: "Savannah Skills",
        url: "https://savannah-vert.vercel.app",
        description: "Learn essential real-world skills through short video lessons — from writing professional emails and building your CV to acing interviews and mastering workplace tools.",
        emoji: "🎬",
        gradient: "linear-gradient(135deg, #f59e0b, #ef4444)",
        tags: ["Video Lessons", "CV Writing", "Email Skills", "Partner"],
    },
    {
        id: "forage",
        name: "The Forage",
        url: "https://www.theforage.com/simulations",
        description: "Complete free virtual job simulations from top companies. Build real-world skills and experience before you even graduate.",
        emoji: "🚀",
        gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
        tags: ["Job Simulations", "Virtual Experience", "Free"],
    },
    {
        id: "coursera",
        name: "Coursera",
        url: "https://www.coursera.org",
        description: "Access thousands of courses from world-class universities like Stanford, Yale, and Google. Earn certificates to boost your CV.",
        emoji: "🎓",
        gradient: "linear-gradient(135deg, #0ea5e9, #38bdf8)",
        tags: ["Online Courses", "Certificates", "Universities"],
    },
    {
        id: "grow-google",
        name: "Grow with Google",
        url: "https://grow.google",
        description: "Free career certificates, digital skills training, and tools from Google to help you find a job, grow your career, or start a business.",
        emoji: "🌱",
        gradient: "linear-gradient(135deg, #22c55e, #4ade80)",
        tags: ["Google Certificates", "Career Tools", "Free Training"],
    },
    {
        id: "alx-africa",
        name: "ALX Africa",
        url: "https://www.alxafrica.com",
        description: "Free 12-month tech training programmes for young Africans. Learn software engineering, data analytics, or entrepreneurship with ALX.",
        emoji: "🌍",
        gradient: "linear-gradient(135deg, #f59e0b, #f5b731)",
        tags: ["Africa-focused", "Software Engineering", "Free"],
    },
    {
        id: "linkedin-learning",
        name: "LinkedIn Learning",
        url: "https://www.linkedin.com/learning",
        description: "Thousands of courses in business, tech, and creative fields. Many Ghanaian universities offer free access — check with your school.",
        emoji: "💼",
        gradient: "linear-gradient(135deg, #0077B5, #4DA8DA)",
        tags: ["Professional Skills", "Business", "Tech"],
    },
    {
        id: "edx",
        name: "edX",
        url: "https://www.edx.org",
        description: "Free courses from Harvard, MIT, and top global universities. Audit courses for free or earn verified certificates.",
        emoji: "📖",
        gradient: "linear-gradient(135deg, #c2185b, #e91e63)",
        tags: ["University Courses", "Free Audit", "Certificates"],
    },
    {
        id: "jobberman-ghana",
        name: "Jobberman Ghana",
        url: "https://www.jobberman.com.gh",
        description: "Ghana's leading job portal with internships, entry-level positions, and career resources designed for the local market.",
        emoji: "🇬🇭",
        gradient: "linear-gradient(135deg, #006b3f, #fcd116)",
        tags: ["Jobs in Ghana", "Internships", "Local"],
    },
    {
        id: "yali-network",
        name: "YALI Network",
        url: "https://yali.state.gov",
        description: "Young African Leaders Initiative — free online courses, leadership training, and fellowship opportunities for young Africans.",
        emoji: "🤝",
        gradient: "linear-gradient(135deg, #1e3a5f, #3b82f6)",
        tags: ["Leadership", "Africa", "Fellowships"],
    },
    {
        id: "github-student",
        name: "GitHub Student Developer Pack",
        url: "https://education.github.com/pack",
        description: "Free access to developer tools, cloud credits, and learning platforms for students — including GitHub Pro, AWS, and more.",
        emoji: "🐙",
        gradient: "linear-gradient(135deg, #24292e, #6e5494)",
        tags: ["Developer Tools", "Free", "Students Only"],
    },
];

/* ─── Bacheca Data ─── */
interface BachecaEntry {
    id: string;
    title: string;
    description: string;
    link: string;
    type: "scholarship" | "program" | "exchange";
    deadline?: string;
    location?: string;
    isAdmin?: boolean;
}

const DEFAULT_BACHECA: BachecaEntry[] = [
    {
        id: "erasmus-plus",
        title: "Erasmus+ Exchange Program",
        description: "EU-funded student exchange program offering study periods of 3-12 months at partner universities across Europe, with grants covering travel and living costs.",
        link: "https://erasmus-plus.ec.europa.eu",
        type: "exchange",
        deadline: "Varies by university",
        location: "Europe",
    },
    {
        id: "chevening",
        title: "Chevening Scholarships",
        description: "Fully funded UK government scholarships for outstanding emerging leaders. Covers tuition, living expenses, and flights for a one-year master's degree in the UK.",
        link: "https://www.chevening.org",
        type: "scholarship",
        deadline: "November 2026",
        location: "United Kingdom",
    },
    {
        id: "fulbright",
        title: "Fulbright Student Program",
        description: "Prestigious scholarships for graduate study, research, or English teaching assistantships abroad. Full funding including tuition, airfare, and living stipend.",
        link: "https://us.fulbrightonline.org",
        type: "scholarship",
        deadline: "October 2026",
        location: "Worldwide",
    },
    {
        id: "daad",
        title: "DAAD Scholarships — Study in Germany",
        description: "German Academic Exchange Service offering scholarships for international students to study at world-renowned German universities. Many programs are tuition-free.",
        link: "https://www.daad.de/en/",
        type: "program",
        deadline: "Varies by program",
        location: "Germany",
    },
    {
        id: "mastercard-foundation",
        title: "Mastercard Foundation Scholars Program",
        description: "Covers tuition, accommodation, and living expenses at top universities in Africa and globally. Specifically designed for talented African students.",
        link: "https://mastercardfdn.org/all/scholars/",
        type: "scholarship",
        deadline: "Varies by university",
        location: "Africa & Global",
    },
    {
        id: "africa-oxford",
        title: "Africa Oxford Initiative",
        description: "Research visits, travel grants, and graduate scholarships connecting African researchers with the University of Oxford.",
        link: "https://www.afox.ox.ac.uk",
        type: "program",
        deadline: "Rolling applications",
        location: "United Kingdom",
    },
    {
        id: "aga-khan",
        title: "Aga Khan Foundation Scholarship",
        description: "Need-based scholarships for graduate studies. Available to nationals of selected developing countries including Ghana. Covers 50% of tuition as a grant.",
        link: "https://www.akdn.org/our-agencies/aga-khan-foundation",
        type: "scholarship",
        deadline: "March 2027",
        location: "Worldwide",
    },
    {
        id: "mandela-washington",
        title: "Mandela Washington Fellowship",
        description: "Flagship program of the Young African Leaders Initiative (YALI). Six weeks of leadership training at US universities plus networking and mentorship.",
        link: "https://yali.state.gov/mwf",
        type: "program",
        deadline: "September 2026",
        location: "United States",
    },
];

const typeConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
    scholarship: {
        label: "💰 Scholarship",
        color: "var(--accent-gold)",
        bg: "var(--accent-gold-dim)",
        border: "rgba(245, 183, 49, 0.25)",
    },
    program: {
        label: "📚 Program",
        color: "var(--accent-violet)",
        bg: "var(--accent-violet-dim)",
        border: "rgba(139, 92, 246, 0.25)",
    },
    exchange: {
        label: "🌍 Exchange",
        color: "var(--accent-emerald)",
        bg: "var(--accent-emerald-dim)",
        border: "rgba(52, 211, 153, 0.25)",
    },
};

/* ─── Animated Background Orbs ─── */
function FloatingOrb({ delay, size, x, y, color }: { delay: number; size: number; x: string; y: string; color: string }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{
                opacity: [0.15, 0.3, 0.15],
                scale: [1, 1.15, 1],
                y: [0, -20, 0],
            }}
            transition={{ duration: 6, delay, repeat: Infinity, ease: "easeInOut" }}
            style={{
                position: "absolute",
                width: size,
                height: size,
                borderRadius: "50%",
                background: color,
                filter: "blur(60px)",
                left: x,
                top: y,
                pointerEvents: "none",
            }}
        />
    );
}

/* ─── Component ─── */
export default function ResourcesPage() {
    const [activeFilter, setActiveFilter] = useState<"all" | "scholarship" | "program" | "exchange">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [resources, setResources] = useState<Resource[]>(DEFAULT_RESOURCES);
    const [bachecaEntries, setBachecaEntries] = useState<BachecaEntry[]>(DEFAULT_BACHECA);

    // Fetch admin-added content
    useEffect(() => {
        fetch("/api/admin/content")
            .then((r) => r.json())
            .then((data) => {
                if (data.resources?.length) {
                    const adminResources: Resource[] = data.resources.map((r: any) => ({
                        ...r,
                        gradient: "linear-gradient(135deg, var(--accent-violet), #a855f7)",
                        isAdmin: true,
                    }));
                    setResources([...DEFAULT_RESOURCES, ...adminResources]);
                }
                if (data.bacheca?.length) {
                    const adminBacheca: BachecaEntry[] = data.bacheca.map((b: any) => ({
                        ...b,
                        isAdmin: true,
                    }));
                    setBachecaEntries([...DEFAULT_BACHECA, ...adminBacheca]);
                }
            })
            .catch(() => {});
    }, []);

    // Filter logic
    const filteredBacheca = bachecaEntries
        .filter((e) => activeFilter === "all" || e.type === activeFilter)
        .filter((e) => {
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase();
            return e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || (e.location?.toLowerCase().includes(q));
        });

    const filteredResources = resources.filter((r) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.tags.some((t) => t.toLowerCase().includes(q));
    });

    return (
        <main className="min-h-screen relative z-10">
            {/* Decorative floating orbs */}
            <FloatingOrb delay={0} size={300} x="5%" y="10%" color="rgba(139, 92, 246, 0.08)" />
            <FloatingOrb delay={2} size={250} x="75%" y="30%" color="rgba(245, 183, 49, 0.06)" />
            <FloatingOrb delay={4} size={200} x="40%" y="70%" color="rgba(52, 211, 153, 0.06)" />

            {/* Header */}
            <header className="glass-strong" style={{ borderBottom: "1px solid var(--glass-border)" }}>
                <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold gradient-text">Student Resources</h1>
                    <MobileNav />
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                {/* Search bar */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 sm:mb-10"
                >
                    <div className="max-w-xl mx-auto relative">
                        <svg
                            className="w-5 h-5"
                            style={{
                                color: "var(--text-muted)",
                                position: "absolute",
                                left: 16,
                                top: "50%",
                                transform: "translateY(-50%)",
                                pointerEvents: "none",
                            }}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search resources, scholarships, programmes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-dark w-full"
                            style={{ paddingLeft: 48, height: 48 }}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="text-xs font-medium"
                                style={{
                                    color: "var(--text-muted)",
                                    position: "absolute",
                                    right: 16,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                }}
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </motion.div>

                {/* ─── Section 1: Useful Tools ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="text-center mb-8 sm:mb-10">
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.15, type: "spring" }}
                            className="text-4xl sm:text-5xl block mb-3 sm:mb-4"
                        >
                            🧰
                        </motion.span>
                        <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-2 sm:mb-3">Useful Tools & Platforms</h2>
                        <p className="max-w-xl mx-auto text-sm sm:text-base px-2" style={{ color: "var(--text-secondary)" }}>
                            Curated platforms to help you build skills, earn certificates, and get job-ready.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-16">
                        {/* Featured Partner: Savannah Skills */}
                        {filteredResources.filter(r => r.id === "savannah-skills").map((resource, i) => (
                            <motion.a
                                key={resource.id}
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                className="glass-card p-6 sm:p-8 block group cursor-pointer col-span-1 sm:col-span-2 md:col-span-3"
                                style={{ textDecoration: "none", borderImage: "linear-gradient(135deg, #f59e0b, #ef4444, #f59e0b) 1", borderWidth: 2, borderStyle: "solid" }}
                            >
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                    {/* Icon */}
                                    <div
                                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl shrink-0 transition-transform group-hover:scale-110"
                                        style={{ background: resource.gradient, boxShadow: "0 12px 32px rgba(0, 0, 0, 0.3)" }}
                                    >
                                        {resource.emoji}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                                            <h3 className="text-xl sm:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                                                {resource.name}
                                            </h3>
                                            <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)", color: "white" }}>
                                                🤝 Official Partner
                                            </span>
                                            <motion.span
                                                className="text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                style={{ color: "var(--text-muted)" }}
                                            >
                                                ↗
                                            </motion.span>
                                        </div>

                                        <p className="text-sm sm:text-base mb-4 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                                            {resource.description}
                                        </p>

                                        <div className="flex items-center gap-3 flex-wrap">
                                            {resource.tags.map((tag) => (
                                                <span key={tag} className="tag text-xs">{tag}</span>
                                            ))}
                                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all group-hover:scale-105"
                                                style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)", color: "white", boxShadow: "0 4px 15px rgba(245,158,11,0.3)" }}>
                                                Start Learning →
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom glow on hover */}
                                <div
                                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{ background: resource.gradient }}
                                />
                            </motion.a>
                        ))}

                        {/* Regular resources (excluding Savannah) */}
                        {filteredResources.filter(r => r.id !== "savannah-skills").map((resource, i) => (
                            <motion.a
                                key={resource.id}
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                className="glass-card p-4 sm:p-6 block group cursor-pointer"
                                style={{ textDecoration: "none" }}
                            >
                                {/* Icon */}
                                <div
                                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl mb-4 sm:mb-5 transition-transform group-hover:scale-110"
                                    style={{ background: resource.gradient, boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)" }}
                                >
                                    {resource.emoji}
                                </div>

                                {/* Name + badges */}
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                                        {resource.name}
                                    </h3>
                                    {resource.isAdmin && (
                                        <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "var(--accent-violet-dim)", color: "var(--accent-violet)", border: "1px solid rgba(139,92,246,0.2)" }}>
                                            ✦ New
                                        </span>
                                    )}
                                    <motion.span
                                        className="text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                        style={{ color: "var(--text-muted)" }}
                                    >
                                        ↗
                                    </motion.span>
                                </div>

                                {/* Description */}
                                <p className="text-sm mb-4 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                                    {resource.description}
                                </p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2">
                                    {resource.tags.map((tag) => (
                                        <span key={tag} className="tag text-xs">{tag}</span>
                                    ))}
                                </div>

                                {/* Bottom glow on hover */}
                                <div
                                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{ background: resource.gradient }}
                                />
                            </motion.a>
                        ))}
                    </div>

                    {filteredResources.length === 0 && searchQuery && (
                        <div className="text-center py-12 mb-12">
                            <p className="text-lg mb-2" style={{ color: "var(--text-muted)" }}>No resources match &quot;{searchQuery}&quot;</p>
                            <button onClick={() => setSearchQuery("")} className="text-sm font-medium" style={{ color: "var(--accent-violet)" }}>Clear search</button>
                        </div>
                    )}
                </motion.div>

                {/* ─── Divider ─── */}
                <div className="flex items-center gap-4 mb-8 sm:mb-10">
                    <div className="flex-1 h-px" style={{ background: "var(--glass-border)" }} />
                    <motion.span
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                        className="text-2xl sm:text-3xl"
                    >
                        📌
                    </motion.span>
                    <div className="flex-1 h-px" style={{ background: "var(--glass-border)" }} />
                </div>

                {/* ─── Section 2: Bacheca ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="text-center mb-6 sm:mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold gradient-text-violet mb-2 sm:mb-3 px-2">
                            Bacheca — Study Abroad & Scholarships
                        </h2>
                        <p className="max-w-xl mx-auto text-sm sm:text-base px-2" style={{ color: "var(--text-secondary)" }}>
                            Opportunities for students looking to study abroad, get funded, or join international programs.
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap justify-center gap-2 mb-6 sm:mb-8 px-1">
                        {(["all", "scholarship", "program", "exchange"] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                className="px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all"
                                style={{
                                    background: activeFilter === f
                                        ? "linear-gradient(135deg, var(--accent-violet), #a855f7)"
                                        : "var(--bg-card)",
                                    border: `1px solid ${activeFilter === f ? "rgba(139, 92, 246, 0.4)" : "var(--glass-border)"}`,
                                    color: activeFilter === f ? "white" : "var(--text-secondary)",
                                    boxShadow: activeFilter === f ? "0 4px 15px rgba(139, 92, 246, 0.3)" : "none",
                                }}
                            >
                                {f === "all" ? "All" : f === "scholarship" ? "💰 Scholarships" : f === "program" ? "📚 Programs" : "🌍 Exchanges"}
                            </button>
                        ))}
                    </div>

                    {/* Cards */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeFilter + searchQuery}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12"
                        >
                            {filteredBacheca.map((entry, i) => {
                                const tc = typeConfig[entry.type];
                                return (
                                    <motion.a
                                        key={entry.id}
                                        href={entry.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.06, duration: 0.4 }}
                                        className="glass-card p-4 sm:p-6 block group"
                                        style={{ textDecoration: "none", borderLeft: `3px solid ${tc.color}` }}
                                    >
                                        {/* Type badge + location */}
                                        <div className="flex items-start sm:items-center justify-between mb-3 flex-wrap gap-2">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="text-xs font-bold px-3 py-1 rounded-full"
                                                    style={{ background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}
                                                >
                                                    {tc.label}
                                                </span>
                                                {entry.isAdmin && (
                                                    <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "var(--accent-violet-dim)", color: "var(--accent-violet)", border: "1px solid rgba(139,92,246,0.2)" }}>
                                                        ✦ New
                                                    </span>
                                                )}
                                            </div>
                                            {entry.location && (
                                                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                                                    📍 {entry.location}
                                                </span>
                                            )}
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-lg font-bold mb-2 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                                            {entry.title}
                                            <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--text-muted)" }}>↗</span>
                                        </h3>

                                        {/* Desc */}
                                        <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
                                            {entry.description}
                                        </p>

                                        {/* Deadline */}
                                        {entry.deadline && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-semibold" style={{ color: "var(--accent-rose)" }}>
                                                    ⏰ Deadline:
                                                </span>
                                                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                                                    {entry.deadline}
                                                </span>
                                            </div>
                                        )}
                                    </motion.a>
                                );
                            })}
                        </motion.div>
                    </AnimatePresence>

                    {filteredBacheca.length === 0 && (
                        <div className="text-center py-12 mb-12">
                            <p className="text-lg mb-2" style={{ color: "var(--text-muted)" }}>
                                {searchQuery ? `No results for "${searchQuery}"` : "No entries in this category"}
                            </p>
                            {searchQuery && (
                                <button onClick={() => setSearchQuery("")} className="text-sm font-medium" style={{ color: "var(--accent-violet)" }}>Clear search</button>
                            )}
                        </div>
                    )}

                    {/* Coming soon note */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-center py-8"
                    >
                        <div
                            className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl"
                            style={{
                                background: "var(--bg-card)",
                                border: "1px solid var(--glass-border)",
                            }}
                        >
                            <motion.span
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="text-xl"
                            >
                                ✨
                            </motion.span>
                            <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                                More opportunities coming soon — check back regularly!
                            </span>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            <Footer />
        </main>
    );
}
