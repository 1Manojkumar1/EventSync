import { Event } from "@/lib/types";
import { EventCard } from "./event-card";

interface EventListProps {
    events: Event[];
    renderAction?: (event: Event) => React.ReactNode;
    renderBadge?: (event: Event) => React.ReactNode;
    emptyMessage?: string;
}

export function EventList({ events, renderAction, renderBadge, emptyMessage = "No events found." }: EventListProps) {
    if (events.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border rounded-lg bg-muted/10 border-dashed">
                <p className="text-muted-foreground">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
                <EventCard
                    key={event.id}
                    event={event}
                    action={renderAction ? renderAction(event) : undefined}
                    badge={renderBadge ? renderBadge(event) : undefined}
                />
            ))}
        </div>
    );
}
