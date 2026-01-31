"use client";

import { useEffect, useState } from "react";
import { Event, EventReview } from "@/lib/types";
import { dataService } from "@/lib/store";
import { useAuth } from "@/context/auth-context";
import { EventList } from "@/components/events/event-list";
import { Button } from "@/components/ui/button";
import { Star, CheckCircle2, MessageSquare } from "lucide-react";
import { EventReviewForm } from "@/components/events/event-review-form";
import { EventGroupChat } from "@/components/events/event-group-chat";

export default function MyRegistrationsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [userReviews, setUserReviews] = useState<EventReview[]>([]);
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [reviewingEvent, setReviewingEvent] = useState<Event | null>(null);
  const [activeChatEvent, setActiveChatEvent] = useState<Event | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const [allEvents, allReviews] = await Promise.all([
        dataService.getEvents(),
        dataService.getReviewsByUser(user.id)
      ]);

      const myRegistrations = allEvents.filter(e => e.attendeeIds?.includes(user.id));
      setEvents(myRegistrations);
      setUserReviews(allReviews);
    };
    fetchData();
  }, [user, refreshKey]);

  const handleUnregister = async (eventId: string) => {
    if (!user) return;
    if (confirm("Cancel your registration for this event?")) {
      await dataService.unregisterFromEvent(eventId, user.id);
      setRefreshKey(k => k + 1);
    }
  };

  const isPastEvent = (event: Event) => {
    const compareDate = event.endDate || event.date;
    return new Date(compareDate) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">My Registrations</h1>
        <p className="text-muted-foreground">Manage your event registrations and share your feedback.</p>
      </div>

      <EventList
        events={events}
        emptyMessage="You haven't registered for any events yet."
        renderAction={(event) => {
          const isPast = isPastEvent(event);
          const hasReviewed = userReviews.some(r => r.eventId === event.id);

          if (isPast) {
            if (hasReviewed) {
              return (
                <div className="flex items-center justify-center gap-1.5 py-2 px-3 bg-green-50 text-green-700 rounded-lg border border-green-100 text-sm font-medium w-full">
                  <CheckCircle2 className="h-4 w-4" />
                  Reviewed
                </div>
              );
            }
            return (
              <Button
                className="w-full bg-accent hover:bg-accent/90 text-white gap-2"
                onClick={() => setReviewingEvent(event)}
              >
                <Star className="h-4 w-4" />
                Rate Event
              </Button>
            );
          }

          return (
            <div className="flex flex-col gap-2 w-full">
              <Button
                className="w-full bg-accent hover:bg-accent/90 text-white gap-2"
                onClick={() => setActiveChatEvent(event)}
              >
                <MessageSquare className="h-4 w-4" />
                Join Chat
              </Button>
              <Button className="w-full bg-slate-100 text-slate-900 hover:bg-slate-200" onClick={() => handleUnregister(event.id)}>
                Unregister
              </Button>
            </div>
          );
        }}
      />

      {reviewingEvent && (
        <EventReviewForm
          event={reviewingEvent}
          onCancel={() => setReviewingEvent(null)}
          onSuccess={() => {
            setReviewingEvent(null);
            setRefreshKey(k => k + 1);
          }}
        />
      )}
      {activeChatEvent && (
        <EventGroupChat 
          event={activeChatEvent} 
          onClose={() => setActiveChatEvent(null)} 
        />
      )}
    </div>
  );
}
