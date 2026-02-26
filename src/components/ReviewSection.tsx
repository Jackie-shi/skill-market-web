"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface ReviewUser {
  id: string;
  name: string | null;
  image: string | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: ReviewUser;
}

interface ReviewData {
  averageRating: number;
  reviewCount: number;
  reviews: Review[];
}

function Stars({ rating, interactive, onRate }: { rating: number; interactive?: boolean; onRate?: (r: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          className={`text-lg ${interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}`}
          onMouseEnter={() => interactive && setHover(i)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onRate?.(i)}
        >
          <span className={(hover || rating) >= i ? "text-yellow-400" : "text-gray-600"}>★</span>
        </button>
      ))}
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function ReviewSection({ skillSlug }: { skillSlug: string }) {
  const { data: session } = useSession();
  const [data, setData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/skills/${skillSlug}/reviews`);
      if (res.ok) {
        const d = await res.json();
        setData(d);
        // If user already reviewed, prefill
        if (session?.user) {
          const mine = d.reviews.find((r: Review) => r.user.id === (session.user as any).id);
          if (mine) {
            setMyRating(mine.rating);
            setMyComment(mine.comment ?? "");
          }
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [skillSlug, session]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myRating) { setError("Please select a rating"); return; }
    setError(""); setSuccess(""); setSubmitting(true);
    try {
      const res = await fetch(`/api/skills/${skillSlug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: myRating, comment: myComment }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Failed to submit review");
      } else {
        setSuccess("Review submitted!");
        fetchReviews();
      }
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-gray-500 py-4">Loading reviews...</div>;

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: data?.reviews.filter((r) => r.rating === star).length ?? 0,
  }));
  const maxCount = Math.max(...ratingDistribution.map((d) => d.count), 1);

  return (
    <div className="space-y-6 mt-8">
      <h2 className="text-xl font-bold">Reviews</h2>

      {/* Summary */}
      {data && data.reviewCount > 0 && (
        <div className="flex gap-8 items-start rounded-xl border border-gray-800 bg-gray-900/50 p-5">
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-400">{data.averageRating.toFixed(1)}</div>
            <Stars rating={Math.round(data.averageRating)} />
            <div className="text-xs text-gray-500 mt-1">{data.reviewCount} review{data.reviewCount !== 1 ? "s" : ""}</div>
          </div>
          <div className="flex-1 space-y-1">
            {ratingDistribution.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-3 text-gray-400">{star}</span>
                <span className="text-yellow-400 text-xs">★</span>
                <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${(count / maxCount) * 100}%` }} />
                </div>
                <span className="w-6 text-right text-gray-500 text-xs">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Write review form */}
      {session?.user ? (
        <form onSubmit={handleSubmit} className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 space-y-3">
          <h3 className="font-semibold text-sm">Write a review</h3>
          <Stars rating={myRating} interactive onRate={setMyRating} />
          <textarea
            value={myComment}
            onChange={(e) => setMyComment(e.target.value)}
            placeholder="Share your experience (optional)..."
            maxLength={2000}
            rows={3}
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none resize-none"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {success && <p className="text-emerald-400 text-sm">{success}</p>}
          <button
            type="submit"
            disabled={submitting || !myRating}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-gray-500">
          <a href="/auth/signin" className="text-emerald-400 hover:text-emerald-300">Sign in</a> to leave a review.
        </p>
      )}

      {/* Review list */}
      {data && data.reviews.length > 0 ? (
        <div className="space-y-4">
          {data.reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-gray-800 bg-gray-900/30 p-4 space-y-2">
              <div className="flex items-center gap-3">
                {review.user.image && (
                  <img src={review.user.image} alt="" className="w-8 h-8 rounded-full" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{review.user.name ?? "Anonymous"}</span>
                    <span className="text-xs text-gray-500">{timeAgo(review.createdAt)}</span>
                  </div>
                  <Stars rating={review.rating} />
                </div>
              </div>
              {review.comment && <p className="text-sm text-gray-300">{review.comment}</p>}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No reviews yet. Be the first!</p>
      )}
    </div>
  );
}
