"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FEEDBACK_DONE_KEY = "pathfinder_feedback_done";
const POPUP_DELAY_MS = 15000; // 15 seconds

export default function FeedbackPopup() {
  const [visible, setVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const getStudentId = useCallback((): string | null => {
    if (typeof window === "undefined") return null;
    try {
      const user = JSON.parse(localStorage.getItem("pathfinder_user") || "{}");
      return user?.id || null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    // Don't show if already submitted feedback
    if (typeof window !== "undefined" && localStorage.getItem(FEEDBACK_DONE_KEY)) {
      return;
    }

    const studentId = getStudentId();
    if (!studentId) return;

    // Check server if feedback already exists
    fetch(`/api/feedback?student_id=${studentId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.has_feedback) {
          localStorage.setItem(FEEDBACK_DONE_KEY, "true");
          return;
        }
        // Show popup after delay
        const timer = setTimeout(() => setVisible(true), POPUP_DELAY_MS);
        return () => clearTimeout(timer);
      })
      .catch(() => {
        // If check fails, still show popup after delay
        const timer = setTimeout(() => setVisible(true), POPUP_DELAY_MS);
        return () => clearTimeout(timer);
      });
  }, [getStudentId]);

  async function handleSubmit() {
    if (rating === 0) return;
    setSubmitting(true);

    const studentId = getStudentId();
    if (!studentId) {
      setSubmitting(false);
      return;
    }

    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId, rating, note }),
      });
      localStorage.setItem(FEEDBACK_DONE_KEY, "true");
      setSubmitted(true);
      setTimeout(() => {
        setVisible(false);
      }, 2000);
    } catch {
      // Silently fail
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setDismissed(true);
    setVisible(false);
  }

  if (dismissed && !submitted) {
    // They dismissed without submitting — don't persist, will show again next session
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.9 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed bottom-6 right-6 z-[9999] w-[340px] max-w-[calc(100vw-2rem)]"
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "rgba(15, 15, 30, 0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(139, 92, 246, 0.25)",
              boxShadow:
                "0 25px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(139, 92, 246, 0.1)",
            }}
          >
            {/* Header */}
            <div
              className="px-5 py-4 flex items-center justify-between"
              style={{
                background:
                  "linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(245, 183, 49, 0.1))",
                borderBottom: "1px solid rgba(139, 92, 246, 0.15)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <motion.span
                  className="text-2xl"
                  animate={{ rotate: [0, -10, 10, -5, 0] }}
                  transition={{ duration: 1.5, delay: 0.3 }}
                >
                  💫
                </motion.span>
                <div>
                  <h3
                    className="text-sm font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    How&apos;s Pathfinder?
                  </h3>
                  <p
                    className="text-[11px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Your feedback shapes our future
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{
                  background: "rgba(255, 255, 255, 0.06)",
                  color: "var(--text-muted)",
                }}
                aria-label="Close feedback"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-5">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="thanks"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-4"
                  >
                    <motion.span
                      className="text-4xl block mb-3"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 8 }}
                    >
                      🎉
                    </motion.span>
                    <p
                      className="font-semibold text-sm"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Thank you for your feedback!
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Your input helps us improve Pathfinder for Africa.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div key="form">
                    {/* Stars */}
                    <div className="flex justify-center gap-2 mb-5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button
                          key={star}
                          onMouseEnter={() => setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(0)}
                          onClick={() => setRating(star)}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          className="text-3xl transition-all cursor-pointer p-0.5"
                          style={{
                            filter:
                              star <= (hoveredStar || rating)
                                ? "none"
                                : "grayscale(1) opacity(0.3)",
                            transform:
                              star <= (hoveredStar || rating)
                                ? "scale(1.05)"
                                : "scale(0.95)",
                          }}
                        >
                          ⭐
                        </motion.button>
                      ))}
                    </div>

                    {/* Rating label */}
                    <AnimatePresence mode="wait">
                      {(hoveredStar > 0 || rating > 0) && (
                        <motion.p
                          key={hoveredStar || rating}
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-center text-xs font-medium mb-4"
                          style={{
                            color:
                              (hoveredStar || rating) >= 4
                                ? "var(--accent-emerald)"
                                : (hoveredStar || rating) >= 3
                                  ? "var(--accent-gold)"
                                  : "var(--accent-rose)",
                          }}
                        >
                          {
                            [
                              "",
                              "Needs improvement",
                              "It's okay",
                              "Good!",
                              "Great!",
                              "Amazing! 🚀",
                            ][hoveredStar || rating]
                          }
                        </motion.p>
                      )}
                    </AnimatePresence>

                    {/* Note */}
                    <div className="mb-4">
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Any suggestions or thoughts? (optional)"
                        rows={2}
                        className="w-full text-sm rounded-xl px-3.5 py-2.5 resize-none"
                        style={{
                          background: "rgba(255, 255, 255, 0.04)",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          color: "var(--text-primary)",
                          outline: "none",
                        }}
                        onFocus={(e) =>
                          (e.target.style.borderColor =
                            "rgba(139, 92, 246, 0.4)")
                        }
                        onBlur={(e) =>
                          (e.target.style.borderColor =
                            "rgba(255, 255, 255, 0.08)")
                        }
                      />
                    </div>

                    {/* Submit */}
                    <button
                      onClick={handleSubmit}
                      disabled={rating === 0 || submitting}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                      style={{
                        background:
                          rating > 0
                            ? "linear-gradient(135deg, var(--accent-violet), #a855f7)"
                            : "rgba(255, 255, 255, 0.06)",
                        color: rating > 0 ? "white" : "var(--text-muted)",
                        cursor: rating === 0 ? "not-allowed" : "pointer",
                        opacity: rating === 0 ? 0.5 : 1,
                        boxShadow:
                          rating > 0
                            ? "0 4px 15px rgba(139, 92, 246, 0.3)"
                            : "none",
                      }}
                    >
                      {submitting ? (
                        <>
                          <svg
                            className="w-4 h-4 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                          Sending...
                        </>
                      ) : (
                        "Submit Feedback →"
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
