"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Edit, MessageSquare, X, Star, BarChart2, CheckCircle2 } from "lucide-react";
import { Event, VolunteerPoll, EventReview } from "@/lib/types";
import { dataService } from "@/lib/store";
import { volunteerService } from "@/lib/volunteer-service";
import { RiskAnalysisService } from "@/lib/risk-analysis-service";
import { RiskIndicator } from "@/components/events/risk-indicator";
import { useAuth } from "@/context/auth-context";
import { EventList } from "@/components/events/event-list";
import { Button } from "@/components/ui/button";
import { ReviewList } from "@/components/events/review-list";
import { EventGroupChat } from "@/components/events/event-group-chat";

export default function MyEventsPage() {
    const [myEvents, setMyEvents] = useState<Event[]>([]);
    const [allEvents, setAllEvents] = useState<Event[]>([]);
    const [polls, setPolls] = useState<VolunteerPoll[]>([]);
    const { user } = useAuth();
    const [refreshKey, setRefreshKey] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Review Modal State
    const [selectedEventForReviews, setSelectedEventForReviews] = useState<Event | null>(null);
    const [currentReviews, setCurrentReviews] = useState<EventReview[]>([]);
    const [isLoadingReviews, setIsLoadingReviews] = useState(false);
    const [activeChatEvent, setActiveChatEvent] = useState<Event | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                const [eventsData, pollsData] = await Promise.all([
                    dataService.getEvents(),
                    volunteerService.getPollsByOrganizer(user.id)
                ]);

                setAllEvents(eventsData);
                setPolls(pollsData);
                setMyEvents(eventsData.filter(e => e.organizerId === user.id));
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [user, refreshKey]);

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this event? This cannot be undone.")) {
            await dataService.deleteEvent(id);
            setRefreshKey(k => k + 1);
        }
    };

    const handleViewReviews = async (event: Event) => {
        setSelectedEventForReviews(event);
        setIsLoadingReviews(true);
        try {
            const reviews = await dataService.getReviewsByEvent(event.id);
            setCurrentReviews(reviews);
        } catch (err) {
            console.error("Error fetching reviews:", err);
        } finally {
            setIsLoadingReviews(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">My Events</h1>
                    <p className="text-muted-foreground">Manage your events and monitor failure risks.</p>
                </div>
                <Link href="/coordinator/create">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create Event
                    </Button>
                </Link>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <EventList
                    events={myEvents}
                    emptyMessage="You haven't created any events yet."
                    renderBadge={(event) => {
                        const eventPoll = polls.find(p => p.eventId === event.id);
                        const analysis = RiskAnalysisService.calculateRisk(event, allEvents, eventPoll);
                        return <RiskIndicator analysis={analysis} />;
                    }}
                    renderAction={(event) => (
                        <div className="flex flex-col gap-2 w-full">
                            <div className="flex gap-2 w-full">
                                <Link href={`/coordinator/edit/${event.id}`} className="flex-1">
                                    <Button variant="outline" size="sm" className="w-full gap-2 border-slate-200">
                                        <Edit className="h-4 w-4" />
                                        Edit
                                    </Button>
                                </Link>
                                <Button variant="destructive" size="sm" className="flex-1 gap-2" onClick={() => handleDelete(event.id)}>
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </Button>
                            </div>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="w-full gap-2 bg-slate-100 text-slate-900 hover:bg-slate-200"
                                onClick={() => handleViewReviews(event)}
                            >
                                <MessageSquare className="h-4 w-4" />
                                View Participant Feedback
                            </Button>
                            <div className="grid grid-cols-2 gap-2">
                                <Link href={`/coordinator/monitor/${event.id}`} className="w-full">
                                    <Button variant="outline" size="sm" className="w-full gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Take Attendance
                                    </Button>
                                </Link>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full gap-2 border-accent/20 text-accent hover:bg-accent/5"
                                    onClick={() => setActiveChatEvent(event)}
                                >
                                    <MessageSquare className="h-4 w-4" />
                                    Group Chat
                                </Button>
                            </div>
                            <Link href={`/coordinator/monitor/${event.id}`} className="w-full">
                                <Button variant="outline" size="sm" className="w-full gap-2 border-blue-200 text-blue-700 hover:bg-blue-50">
                                    <BarChart2 className="h-4 w-4" />
                                    Live Monitor & Role Control
                                </Button>
                            </Link>
                        </div>
                    )}
                />
            )}

            {/* Reviews Modal */}
            {selectedEventForReviews && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-3xl max-h-[80vh] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b flex items-center justify-between bg-slate-50">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5 text-accent" />
                                    Participant Feedback
                                </h2>
                                <p className="text-sm text-slate-500">{selectedEventForReviews.title}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedEventForReviews(null)} className="rounded-full">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            {isLoadingReviews ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-3">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div>
                                    <p className="text-slate-500 animate-pulse font-medium">Loading reviews...</p>
                                </div>
                            ) : (
                                <ReviewList reviews={currentReviews} />
                            )}
                        </div>

                        <div className="p-4 border-t bg-slate-50 flex justify-end">
                            <Button onClick={() => setSelectedEventForReviews(null)} className="px-8 rounded-xl h-11 bg-slate-900">
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
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

