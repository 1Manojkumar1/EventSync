"use client";

import { useEffect, useState } from "react";
import { Star, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dataService } from "@/lib/store";
import { Event, EventReview } from "@/lib/types";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";

export function PendingReviewsNotification() {
    const { user } = useAuth();
    const [pendingEvents, setPendingEvents] = useState<Event[]>([]);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const checkPendingReviews = async () => {
            if (!user || user.role !== 'participant') return;

            try {
                const [allEvents, userReviews] = await Promise.all([
                    dataService.getEvents(),
                    dataService.getReviewsByUser(user.id)
                ]);

                const reviewedEventIds = new Set(userReviews.map(r => r.eventId));

                const now = new Date();
                const pending = allEvents.filter(event => {
                    const isRegistered = event.attendeeIds?.includes(user.id);
                    const compareDate = event.endDate || event.date;
                    const isPast = new Date(compareDate) < now;
                    const needsReview = !reviewedEventIds.has(event.id);

                    return isRegistered && isPast && needsReview;
                });

                setPendingEvents(pending);
            } catch (error) {
                console.error("Error checking pending reviews:", error);
            }
        };

        checkPendingReviews();
    }, [user]);

    if (!isVisible || pendingEvents.length === 0) return null;

    const count = pendingEvents.length;

    return (
        <div className="bg-accent/10 border border-accent/20 rounded-2xl p-4 mb-8 animate-in slide-in-from-top duration-500">
            <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-white shrink-0 shadow-[0_0_15px_rgba(var(--accent),0.3)]">
                        <Star className="h-5 w-5 fill-white" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-bold text-slate-900">
                            Share your experience!
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            You have {count} event{count > 1 ? 's' : ''} waiting for your feedback. Your suggestions help us improve future campus events.
                        </p>
                        <div className="flex items-center gap-4 pt-2">
                            <Link href="/my-registrations">
                                <Button size="sm" className="bg-accent hover:bg-accent/90 text-white rounded-xl gap-2 h-9 px-4">
                                    Rate Now
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                            {count > 1 && (
                                <span className="text-xs font-medium text-slate-400">
                                    Multiple events pending
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsVisible(false)}
                    className="rounded-full h-8 w-8 text-slate-400 hover:text-slate-600"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
