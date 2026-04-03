"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import IntakeQuestionnaire from "@/components/IntakeQuestionnaire";
import InterestSpace from "@/components/InterestSpace";
import OnboardingFlow from "@/components/OnboardingFlow";
import UserLoginModal from "@/components/UserLoginModal";
import MobileNav from "@/components/MobileNav";
import RoleSelection from "@/components/RoleSelection";
import FeedbackPopup from "@/components/FeedbackPopup";

export default function Home() {
  const [phase, setPhase] = useState<"role-selection" | "onboarding" | "questionnaire" | "login" | "explorer">("role-selection");
  const [initialMatchedIds, setInitialMatchedIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("pathfinder_role");
      const onboardingDone = localStorage.getItem("pathfinder_onboarding_complete");

      if (role === "employer") {
        // Employer: redirect to employer portal
        router.push("/employer/dashboard");
        return;
      }

      if (role === "student") {
        // Student: skip role selection, go to questionnaire or onboarding
        if (onboardingDone === "true") {
          setPhase("questionnaire");
        } else {
          setPhase("onboarding");
        }
        return;
      }

      // No role saved — show role selection
      setPhase("role-selection");
    }
  }, [router]);

  function handleSelectStudent() {
    if (typeof window !== "undefined") {
      localStorage.setItem("pathfinder_role", "student");
    }
    setPhase("onboarding");
  }

  function handleSelectEmployer() {
    if (typeof window !== "undefined") {
      localStorage.setItem("pathfinder_role", "employer");
    }
    router.push("/employer/login");
  }

  function handleQuestionnaireSubmit(answers: Record<string, string>) {
    setSubmitting(true);
    fetch("/api/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionnaire: answers }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.matched_career_ids?.length) {
          setInitialMatchedIds(data.matched_career_ids);
        }
        // Track career explorer usage
        fetch("/api/activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "career_explorer", data: { answers, matched_careers: data.matched_career_ids || [] } }),
        }).catch(() => {});
        setPhase("login");
      })
      .catch(() => setPhase("login"))
      .finally(() => setSubmitting(false));
  }

  return (
    <AnimatePresence mode="wait">
      {phase === "role-selection" ? (
        <motion.div
          key="role-selection"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen relative"
        >
          <RoleSelection
            onSelectStudent={handleSelectStudent}
            onSelectEmployer={handleSelectEmployer}
          />
        </motion.div>
      ) : phase === "onboarding" ? (
        <motion.div
          key="onboarding"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen relative"
        >
          <OnboardingFlow onComplete={() => setPhase("questionnaire")} />
        </motion.div>
      ) : phase === "questionnaire" ? (
        <motion.div
          key="questionnaire"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen relative"
        >
          <header className="relative z-10 glass-strong" style={{ borderBottom: "1px solid var(--glass-border)" }}>
            <div className="max-w-2xl mx-auto px-6 py-4 flex justify-between items-center">
              <h1 className="text-lg font-bold gradient-text">Pathfinder</h1>
              <MobileNav
                extra={
                  <button
                    onClick={() => setPhase("login")}
                    className="nav-link"
                    style={{ color: "var(--accent-gold)" }}
                  >
                    Skip →
                  </button>
                }
              />
            </div>
          </header>
          <IntakeQuestionnaire onSubmit={handleQuestionnaireSubmit} submitting={submitting} />
        </motion.div>
      ) : phase === "login" ? (
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen relative"
        >
          <UserLoginModal onContinue={() => setPhase("explorer")} />
        </motion.div>
      ) : (
        <motion.div
          key="explorer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <InterestSpace
            initialMatchedIds={initialMatchedIds}
            onStartOver={() => {
              setPhase("questionnaire");
              setInitialMatchedIds([]);
            }}
          />
          <FeedbackPopup />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
