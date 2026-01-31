"use client";

import { useState, useEffect } from "react";
import { Event } from "@/lib/types";
import { dataService } from "@/lib/store";
import { EventList } from "@/components/events/event-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { Input } from "@/components/ui/input";
import { Search, MessageSquare, Sparkles, Settings, X, Filter, Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";
import { PendingReviewsNotification } from "@/components/events/pending-reviews-notification";
import { EventGroupChat } from "@/components/events/event-group-chat";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "tech", label: "Technology", icon: "🖥️" },
  { id: "cultural", label: "Cultural", icon: "🎭" },
  { id: "sports", label: "Sports", icon: "⚽" },
  { id: "academic", label: "Academic", icon: "📚" },
  { id: "arts", label: "Arts & Design", icon: "🎨" },
  { id: "music", label: "Music", icon: "🎵" },
  { id: "gaming", label: "Gaming", icon: "🎮" },
  { id: "social", label: "Social", icon: "🤝" },
  { id: "career", label: "Career", icon: "💼" },
  { id: "health", label: "Health", icon: "🧘" },
  { id: "volunteering", label: "Community", icon: "🌍" },
  { id: "innovation", label: "Startup", icon: "💡" },
  { id: "environment", label: "Eco", icon: "🌱" },
  { id: "literature", label: "Books", icon: "📖" },
];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeChatEvent, setActiveChatEvent] = useState<Event | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      const allEvents = await dataService.getEvents();
      setEvents(allEvents);
    };
    fetchEvents();
  }, [refreshKey]);

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || e.category === selectedCategory;

    // Date filtering logic
    const eventTime = new Date(e.date).getTime();
    const startMatches = !startDate || eventTime >= new Date(startDate).getTime();
    const endMatches = !endDate || eventTime <= new Date(endDate).getTime();

    return matchesSearch && matchesCategory && startMatches && endMatches;
  });

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory(null);
    setStartDate("");
    setEndDate("");
  };

  const recommendedEvents = events.filter(e =>
    user?.interests && e.category && user.interests.includes(e.category)
  ).slice(0, 3);

  const handleRegister = async (eventId: string) => {
    if (!user) return;
    try {
      await dataService.registerForEvent(eventId, user.id);
      setRefreshKey(k => k + 1); // Refresh data
      // In a real app, use toast here
      alert("Successfully registered!");
    } catch (error) {
      // ...
      console.error(error);
      alert("Failed to register");
    }
  };

  const handleUnregister = async (eventId: string) => {
    if (!user) return;
    try {
      await dataService.unregisterFromEvent(eventId, user.id);
      setRefreshKey(k => k + 1);
      alert("Unregistered from event.");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Upcoming Campus Events</h1>
        <p className="text-muted-foreground">Discover and join events happening around the university.</p>
      </div>

      <PendingReviewsNotification />

      {user?.role === 'participant' && (
        <div className="space-y-4 p-6 rounded-3xl bg-gradient-to-br from-accent/5 via-transparent to-primary/5 border border-accent/10 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                <Sparkles className="h-4 w-4" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">Recommended for You</h2>
            </div>
            <Link href="/settings">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-accent gap-2">
                <Settings className="h-4 w-4" />
                Update Interests
              </Button>
            </Link>
          </div>

          {recommendedEvents.length > 0 ? (
            <EventList
              events={recommendedEvents}
              renderAction={(event) => {
                const isRegistered = event.attendeeIds?.includes(user.id);
                const now = new Date();
                const regStart = event.registrationStartDate ? new Date(event.registrationStartDate) : null;
                const regEnd = event.registrationEndDate ? new Date(event.registrationEndDate) : null;

                const regNotStarted = regStart && now < regStart;
                const regClosed = regEnd && now > regEnd;
                const isFull = event.attendeeIds?.length >= event.maxAttendees;

                let buttonText = "Quick Register";
                if (isRegistered) buttonText = "Already Registered";
                else if (regNotStarted) buttonText = "Opening Soon";
                else if (regClosed) buttonText = "Registration Closed";
                else if (isFull) buttonText = "Event Full";

                return (
                  <Button
                    className="w-full bg-accent/10 text-accent hover:bg-accent hover:text-white border-none"
                    onClick={() => handleRegister(event.id)}
                    disabled={isRegistered || !!regNotStarted || !!regClosed || isFull}
                  >
                    {buttonText}
                  </Button>
                );
              }}
            />
          ) : (
            <Card className="border-dashed bg-white/50 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-slate-300" />
                </div>
                <p className="text-slate-500 max-w-sm mb-4">Discover events tailored specifically for you by adding your interests in settings.</p>
                <Link href="/settings">
                  <Button variant="outline" size="sm" className="rounded-xl">Customize My Feed</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="flex flex-col gap-4 sticky top-0 z-20 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 py-4 -mx-4 px-4 lg:-mx-6 lg:px-6 border-b shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Find an event..."
              className="pl-9 h-11 rounded-xl border-slate-200 focus:ring-accent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative min-w-[180px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10 pointer-events-none" />
            <select
              value={selectedCategory || ""}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="w-full pl-9 pr-4 h-11 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none appearance-none cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 h-11">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">From</span>
            <input
              type="date"
              className="bg-transparent border-none text-sm font-medium focus:ring-0 outline-none cursor-pointer"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 h-11">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">To</span>
            <input
              type="date"
              className="bg-transparent border-none text-sm font-medium focus:ring-0 outline-none cursor-pointer"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {/* Clear Button */}
          {(search || selectedCategory || startDate || endDate) && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="text-slate-500 hover:text-accent gap-2 h-11 px-4 rounded-xl font-medium"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <EventList
        events={filteredEvents}
        renderAction={(event) => {
          if (user?.role === 'participant') {
            const isRegistered = event.attendeeIds?.includes(user.id);
            const isFull = event.attendeeIds.length >= event.maxAttendees;
            const now = new Date();
            const regStart = event.registrationStartDate ? new Date(event.registrationStartDate) : null;
            const regEnd = event.registrationEndDate ? new Date(event.registrationEndDate) : null;

            const regNotStarted = regStart && now < regStart;
            const regClosed = regEnd && now > regEnd;

            if (isRegistered) {
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
            }

            let buttonText = "Register Now";
            if (regNotStarted) buttonText = "Registration Opening Soon";
            else if (regClosed) buttonText = "Registration Closed";
            else if (isFull) buttonText = "Event Full";

            return (
              <Button
                className="w-full"
                onClick={() => handleRegister(event.id)}
                disabled={isFull || !!regNotStarted || !!regClosed}
              >
                {buttonText}
              </Button>
            );
          }
          return null; // Admins/Coordinators don't register here usually, or can just view
        }}
      />
      {activeChatEvent && (
        <EventGroupChat
          event={activeChatEvent}
          onClose={() => setActiveChatEvent(null)}
        />
      )}
    </div>
  );
}
