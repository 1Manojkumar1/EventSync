"use client";

import { useState } from "react";
import { Star, Send, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dataService } from "@/lib/store";
import { Event } from "@/lib/types";
import { useAuth } from "@/context/auth-context";

interface EventReviewFormProps {
  event: Event;
  onCancel: () => void;
  onSuccess: () => void;
}

export function EventReviewForm({ event, onCancel, onSuccess }: EventReviewFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [experience, setExperience] = useState("");
  const [improvements, setImprovements] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await dataService.submitEventReview({
        eventId: event.id,
        userId: user.id,
        userName: user.name,
        rating,
        experience,
        improvements,
        createdAt: new Date().toISOString(),
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              Rate Your Experience
            </h2>
            <p className="text-sm text-slate-500">{event.title}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Star Rating */}
          <div className="space-y-3">
            <Label className="text-base">Overall Rating</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-transform active:scale-95"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= rating
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-slate-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div className="space-y-2">
            <Label htmlFor="experience">What did you enjoy most?</Label>
            <textarea
              id="experience"
              required
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full min-h-[100px] p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all resize-none"
              placeholder="Tell us about your highlight..."
            />
          </div>

          {/* Improvements */}
          <div className="space-y-2">
            <Label htmlFor="improvements">Suggestions for improvement</Label>
            <textarea
              id="improvements"
              required
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              className="w-full min-h-[100px] p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all resize-none"
              placeholder="What could we do better next time?"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-red-600" />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 rounded-xl h-12"
            >
              Cancel
            </Button>
            <Button
              disabled={isSubmitting}
              type="submit"
              className="flex-1 bg-accent hover:bg-accent/90 text-white rounded-xl h-12 gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Feedback
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
