"use client";
import { useState } from "react";

const TYPES = [
  { value: "bug", label: "🐛 Bug", color: "text-red-400" },
  { value: "feature", label: "✨ Feature", color: "text-yellow-400" },
  { value: "general", label: "💬 General", color: "text-blue-400" },
  { value: "praise", label: "❤️ Praise", color: "text-pink-400" },
];

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("general");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          message: message.trim(),
          rating: rating || undefined,
          page: window.location.pathname,
        }),
      });
      setSubmitted(true);
      setTimeout(() => { setOpen(false); setSubmitted(false); setMessage(""); setRating(0); }, 2000);
    } catch {
      // silently fail for MVP
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 w-80 rounded-xl border border-gray-700 bg-gray-900 shadow-2xl overflow-hidden">
          {submitted ? (
            <div className="p-8 text-center">
              <p className="text-3xl mb-2">🙏</p>
              <p className="font-semibold">Thanks for your feedback!</p>
              <p className="text-sm text-gray-400 mt-1">We read every submission.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Send Feedback</h3>
                  <button type="button" onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-300 text-lg">×</button>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex gap-2">
                  {TYPES.map((t) => (
                    <button key={t.value} type="button" onClick={() => setType(t.value)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                        type === t.value ? "border-emerald-500 bg-emerald-500/10" : "border-gray-700 hover:border-gray-600"
                      }`}>
                      {t.label}
                    </button>
                  ))}
                </div>
                <textarea
                  value={message} onChange={(e) => setMessage(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={3} maxLength={1000} required
                  className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none resize-none"
                />
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500 mr-1">Rating:</span>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setRating(n)}
                      className={`text-lg transition-colors ${n <= rating ? "text-yellow-400" : "text-gray-600 hover:text-gray-400"}`}>
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="px-4 pb-4">
                <button type="submit" disabled={submitting || !message.trim()}
                  className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition-colors disabled:opacity-50">
                  {submitting ? "Sending..." : "Send Feedback"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
      <button onClick={() => setOpen(!open)}
        className="h-12 w-12 rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-500 transition-all hover:scale-105 flex items-center justify-center text-xl">
        {open ? "×" : "💬"}
      </button>
    </div>
  );
}
