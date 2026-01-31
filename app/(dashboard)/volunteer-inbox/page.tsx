"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { volunteerService } from "@/lib/volunteer-service";
import { dataService } from "@/lib/store";
import { VolunteerPoll, Event } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  Users, 
  Clock, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Loader2,
  AlertCircle,
  Star,
  Award
} from "lucide-react";

export default function VolunteerInboxPage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  
  const [polls, setPolls] = useState<VolunteerPoll[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadData();
  }, [user, router]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const pollsPromise = (user?.role === 'admin' || user?.role === 'coordinator')
        ? volunteerService.getAllOpenPolls()
        : volunteerService.getPollsForVolunteer(user!.id);
        
      const [pollsData, eventsData] = await Promise.all([
        pollsPromise,
        dataService.getEvents()
      ]);
      setPolls(pollsData);
      setEvents(eventsData);
    } catch (err) {
      console.error("Error loading polls:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespond = async (pollId: string, accept: boolean) => {
    setRespondingTo(pollId);
    try {
      await volunteerService.respondToPoll(pollId, user!.id, accept);
      
      // Update volunteer history if accepted
      if (accept && user?.volunteerHistory) {
        await updateUser({
          volunteerHistory: {
            ...user.volunteerHistory,
            lastActive: new Date().toISOString(),
          }
        });
      }
      
      // Reload data
      await loadData();
    } catch (err) {
      console.error("Error responding to poll:", err);
    } finally {
      setRespondingTo(null);
    }
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      low: "bg-slate-100 text-slate-700",
      medium: "bg-blue-100 text-blue-700",
      high: "bg-orange-100 text-orange-700",
      urgent: "bg-red-100 text-red-700 animate-pulse",
    };
    return styles[priority as keyof typeof styles] || styles.medium;
  };

  if (!user) return null;

  // Check if user is a volunteer (Staff can always see the inbox)
  if (!user.isVolunteer && user.role === 'participant') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <Award className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Become a Volunteer</h2>
        <p className="text-muted-foreground max-w-md">
          You haven't registered as a volunteer yet. Update your profile to start receiving volunteer opportunities!
        </p>
        <Button onClick={() => router.push('/onboarding')} className="mt-4">
          Complete Volunteer Registration
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Bell className="h-8 w-8 text-accent" />
          Volunteer Inbox
        </h1>
        <p className="text-muted-foreground">Opportunities matched to your skills and preferences.</p>
      </div>

      {/* Volunteer Score Card */}
      {user.volunteerScores && (
        <Card className="bg-gradient-to-r from-accent/10 to-accent/5 border-accent/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Your Volunteer Score</p>
                <p className="text-4xl font-bold text-accent">{user.volunteerScores.overall}</p>
              </div>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Reliability</p>
                  <p className="font-semibold">{user.volunteerScores.reliability}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Skills</p>
                  <p className="font-semibold">{user.volunteerScores.skillUsage}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Feedback</p>
                  <p className="font-semibold">{user.volunteerScores.feedback}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Impact</p>
                  <p className="font-semibold">{user.volunteerScores.impact}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Polls */}
      <Card>
        <CardHeader>
          <CardTitle>Open Opportunities</CardTitle>
          <CardDescription>
            {polls.length} {polls.length === 1 ? 'opportunity' : 'opportunities'} matching your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : polls.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No new opportunities</p>
              <p className="text-sm">Check back later for volunteer requests matching your skills.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {polls.map(poll => {
                const event = events.find(e => e.id === poll.eventId);
                const hasResponded = poll.respondedVolunteers.includes(user.id) || 
                                    poll.declinedVolunteers.includes(user.id);
                const accepted = poll.respondedVolunteers.includes(user.id);
                
                return (
                  <div 
                    key={poll.id} 
                    className={`p-5 rounded-xl border-2 transition-all ${
                      hasResponded 
                        ? accepted 
                          ? "bg-green-50 border-green-200" 
                          : "bg-slate-50 border-slate-200 opacity-60"
                        : "bg-card border-border hover:border-accent/50 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">{poll.title}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(poll.priority)}`}>
                            {poll.priority}
                          </span>
                        </div>
                        <p className="text-muted-foreground">{event?.title || 'Event'}</p>
                      </div>
                      {hasResponded && (
                        <span className={`flex items-center gap-1 text-sm font-medium ${accepted ? 'text-green-600' : 'text-slate-500'}`}>
                          {accepted ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                          {accepted ? 'Accepted' : 'Declined'}
                        </span>
                      )}
                    </div>

                    {/* Event Details */}
                    {event && (
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {poll.respondedVolunteers.length}/{poll.volunteerCount} spots filled
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Deadline: {new Date(poll.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {/* Skills Required */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {poll.skillsRequired.map(skill => {
                        const userHasSkill = user.volunteerProfile?.skills?.includes(skill);
                        return (
                          <span 
                            key={skill} 
                            className={`px-2 py-1 rounded text-xs ${
                              userHasSkill 
                                ? "bg-accent/20 text-accent font-medium" 
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {userHasSkill && <Star className="h-3 w-3 inline mr-1" />}
                            {skill}
                          </span>
                        );
                      })}
                    </div>

                    {/* Actions */}
                    {!hasResponded && (
                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleRespond(poll.id, true)}
                          disabled={respondingTo === poll.id}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          {respondingTo === poll.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Accept
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => handleRespond(poll.id, false)}
                          disabled={respondingTo === poll.id}
                          className="bg-transparent text-foreground border hover:bg-muted"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
