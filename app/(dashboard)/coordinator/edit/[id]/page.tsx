"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { EventForm } from "@/components/events/event-form";
import { dataService } from "@/lib/store";
import { useAuth } from "@/context/auth-context";
import { EventFormData } from "@/lib/types";

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user } = useAuth();
  const [initialData, setInitialData] = useState<EventFormData | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  
  // Unwrap params using React.use() as per Next.js 15
  const { id } = use(params);

  useEffect(() => {
    const fetchEvent = async () => {
        if (!user) return;
        const event = await dataService.getEventById(id);
        if (event) {
            if (event.organizerId !== user.id && user.role !== 'admin') {
                alert("Unauthorized");
                router.push("/coordinator/my-events");
                return;
            }
            setInitialData({
                title: event.title,
                description: event.description,
                date: event.date,
                endDate: event.endDate || event.date, // Fallback to start date if missing
                location: event.location,
                maxAttendees: event.maxAttendees
            });
        } else {
            alert("Event not found");
            router.push("/coordinator/my-events");
        }
        setIsLoading(false);
    };
    fetchEvent();
  }, [id, user, router]);

  const handleSubmit = async (data: EventFormData) => {
    try {
      await dataService.updateEvent(id, data);
      router.push("/coordinator/my-events");
    } catch (error) {
      console.error(error);
      alert("Failed to update event");
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!initialData) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Event</h1>
        <p className="text-muted-foreground">Update event details.</p>
      </div>
      <EventForm onSubmit={handleSubmit} initialData={initialData} buttonText="Update Event" />
    </div>
  );
}
