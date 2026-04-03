"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface NavItem {
  href: string;
  label: string;
  emoji?: string;
}

interface Props {
  items?: NavItem[];
  extra?: React.ReactNode;
}

const DEFAULT_ITEMS: NavItem[] = [
  { href: "/", label: "Pathfinder", emoji: "🧭" },
  { href: "/dashboard", label: "My Dashboard", emoji: "👤" },
  { href: "/topics", label: "AI Topics", emoji: "🤖" },
  { href: "/internships", label: "Internships", emoji: "💼" },
  { href: "/resources", label: "Resources", emoji: "📚" },
  { href: "/cv-builder", label: "CV Builder", emoji: "📄" },
  { href: "/employer/login", label: "Employer Portal", emoji: "🏢" },
];

export default function MobileNav({ items, extra }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navItems = items || DEFAULT_ITEMS;

  // Ensure portal only renders on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on escape & lock body scroll
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const overlay = (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mobile-nav-backdrop"
            onClick={() => setOpen(false)}
          />

          {/* Sidebar */}
          <motion.nav
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="mobile-nav-sidebar"
          >
            {/* Close button */}
            <div className="flex justify-between items-center mb-8">
              <span className="text-lg font-bold gradient-text">Menu</span>
              <button
                onClick={() => setOpen(false)}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                style={{ background: "rgba(255,255,255,0.06)" }}
                aria-label="Close menu"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Nav items */}
            <div className="flex flex-col gap-1">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.04 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-medium transition-all"
                    style={{ color: "var(--text-secondary)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                      e.currentTarget.style.color = "var(--text-primary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }}
                  >
                    {item.emoji && <span className="text-lg">{item.emoji}</span>}
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Extra content */}
            {extra && (
              <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--glass-border)" }}>
                {extra}
              </div>
            )}

            {/* Branding */}
            <div className="mt-auto pt-8">
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Pathfinder by Pathfinder Organization
              </p>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Hamburger button — only visible on mobile */}
      <button
        onClick={() => setOpen(true)}
        className="mobile-nav-toggle"
        aria-label="Open navigation menu"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      {/* Desktop nav links — hidden on mobile */}
      <div className="desktop-nav">
        {navItems.slice(1).map((item) => (
          <Link key={item.href} href={item.href} className="nav-link">
            {item.label}
          </Link>
        ))}
        {extra}
      </div>

      {/* Render sidebar via portal so it escapes all parent stacking contexts */}
      {mounted && createPortal(overlay, document.body)}
    </>
  );
}
