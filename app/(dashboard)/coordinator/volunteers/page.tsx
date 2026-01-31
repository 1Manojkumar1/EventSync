"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { volunteerService } from "@/lib/volunteer-service";
import { dataService } from "@/lib/store";
import { Event, VolunteerPoll, ExperienceLevel, PollPriority } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Clock, AlertCircle, CheckCircle, Plus, Loader2, ChevronDown } from "lucide-react";

const SKILL_SUGGESTIONS = [
  "Audio/Visual", "Stage Management", "Registration", "Photography",
  "Hospitality", "IT Support", "Logistics", "Decoration", "Anchoring",
  "First Aid", "Crowd Management", "Social Media"
];

const PRIORITY_OPTIONS: { id: PollPriority; label: string; color: string }[] = [
  { id: "low", label: "Low", color: "bg-slate-100 text-slate-700" },
  { id: "medium", label: "Medium", color: "bg-blue-100 text-blue-700" },
  { id: "high", label: "High", color: "bg-orange-100 text-orange-700" },
  { id: "urgent", label: "Urgent", color: "bg-red-100 text-red-700" },
];

const EXPERIENCE_OPTIONS: { id: ExperienceLevel | 'any'; label: string }[] = [
  { id: "any", label: "Any Level" },
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "expert", label: "Expert" },
];

export default function CreatePollPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [polls, setPolls] = useState<VolunteerPoll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [selectedEvent, setSelectedEvent] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skillsRequired, setSkillsRequired] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | 'any'>("any");
  const [volunteerCount, setVolunteerCount] = useState(5);
  const [priority, setPriority] = useState<PollPriority>("medium");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    if (!user || (user.role !== 'coordinator' && user.role !== 'admin')) {
      router.push('/login');
      return;
    }
    loadData();
  }, [user, router]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [eventsData, pollsData] = await Promise.all([
        dataService.getEvents(),
        volunteerService.getPollsByOrganizer(user!.id)
      ]);
      // Filter events by this coordinator
      const myEvents = user?.role === 'admin' 
        ? eventsData 
        : eventsData.filter(e => e.organizerId === user?.id);
      setEvents(myEvents);
      setPolls(pollsData);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setSkillsRequired(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !title) return;

    setIsSubmitting(true);
    try {
      const selectedEventData = events.find(e => e.id === selectedEvent);
      await volunteerService.createPoll({
        eventId: selectedEvent,
        createdBy: user!.id,
        title,
        description,
        skillsRequired,
        experienceLevel,
        volunteerCount,
        priority,
        status: 'open',
        respondedVolunteers: [],
        declinedVolunteers: [],
        matchedVolunteers: [],
        createdAt: new Date().toISOString(),
        deadline: deadline || selectedEventData?.date || new Date().toISOString(),
      });

      // Reset form
      setShowForm(false);
      setTitle("");
      setDescription("");
      setSkillsRequired([]);
      setSelectedEvent("");
      setVolunteerCount(5);
      setPriority("medium");
      setDeadline("");

      // Reload polls
      await loadData();
    } catch (err) {
      console.error("Error creating poll:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      open: "bg-green-100 text-green-700",
      closed: "bg-slate-100 text-slate-700",
      filled: "bg-blue-100 text-blue-700",
    };
    return styles[status as keyof typeof styles] || styles.open;
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Volunteer Polls</h1>
          <p className="text-muted-foreground">Create and manage volunteer requests for your events.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          {showForm ? "Cancel" : <><Plus className="h-4 w-4" /> Create Poll</>}
        </Button>
      </div>

      {/* Create Poll Form */}
      {showForm && (
        <Card className="border-accent/20 bg-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              New Volunteer Poll
            </CardTitle>
            <CardDescription>Specify your volunteer requirements. Matching volunteers will be notified.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Event Selection */}
              <div className="grid gap-2">
                <Label>Select Event</Label>
                <select
                  value={selectedEvent}
                  onChange={e => setSelectedEvent(e.target.value)}
                  className="w-full p-3 rounded-lg border bg-background"
                  required
                >
                  <option value="">Choose an event...</option>
                  {events.map(event => (
                    <option key={event.id} value={event.id}>{event.title}</option>
                  ))}
                </select>
              </div>

              {/* Title & Description */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Poll Title</Label>
                  <Input
                    placeholder="e.g., Stage Crew Needed"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Volunteers Needed</Label>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={volunteerCount}
                    onChange={e => setVolunteerCount(parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>

              {/* Skills */}
              <div className="grid gap-2">
                <Label>Skills Required (select or type)</Label>
                <div className="flex flex-wrap gap-2">
                  {SKILL_SUGGESTIONS.map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                        skillsRequired.includes(skill)
                          ? "bg-accent text-accent-foreground border-accent"
                          : "bg-card border-border hover:border-muted-foreground"
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience & Priority */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Minimum Experience</Label>
                  <div className="flex gap-2">
                    {EXPERIENCE_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setExperienceLevel(opt.id)}
                        className={`px-3 py-2 rounded-lg text-sm border flex-1 transition-all ${
                          experienceLevel === opt.id
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card border-border"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Priority</Label>
                  <div className="flex gap-2">
                    {PRIORITY_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setPriority(opt.id)}
                        className={`px-3 py-2 rounded-lg text-sm border flex-1 transition-all ${
                          priority === opt.id
                            ? opt.color + " border-current font-medium"
                            : "bg-card border-border"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Deadline */}
              <div className="grid gap-2">
                <Label>Response Deadline</Label>
                <Input
                  type="datetime-local"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Poll & Notify Volunteers"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Existing Polls */}
      <Card>
        <CardHeader>
          <CardTitle>Your Polls</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : polls.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No volunteer polls created yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {polls.map(poll => {
                const event = events.find(e => e.id === poll.eventId);
                return (
                  <div key={poll.id} className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{poll.title}</h3>
                        <p className="text-sm text-muted-foreground">{event?.title || 'Unknown Event'}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(poll.status)}`}>
                        {poll.status}
                      </span>
                    </div>
                    <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {poll.respondedVolunteers.length}/{poll.volunteerCount} accepted
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(poll.deadline).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      {poll.skillsRequired.slice(0, 3).map(skill => (
                        <span key={skill} className="px-2 py-0.5 bg-muted rounded text-xs">{skill}</span>
                      ))}
                      {poll.skillsRequired.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{poll.skillsRequired.length - 3} more</span>
                      )}
                    </div>
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
