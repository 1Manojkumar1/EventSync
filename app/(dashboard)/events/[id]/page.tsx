"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { dataService } from "@/lib/store";
import { Event, ScheduleItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, MapPin, Users, Image as ImageIcon, Plus, Trash2, Edit2, Check, X, Clock, User as UserIcon, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = use(params);

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Edit states
  const [editData, setEditData] = useState<Partial<Event>>({});
  const [newScheduleItem, setNewScheduleItem] = useState<ScheduleItem>({
    time: "",
    activityTitle: "",
    activityDescription: "",
    responsiblePerson: ""
  });

  const canEdit = user?.role === 'admin' || (user?.role === 'coordinator' && event?.organizerId === user.id);

  useEffect(() => {
    const fetchEvent = async () => {
      const data = await dataService.getEventById(id);
      if (!data) {
        router.push("/events");
        return;
      }
      setEvent(data);
      setEditData(data);
      setIsLoading(false);
    };
    fetchEvent();
  }, [id, router]);

  const handleSave = async () => {
    if (!event) return;
    try {
      const updatedEvent = await dataService.updateEvent(event.id, editData);
      setEvent(updatedEvent);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update event:", error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditData(prev => ({ ...prev, posterImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addScheduleItem = () => {
    if (!newScheduleItem.time || !newScheduleItem.activityTitle) return;
    const updatedSchedule = [...(editData.schedule || []), newScheduleItem];
    setEditData(prev => ({ ...prev, schedule: updatedSchedule }));
    setNewScheduleItem({ time: "", activityTitle: "", activityDescription: "", responsiblePerson: "" });
  };

  const removeScheduleItem = (index: number) => {
    const updatedSchedule = editData.schedule?.filter((_, i) => i !== index);
    setEditData(prev => ({ ...prev, schedule: updatedSchedule }));
  };

  if (isLoading || !event) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 px-2 lg:px-4">
      {/* Header Section */}
      <div className="text-center space-y-4">
        {isEditing ? (
          <Input
            value={editData.title}
            onChange={e => setEditData(prev => ({ ...prev, title: e.target.value }))}
            className="text-4xl font-bold text-center h-auto py-2 bg-transparent border-none focus-visible:ring-1 focus-visible:ring-accent"
          />
        ) : (
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">{event.title}</h1>
        )}

        {/* Poster Upload Area */}
        <div className="relative group">
          <div className={cn(
            "aspect-[21/9] w-full rounded-3xl overflow-hidden border-2 border-dashed transition-all duration-300",
            canEdit && isEditing ? "border-accent bg-accent/5 cursor-pointer" : "border-slate-200 bg-slate-50",
            !editData.posterImage && "flex items-center justify-center"
          )}>
            {editData.posterImage ? (
              <img src={editData.posterImage} alt="Event Poster" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center space-y-2 text-slate-400">
                <ImageIcon className="h-12 w-12 mx-auto" />
                <p>{canEdit && isEditing ? "Click to upload poster image" : "No poster available"}</p>
              </div>
            )}
            {canEdit && isEditing && (
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            )}
          </div>
          {canEdit && !isEditing && (
            <Button
              size="sm"
              className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-slate-900 hover:bg-white shadow-lg border border-white/50"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Page
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-2xl p-1.5 bg-slate-100 h-14 mb-10 shadow-inner">
          <TabsTrigger value="info" className="rounded-xl h-full data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
            <div className="flex items-center gap-3 px-4 font-semibold">
              <Plus className="h-5 w-5 text-accent" />
              Information
            </div>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="rounded-xl h-full data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
            <div className="flex items-center gap-3 px-4 font-semibold">
              <Calendar className="h-5 w-5 text-blue-500" />
              Schedule
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-0 focus-visible:ring-0">
          {/* Section 1: Description & Details */}
          <Card className="rounded-[2rem] border-slate-200/60 shadow-sm overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-6 px-10">
              <CardTitle className="text-2xl flex items-center gap-3 text-slate-900">
                <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                  <Edit2 className="h-5 w-5" />
                </div>
                Event Description & Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-12">
              <div className="space-y-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <div className="h-1 w-8 bg-accent rounded-full" />
                  About this event
                </h3>
                {isEditing ? (
                  <Textarea
                    value={editData.description}
                    onChange={e => setEditData(prev => ({ ...prev, description: e.target.value }))}
                    className="min-h-[150px] rounded-2xl border-slate-200 focus:border-accent resize-none"
                    placeholder="Tell participants what to expect..."
                  />
                ) : (
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{event.description}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                      <Tag className="h-5 w-5" />
                    </div>
                    <div className="space-y-1 w-full">
                      <p className="text-xs font-bold text-slate-400 uppercase">Category</p>
                      {isEditing ? (
                        <Input
                          value={editData.category}
                          onChange={e => setEditData(prev => ({ ...prev, category: e.target.value }))}
                          className="h-9 rounded-lg border-slate-200"
                          placeholder="e.g. Workshop, Hackathon"
                        />
                      ) : (
                        <p className="font-medium text-slate-900">{event.category || "General Event"}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                      <UserIcon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1 w-full">
                      <p className="text-xs font-bold text-slate-400 uppercase">Organizer</p>
                      {isEditing ? (
                        <Input
                          value={editData.organizer}
                          onChange={e => setEditData(prev => ({ ...prev, organizer: e.target.value }))}
                          className="h-9 rounded-lg border-slate-200"
                          placeholder="Club or Department Name"
                        />
                      ) : (
                        <p className="font-medium text-slate-900">{event.organizer || "University Campus"}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="space-y-1 w-full">
                      <p className="text-xs font-bold text-slate-400 uppercase">Date & Time</p>
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            type="datetime-local"
                            value={editData.date ? new Date(editData.date).toLocaleString('sv-SE').replace(' ', 'T').slice(0, 16) : ""}
                            onChange={e => setEditData(prev => ({ ...prev, date: new Date(e.target.value).toISOString() }))}
                            className="h-9 rounded-lg border-slate-200"
                          />
                          <Input
                            type="datetime-local"
                            value={editData.endDate ? new Date(editData.endDate).toLocaleString('sv-SE').replace(' ', 'T').slice(0, 16) : ""}
                            onChange={e => setEditData(prev => ({ ...prev, endDate: new Date(e.target.value).toISOString() }))}
                            className="h-9 rounded-lg border-slate-200"
                          />
                        </div>
                      ) : (
                        <>
                          <p className="font-medium text-slate-900">
                            {new Date(event.date).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                          <p className="text-sm text-slate-500">
                            {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {event.endDate && ` - ${new Date(event.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div className="space-y-1 w-full">
                      <p className="text-xs font-bold text-slate-400 uppercase">Registration Window</p>
                      {isEditing ? (
                        <div className="space-y-2">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Starts</span>
                            <Input
                              type="datetime-local"
                              value={editData.registrationStartDate ? new Date(editData.registrationStartDate).toLocaleString('sv-SE').replace(' ', 'T').slice(0, 16) : ""}
                              onChange={e => setEditData(prev => ({ ...prev, registrationStartDate: e.target.value ? new Date(e.target.value).toISOString() : undefined }))}
                              className="h-9 rounded-lg border-slate-200"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Ends</span>
                            <Input
                              type="datetime-local"
                              value={editData.registrationEndDate ? new Date(editData.registrationEndDate).toLocaleString('sv-SE').replace(' ', 'T').slice(0, 16) : ""}
                              onChange={e => setEditData(prev => ({ ...prev, registrationEndDate: e.target.value ? new Date(e.target.value).toISOString() : undefined }))}
                              className="h-9 rounded-lg border-slate-200"
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="font-medium text-slate-900 line-clamp-1">
                            {event.registrationStartDate ? new Date(event.registrationStartDate).toLocaleDateString() : "Immediate"}
                            {" - "}
                            {event.registrationEndDate ? new Date(event.registrationEndDate).toLocaleDateString() : "Until Event Starts"}
                          </p>
                          <p className="text-sm text-slate-500">
                            {(() => {
                              const now = new Date();
                              const start = event.registrationStartDate ? new Date(event.registrationStartDate) : null;
                              const end = event.registrationEndDate ? new Date(event.registrationEndDate) : null;
                              if (start && now < start) return "Opens in " + Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) + " days";
                              if (end && now > end) return "Registration closed";
                              return "Registration open now";
                            })()}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="space-y-1 w-full">
                      <p className="text-xs font-bold text-slate-400 uppercase">Venue</p>
                      {isEditing ? (
                        <Input
                          value={editData.location}
                          onChange={e => setEditData(prev => ({ ...prev, location: e.target.value }))}
                          className="h-9 rounded-lg border-slate-200"
                        />
                      ) : (
                        <p className="font-medium text-slate-900">{event.location}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                      <Users className="h-5 w-5" />
                    </div>
                    <div className="space-y-1 w-full">
                      <p className="text-xs font-bold text-slate-400 uppercase">Capacity</p>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editData.maxAttendees}
                          onChange={e => setEditData(prev => ({ ...prev, maxAttendees: parseInt(e.target.value) }))}
                          className="h-9 rounded-lg border-slate-200"
                        />
                      ) : (
                        <p className="font-medium text-slate-900">{event.maxAttendees} spots total</p>
                      )}
                      <p className="text-xs text-slate-500">{event.attendeeIds.length} already registered</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="mt-0 focus-visible:ring-0">
          {/* Section 2: Event Schedule */}
          <Card className="rounded-[2rem] border-slate-200/60 shadow-sm overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-6 px-10">
              <CardTitle className="text-2xl flex items-center gap-3 text-slate-900">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                  <Clock className="h-5 w-5" />
                </div>
                Detailed Event Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10">
              <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">

                {(editData.schedule || event.schedule || []).map((item, index) => (
                  <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-200 group-[.is-active]:bg-accent group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between space-x-2 mb-1">
                        <div className="font-bold text-slate-900">{item.activityTitle}</div>
                        <time className="font-mono text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">{item.time}</time>
                      </div>
                      <div className="text-slate-500 text-sm">{item.activityDescription}</div>
                      {item.responsiblePerson && (
                        <div className="mt-2 pt-2 border-t border-slate-50 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                          <UserIcon className="h-3 w-3" />
                          {item.responsiblePerson}
                        </div>
                      )}
                      {isEditing && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 text-red-500 hover:text-red-700 h-8 px-2 rounded-lg"
                          onClick={() => removeScheduleItem(index)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {isEditing && (
                  <div className="relative flex flex-col gap-4 p-6 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50">
                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Activity
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="Time (e.g. 10:00 AM)"
                        value={newScheduleItem.time}
                        onChange={e => setNewScheduleItem(prev => ({ ...prev, time: e.target.value }))}
                        className="rounded-xl border-slate-200"
                      />
                      <Input
                        placeholder="Activity Title"
                        value={newScheduleItem.activityTitle}
                        onChange={e => setNewScheduleItem(prev => ({ ...prev, activityTitle: e.target.value }))}
                        className="rounded-xl border-slate-200"
                      />
                    </div>
                    <Textarea
                      placeholder="Activity Description"
                      value={newScheduleItem.activityDescription}
                      onChange={e => setNewScheduleItem(prev => ({ ...prev, activityDescription: e.target.value }))}
                      className="rounded-xl border-slate-200 min-h-[80px]"
                    />
                    <Input
                      placeholder="Responsible Person (Optional)"
                      value={newScheduleItem.responsiblePerson}
                      onChange={e => setNewScheduleItem(prev => ({ ...prev, responsiblePerson: e.target.value }))}
                      className="rounded-xl border-slate-200"
                    />
                    <Button onClick={addScheduleItem} className="w-full rounded-xl bg-accent hover:bg-accent/90">
                      Add to Schedule
                    </Button>
                  </div>
                )}

                {(!event.schedule || event.schedule.length === 0) && !isEditing && (
                  <div className="text-center py-12 text-slate-400">
                    <p className="italic">No schedule items have been added yet.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Bar (When Editing) */}
      {isEditing && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-xl border border-slate-200 p-2 rounded-2xl shadow-2xl flex gap-2 z-50 animate-in slide-in-from-bottom-8 duration-300">
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-8">
            <Check className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
          <Button variant="ghost" onClick={() => { setIsEditing(false); setEditData(event); }} className="rounded-xl">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
