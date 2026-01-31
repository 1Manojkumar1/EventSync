import Link from "next/link";
import { Calendar, MapPin, Users } from "lucide-react";
import { Event } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EventCardProps {
  event: Event;
  action?: React.ReactNode;
  badge?: React.ReactNode;
}

export function EventCard({ event, action, badge }: EventCardProps) {
  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow relative">
      {badge && <div className="absolute top-4 right-4 z-10">{badge}</div>}
      <CardHeader>
        <CardTitle className="text-xl line-clamp-1 pr-16">{event.title}</CardTitle>
        <div className="flex items-center text-sm text-muted-foreground gap-2">
          <Calendar className="h-4 w-4" />
          {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {event.endDate && (
            <>
              {" - "}
              {new Date(event.endDate).toLocaleDateString() === new Date(event.date).toLocaleDateString()
                ? new Date(event.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : `${new Date(event.endDate).toLocaleDateString()} at ${new Date(event.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              }
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded-md mb-4 line-clamp-2">
          {event.description}
        </p>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span>{(event.attendeeIds || []).length} / {event.maxAttendees} attendees</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="mt-auto pt-4 flex flex-col gap-2">
        <Link href={`/events/${event.id}`} className="w-full">
          <Button variant="outline" className="w-full">View Details</Button>
        </Link>
        {action}
      </CardFooter>
    </Card>
  );
}
