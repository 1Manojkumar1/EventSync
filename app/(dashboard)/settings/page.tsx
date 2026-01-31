"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, Sparkles, Settings as SettingsIcon } from "lucide-react";

const INTEREST_OPTIONS = [
    { id: "tech", label: "🖥️ Technology", color: "bg-blue-100 border-blue-500 text-blue-700" },
    { id: "cultural", label: "🎭 Cultural", color: "bg-purple-100 border-purple-500 text-purple-700" },
    { id: "sports", label: "⚽ Sports", color: "bg-green-100 border-green-500 text-green-700" },
    { id: "academic", label: "📚 Academic", color: "bg-yellow-100 border-yellow-500 text-yellow-700" },
    { id: "arts", label: "🎨 Arts & Design", color: "bg-pink-100 border-pink-500 text-pink-700" },
    { id: "music", label: "🎵 Music", color: "bg-indigo-100 border-indigo-500 text-indigo-700" },
    { id: "gaming", label: "🎮 Gaming & Esports", color: "bg-red-100 border-red-500 text-red-700" },
    { id: "social", label: "🤝 Social & Networking", color: "bg-orange-100 border-orange-500 text-orange-700" },
    { id: "career", label: "💼 Career & Professional", color: "bg-slate-100 border-slate-500 text-slate-700" },
    { id: "health", label: "🧘 Health & Wellness", color: "bg-emerald-100 border-emerald-500 text-emerald-700" },
    { id: "volunteering", label: "🌍 Community Service", color: "bg-cyan-100 border-cyan-500 text-cyan-700" },
    { id: "innovation", label: "💡 Entrepreneurship", color: "bg-amber-100 border-amber-500 text-amber-700" },
    { id: "environment", label: "🌱 Sustainability", color: "bg-lime-100 border-lime-500 text-lime-700" },
    { id: "literature", label: "📖 Literature & Writing", color: "bg-stone-100 border-stone-500 text-stone-700" },
];

export default function SettingsPage() {
    const { user, updateUser } = useAuth();
    const [interests, setInterests] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

    useEffect(() => {
        if (user?.interests) {
            setInterests(user.interests);
        }
    }, [user]);

    const toggleInterest = (id: string) => {
        setInterests(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
        setSaveStatus('idle');
    };

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            await updateUser({ interests });
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (error) {
            console.error("Failed to update interests:", error);
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
                    <p className="text-muted-foreground mt-1">Manage your preferences and personalized experience.</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <SettingsIcon className="h-6 w-6" />
                </div>
            </div>

            <Card className="rounded-3xl border-slate-200/60 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <CardTitle className="text-xl">Your Interests</CardTitle>
                    </div>
                    <CardDescription className="text-base">
                        Select topics you're interested in to get better event recommendations.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {INTEREST_OPTIONS.map(option => (
                            <button
                                key={option.id}
                                onClick={() => toggleInterest(option.id)}
                                className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 relative group ${interests.includes(option.id)
                                        ? `${option.color} border-current shadow-md scale-[1.02]`
                                        : "bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                                    }`}
                            >
                                <span className="text-lg font-bold block mb-1">{option.label}</span>
                                <span className="text-xs opacity-70">
                                    {interests.includes(option.id) ? "Selected" : "Click to select"}
                                </span>
                                {interests.includes(option.id) && (
                                    <div className="absolute top-4 right-4 animate-in zoom-in duration-300">
                                        <Check className="h-5 w-5 text-current" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="mt-12 flex items-center justify-end gap-4 border-t border-slate-100 pt-8">
                        {saveStatus === 'success' && (
                            <p className="text-green-600 font-medium flex items-center gap-2 animate-in fade-in duration-300">
                                <Check className="h-4 w-4" />
                                Preferences updated!
                            </p>
                        )}
                        {saveStatus === 'error' && (
                            <p className="text-red-500 font-medium animate-in shake duration-300">
                                Failed to save changes.
                            </p>
                        )}
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-accent hover:bg-accent/90 text-white px-8 rounded-xl h-11"
                        >
                            {isSaving ? "Saving..." : "Save Preferences"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-3xl border-slate-200/60 shadow-sm opacity-60">
                <CardHeader className="p-8">
                    <CardTitle className="text-lg">Notification Preferences</CardTitle>
                    <CardDescription>Coming soon: Manage how you receive event updates.</CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
}
