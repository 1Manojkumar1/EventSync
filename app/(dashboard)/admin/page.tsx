"use client";

import { useEffect, useState } from "react";
import { dataService, MOCK_USERS } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, TrendingUp, MessageSquare } from "lucide-react";
import { EventList } from "@/components/events/event-list";
import { EventGroupChat } from "@/components/events/event-group-chat";
import { Event } from "@/lib/types";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        totalEvents: 0,
        totalUsers: 0,
        totalRegistrations: 0,
    });
    const [allEvents, setAllEvents] = useState<Event[]>([]);
    const [activeChatEvent, setActiveChatEvent] = useState<Event | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            const events = await dataService.getEvents();
            const users = MOCK_USERS; // Keeping users mocked for now as per plan
            const registrations = events.reduce((acc, curr) => acc + curr.attendeeIds.length, 0);

            setStats({
                totalEvents: events.length,
                totalUsers: users.length,
                totalRegistrations: registrations,
            });
            setAllEvents(events);
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsers}</div>
                        <p className="text-xs text-muted-foreground">Across all roles</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Events</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalEvents}</div>
                        <p className="text-xs text-muted-foreground">Scheduled events</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
                        <p className="text-xs text-muted-foreground">Across all events</p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">System Events</h2>
                <EventList
                    events={allEvents}
                    renderAction={(event) => (
                        <Button
                            className="w-full bg-accent hover:bg-accent/90 text-white gap-2"
                            onClick={() => setActiveChatEvent(event)}
                        >
                            <MessageSquare className="h-4 w-4" />
                            Moderate Chat
                        </Button>
                    )}
                />
            </div>

            {activeChatEvent && (
                <EventGroupChat
                    event={activeChatEvent}
                    onClose={() => setActiveChatEvent(null)}
                />
            )}
        </div>
    );
}
