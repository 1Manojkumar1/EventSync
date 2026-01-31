"use client";

import { Star, MessageSquare, User, Calendar } from "lucide-react";
import { EventReview } from "@/lib/types";

interface ReviewListProps {
  reviews: EventReview[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
        <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">No reviews yet.</p>
        <p className="text-slate-400 text-sm">Feedback from participants will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div 
          key={review.id} 
          className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{review.userName}</h4>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="h-3 w-3" />
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= review.rating
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-slate-200"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Experience</p>
              <p className="text-sm text-slate-700 leading-relaxed italic">
                "{review.experience}"
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Suggestions</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                {review.improvements}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
