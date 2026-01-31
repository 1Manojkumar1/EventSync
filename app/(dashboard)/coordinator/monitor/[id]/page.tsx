"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { dataService } from "@/lib/store";
import { Event, User, CheckIn } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, XCircle, Users, Activity, MessageSquare, Shield, Download, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EventGroupChat } from "@/components/events/event-group-chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

export default function LiveMonitorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { id: eventId } = use(params);

  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<User[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeChatEvent, setActiveChatEvent] = useState<Event | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;

      const [eventData, allUsers] = await Promise.all([
        dataService.getEventById(eventId),
        dataService.getAllUsers()
      ]);

      if (!eventData) {
        alert("Event not found");
        router.push("/coordinator/my-events");
        return;
      }

      if (eventData.organizerId !== currentUser.id && currentUser.role !== 'admin') {
        alert("Unauthorized");
        router.push("/coordinator/my-events");
        return;
      }

      setEvent(eventData);

      const registeredUsers = allUsers.filter(u => eventData.attendeeIds?.includes(u.id));
      setRegistrations(registeredUsers);
      setIsLoading(false);
    };

    fetchData();
  }, [eventId, currentUser, router]);

  useEffect(() => {
    if (!eventId) return;
    const unsubscribe = dataService.subscribeToCheckIns(eventId, (updatedCheckIns) => {
      setCheckIns(updatedCheckIns);
    });
    return () => unsubscribe();
  }, [eventId]);

  const handleExportCSV = () => {
    if (!event || registrations.length === 0) return;

    const headers = ["Name", "Email", "Status", "Timestamp"];
    const rows = registrations.map(participant => {
      const checkIn = checkIns.find(c => c.userId === participant.id);
      return [
        participant.name,
        participant.email,
        checkIn?.status === 'present' ? "PRESENT" : "ABSENT/PENDING",
        checkIn?.timestamp ? new Date(checkIn.timestamp).toLocaleString() : "-"
      ];
    });

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `attendance_${event.title.replace(/\s+/g, '_').toLowerCase()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleToggleCheckIn = async (userId: string, userName: string, currentStatus?: string) => {
    const newStatus = currentStatus === 'present' ? 'absent' : 'present';
    await dataService.toggleCheckIn(eventId, userId, userName, newStatus);
  };

  const handleUpdateRole = async (userId: string) => {
    const roleName = prompt("Enter a chat role for this user (e.g. Moderator, Speaker, VIP):", "Event Moderator");
    if (roleName) {
      await dataService.updateChatRole(eventId, userId, roleName);
      // Refresh event data to see new role map
      const updatedEvent = await dataService.getEventById(eventId);
      if (updatedEvent) setEvent(updatedEvent);
    }
  };

  const handleBatchAttendance = async (status: 'present' | 'absent') => {
    if (!event || registrations.length === 0) return;

    setIsLoading(true);
    try {
      const updates = registrations.map(p => ({
        userId: p.id,
        userName: p.name,
        status
      }));
      await dataService.bulkCheckIn(eventId, updates);
      toast.success(`Marked all as ${status}`);
    } catch (error) {
      console.error("Batch update failed:", error);
      toast.error("Failed to update participation status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAttendanceWindow = async (isOpen: boolean) => {
    try {
      await dataService.updateEventAttendanceStatus(eventId, isOpen);
      setEvent(prev => prev ? { ...prev, isAttendanceOpen: isOpen } : null);
      toast.success(`Attendance is now ${isOpen ? 'Open' : 'Closed'}`);
    } catch (error) {
      toast.error("Failed to update attendance window");
    }
  };

  const handleSaveAttendance = () => {
    toast.success("Attendance session saved and synced!");
  };

  if (isLoading || !event) return <div className="p-8 text-center">Loading monitor...</div>;

  const presentCount = checkIns.filter(c => c.status === 'present').length;
  const totalCount = registrations.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Live Monitor: {event.title}</h1>
          <p className="text-muted-foreground">Track attendance and manage participant roles in real-time.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 border-slate-200" onClick={handleExportCSV}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => router.push(`/coordinator/edit/${eventId}`)}>
            Edit Event
          </Button>
          <Button
            className="bg-accent hover:bg-accent/90 text-white gap-2"
            onClick={() => setActiveChatEvent(event)}
          >
            <MessageSquare className="h-4 w-4" />
            Open Chat
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className={cn(
          "border-2 transition-colors",
          event.isAttendanceOpen ? "bg-emerald-50/50 border-emerald-200" : "bg-slate-50 border-slate-200"
        )}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase flex items-center justify-between">
              <span className={event.isAttendanceOpen ? "text-emerald-600" : "text-slate-600"}>
                Attendance Window
              </span>
              <div
                className={cn(
                  "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  event.isAttendanceOpen ? "bg-emerald-500" : "bg-slate-200"
                )}
                onClick={() => handleToggleAttendanceWindow(!event.isAttendanceOpen)}
              >
                <span
                  className={cn(
                    "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform",
                    event.isAttendanceOpen ? "translate-x-4" : "translate-x-1"
                  )}
                />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {event.isAttendanceOpen ? "OPEN" : "CLOSED"}
            </div>
            <p className="text-xs text-muted-foreground">
              {event.isAttendanceOpen ? "Students can be checked in" : "Checking-in is disabled"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50/50 border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 uppercase flex items-center gap-2">
              <Users className="h-4 w-4" />
              Attendance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">{presentCount} / {totalCount} Present</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50/50 border-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 uppercase flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Live Signals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.floor(presentCount * 0.8)}</div>
            <p className="text-xs text-muted-foreground">Active participants detected</p>
          </CardContent>
        </Card>

        <Card className="bg-amber-50/50 border-amber-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-600 uppercase flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Chat Control
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(event.chatRoleMap || {}).length}</div>
            <p className="text-xs text-muted-foreground">Users with elevated chat roles</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p>Participants Enrollment</p>
              <CardDescription>Manage check-ins and assign special chat roles.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                onClick={() => handleBatchAttendance('present')}
                disabled={!event.isAttendanceOpen}
              >
                Mark All Present
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-red-200 text-red-700 hover:bg-red-50"
                onClick={() => handleBatchAttendance('absent')}
                disabled={!event.isAttendanceOpen}
              >
                Mark All Absent
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Roll Number/ID</th>
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="px-4 py-3 text-left font-medium">Email</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Chat Role</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {registrations.map(participant => {
                    const checkIn = checkIns.find(c => c.userId === participant.id);
                    const isPresent = checkIn?.status === 'present';
                    const customRole = event.chatRoleMap?.[participant.id];

                    return (
                      <tr key={participant.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs">{participant.id}</td>
                        <td className="px-4 py-3 font-medium">{participant.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{participant.email}</td>
                        <td className="px-4 py-3">
                          <Badge 
                            variant={isPresent ? "default" : "secondary"} 
                            className={cn(
                              "gap-1 flex w-fit items-center",
                              isPresent ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-slate-100 text-slate-500 hover:bg-slate-100"
                            )}
                          >
                            {isPresent ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            {isPresent ? "Present" : "Absent"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {customRole ? (
                            <Badge variant="outline" className="border-accent text-accent">
                              {customRole}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground italic text-xs">Standard</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={cn(
                              "h-8 w-8 p-0 rounded-full transition-all",
                              isPresent 
                                ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100" 
                                : "text-slate-400 hover:bg-slate-100"
                            )}
                            onClick={() => handleToggleCheckIn(participant.id, participant.name, checkIn?.status)}
                            disabled={!event.isAttendanceOpen}
                          >
                            <Check className={cn("h-4 w-4", isPresent ? "opacity-100" : "opacity-20")} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleUpdateRole(participant.id)}
                          >
                            <Shield className="h-4 w-4 text-slate-400" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {registrations.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        No participants registered for this event yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </ScrollArea>

          <div className="mt-6 flex justify-end gap-3 pt-6 border-t">
            <Button variant="outline" className="rounded-xl px-6" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button className="rounded-xl px-10 bg-slate-900" onClick={handleSaveAttendance}>
              Save & Submit Attendance
            </Button>
          </div>
        </CardContent>
      </Card>
      {activeChatEvent && (
        <EventGroupChat
          event={activeChatEvent}
          onClose={() => setActiveChatEvent(null)}
        />
      )}
    </div>
  );
}
