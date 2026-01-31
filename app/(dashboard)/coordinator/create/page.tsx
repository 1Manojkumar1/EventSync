"use client";

import { useRouter } from "next/navigation";
import { EventForm } from "@/components/events/event-form";
import { dataService } from "@/lib/store";
import { useAuth } from "@/context/auth-context";
import { EventFormData } from "@/lib/types";

export default function CreateEventPage() {
  const router = useRouter();
  const { user } = useAuth();

  const handleSubmit = async (data: EventFormData) => {
    if (!user) return;
    try {
      await dataService.createEvent(data, user.id);
      router.push("/coordinator/my-events");
      // toast.success("Event created successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to create event");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Event</h1>
        <p className="text-muted-foreground">Fill in the details to schedule a new campus event.</p>
      </div>
      <EventForm onSubmit={handleSubmit} buttonText="Create Event" />
    </div>
  );
}
