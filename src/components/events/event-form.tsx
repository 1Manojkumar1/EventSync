"use client";

import { useState } from "react";
import { EventFormData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label"; // Removed missing import
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Component-local simple Label since I didn't verify if I have one
const LabelLocal = ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
    <label htmlFor={htmlFor} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {children}
    </label>
);

interface EventFormProps {
    initialData?: EventFormData;
    onSubmit: (data: EventFormData) => void;
    isLoading?: boolean;
    buttonText?: string;
}

export function EventForm({ initialData, onSubmit, isLoading, buttonText = "Submit" }: EventFormProps) {
    const [formData, setFormData] = useState<EventFormData>({
        title: initialData?.title || "",
        description: initialData?.description || "",
        date: initialData?.date ? new Date(initialData.date).toLocaleString('sv-SE').replace(' ', 'T').slice(0, 16) : "",
        endDate: initialData?.endDate ? new Date(initialData.endDate).toLocaleString('sv-SE').replace(' ', 'T').slice(0, 16) : "",
        location: initialData?.location || "",
        maxAttendees: initialData?.maxAttendees || 50,
        category: initialData?.category || "tech",
        registrationStartDate: initialData?.registrationStartDate ? new Date(initialData.registrationStartDate).toLocaleString('sv-SE').replace(' ', 'T').slice(0, 16) : "",
        registrationEndDate: initialData?.registrationEndDate ? new Date(initialData.registrationEndDate).toLocaleString('sv-SE').replace(' ', 'T').slice(0, 16) : "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (new Date(formData.endDate) <= new Date(formData.date)) {
            alert("Event end date must be after the start date");
            return;
        }

        if (formData.registrationStartDate && formData.registrationEndDate) {
            if (new Date(formData.registrationEndDate) <= new Date(formData.registrationStartDate)) {
                alert("Registration end date must be after the registration start date");
                return;
            }
            if (new Date(formData.registrationEndDate) > new Date(formData.date)) {
                alert("Registration must end before the event starts");
                return;
            }
        }

        onSubmit({
            ...formData,
            maxAttendees: Number(formData.maxAttendees),
            date: new Date(formData.date).toISOString(),
            endDate: new Date(formData.endDate).toISOString(),
            registrationStartDate: formData.registrationStartDate ? new Date(formData.registrationStartDate).toISOString() : undefined,
            registrationEndDate: formData.registrationEndDate ? new Date(formData.registrationEndDate).toISOString() : undefined,
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <LabelLocal htmlFor="title">Event Title</LabelLocal>
                        <Input id="title" name="title" required value={formData.title} onChange={handleChange} placeholder="e.g. Annual Science Fair" />
                    </div>

                    <div className="space-y-2">
                        <LabelLocal htmlFor="description">Description</LabelLocal>
                        <Input id="description" name="description" required value={formData.description} onChange={handleChange} placeholder="Brief details about the event" />
                    </div>

                    <div className="space-y-2">
                        <LabelLocal htmlFor="category">Event Category</LabelLocal>
                        <select 
                            id="category" 
                            name="category" 
                            required 
                            value={formData.category} 
                            onChange={handleChange}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="tech">🖥️ Technology</option>
                            <option value="cultural">🎭 Cultural</option>
                            <option value="sports">⚽ Sports</option>
                            <option value="academic">📚 Academic</option>
                            <option value="arts">🎨 Arts & Design</option>
                            <option value="music">🎵 Music</option>
                            <option value="gaming">🎮 Gaming & Esports</option>
                            <option value="social">🤝 Social & Networking</option>
                            <option value="career">💼 Career & Professional</option>
                            <option value="health">🧘 Health & Wellness</option>
                            <option value="volunteering">🌍 Community Service</option>
                            <option value="innovation">💡 Entrepreneurship</option>
                            <option value="environment">🌱 Sustainability</option>
                            <option value="literature">📖 Literature & Writing</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <LabelLocal htmlFor="date">Start Date & Time</LabelLocal>
                            <Input id="date" name="date" type="datetime-local" required value={formData.date} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <LabelLocal htmlFor="endDate">End Date & Time</LabelLocal>
                            <Input id="endDate" name="endDate" type="datetime-local" required value={formData.endDate} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <LabelLocal htmlFor="registrationStartDate">Registration Starts</LabelLocal>
                            <Input id="registrationStartDate" name="registrationStartDate" type="datetime-local" value={formData.registrationStartDate} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <LabelLocal htmlFor="registrationEndDate">Registration Ends</LabelLocal>
                            <Input id="registrationEndDate" name="registrationEndDate" type="datetime-local" value={formData.registrationEndDate} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <LabelLocal htmlFor="location">Location</LabelLocal>
                            <Input id="location" name="location" required value={formData.location} onChange={handleChange} placeholder="e.g. Main Auditorium" />
                        </div>
                        <div className="space-y-2">
                            <LabelLocal htmlFor="maxAttendees">Max Attendees</LabelLocal>
                            <Input id="maxAttendees" name="maxAttendees" type="number" min="1" required value={formData.maxAttendees} onChange={handleChange} />
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : buttonText}</Button>
                </CardFooter>
            </Card>
        </form>
    );
}
