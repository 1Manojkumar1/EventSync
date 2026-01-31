"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, ChevronRight, ChevronLeft, Sparkles, Wrench, Users, Briefcase } from "lucide-react";
import { VolunteerType, ExperienceLevel } from "@/lib/types";

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

const ROLE_OPTIONS = [
    { id: "attendee", label: "Attendee", description: "I want to attend events", icon: Users },
    { id: "volunteer", label: "Volunteer", description: "I want to help organize", icon: Wrench },
    { id: "organizer", label: "Organizer", description: "I want to create events", icon: Briefcase },
    { id: "speaker", label: "Speaker", description: "I want to present at events", icon: Users },
    { id: "competitor", label: "Competitor", description: "I want to compete in events", icon: Users },
];

const VOLUNTEER_TYPE_OPTIONS: { id: VolunteerType; label: string; description: string }[] = [
    { id: "technical", label: "Technical", description: "Audio/Visual, IT, Stage setup" },
    { id: "non-technical", label: "Non-Technical", description: "Registration, Hospitality, Logistics" },
    { id: "both", label: "Both", description: "I can help with anything" },
];

const EXPERIENCE_OPTIONS: { id: ExperienceLevel; label: string; description: string }[] = [
    { id: "beginner", label: "Beginner", description: "New to volunteering" },
    { id: "intermediate", label: "Intermediate", description: "Some event experience" },
    { id: "expert", label: "Expert", description: "Experienced volunteer" },
];

const AVAILABILITY_OPTIONS = [
    { id: "weekdays", label: "Weekdays" },
    { id: "weekends", label: "Weekends" },
    { id: "mornings", label: "Mornings" },
    { id: "evenings", label: "Evenings" },
    { id: "full-day", label: "Full Day Events" },
];

export default function OnboardingPage() {
    const { user, updateUser } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState(1);
    
    // Step 1: Interests
    const [interests, setInterests] = useState<string[]>([]);
    
    // Step 2: Participation Role
    const [participationRole, setParticipationRole] = useState("");
    
    // Step 3: Skills (for volunteers/tech)
    const [skills, setSkills] = useState("");
    
    // Step 4: Volunteer Profile (only if volunteer selected)
    const [volunteerType, setVolunteerType] = useState<VolunteerType | "">("");
    const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | "">("");
    const [availability, setAvailability] = useState<string[]>([]);

    useEffect(() => {
        if (!user) {
            router.push("/login");
        }
    }, [user, router]);

    const toggleInterest = (id: string) => {
        setInterests(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleAvailability = (id: string) => {
        setAvailability(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const isVolunteer = participationRole === "volunteer";
    const showSkillsStep = isVolunteer || interests.includes("tech");
    const showVolunteerStep = isVolunteer;

    // Calculate total steps dynamically
    let totalSteps = 2; // Interests + Role
    if (showSkillsStep) totalSteps++;
    if (showVolunteerStep) totalSteps++;

    const handleComplete = async () => {
        const updateData: any = {
            interests,
            participationRole,
            skills: skills.split(",").map(s => s.trim()).filter(Boolean),
            onboardingComplete: true,
        };

        if (isVolunteer && volunteerType && experienceLevel) {
            updateData.isVolunteer = true;
            updateData.volunteerProfile = {
                type: volunteerType,
                skills: skills.split(",").map(s => s.trim()).filter(Boolean),
                experienceLevel,
                availability,
            };
            updateData.volunteerScores = {
                reliability: 50,
                skillUsage: 50,
                feedback: 50,
                impact: 50,
                overall: 50,
            };
            updateData.volunteerHistory = {
                eventsParticipated: 0,
                totalHours: 0,
                lastActive: new Date().toISOString(),
            };
        }

        await updateUser(updateData);
        router.push(isVolunteer ? "/volunteer-inbox" : "/events");
    };

    // Determine current step content
    const getStepNumber = () => {
        if (step <= 2) return step;
        if (showSkillsStep && step === 3) return 3;
        if (showVolunteerStep) {
            if (showSkillsStep) return step;
            return step + 1;
        }
        return step;
    };

    const canProceed = () => {
        if (step === 1) return interests.length > 0;
        if (step === 2) return !!participationRole;
        if (step === 3 && showSkillsStep) return skills.length > 0;
        if ((step === 4 && showVolunteerStep) || (step === 3 && showVolunteerStep && !showSkillsStep)) {
            return volunteerType && experienceLevel;
        }
        return true;
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-card rounded-2xl shadow-2xl border overflow-hidden">
                {/* Progress Bar */}
                <div className="h-2 bg-muted">
                    <div
                        className="h-full bg-accent transition-all duration-500 ease-out"
                        style={{ width: `${(step / totalSteps) * 100}%` }}
                    />
                </div>

                <div className="p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                            <Sparkles className="h-4 w-4" />
                            {isVolunteer ? "Volunteer Registration" : "Personalize Your Experience"}
                        </div>
                        <h1 className="text-2xl font-bold">Welcome, {user.name}!</h1>
                        <p className="text-muted-foreground mt-1">
                            {step === 1 && "What kind of events interest you?"}
                            {step === 2 && "How would you like to participate?"}
                            {step === 3 && showSkillsStep && "What skills can you contribute?"}
                            {((step === 4 && showVolunteerStep) || (step === 3 && showVolunteerStep && !showSkillsStep)) && 
                                "Tell us more about your volunteer preferences"}
                        </p>
                    </div>

                    {/* Step 1: Interests */}
                    {step === 1 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {INTEREST_OPTIONS.map(option => (
                                <button
                                    key={option.id}
                                    onClick={() => toggleInterest(option.id)}
                                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${interests.includes(option.id)
                                        ? `${option.color} border-current shadow-md scale-[1.02]`
                                        : "bg-card border-border hover:border-muted-foreground/50"
                                        }`}
                                >
                                    <span className="text-lg font-medium">{option.label}</span>
                                    {interests.includes(option.id) && (
                                        <Check className="h-5 w-5 mt-2 text-current" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Step 2: Participation Role */}
                    {step === 2 && (
                        <div className="space-y-3">
                            {ROLE_OPTIONS.map(option => (
                                <button
                                    key={option.id}
                                    onClick={() => setParticipationRole(option.id)}
                                    className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center justify-between ${participationRole === option.id
                                        ? "bg-accent/10 border-accent text-accent-foreground shadow-md"
                                        : "bg-card border-border hover:border-muted-foreground/50"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <option.icon className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <div className="font-semibold">{option.label}</div>
                                            <div className="text-sm text-muted-foreground">{option.description}</div>
                                        </div>
                                    </div>
                                    {participationRole === option.id && <Check className="h-5 w-5 text-accent" />}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Step 3: Skills */}
                    {step === 3 && showSkillsStep && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="skills" className="text-base">Your Skills (comma-separated)</Label>
                                <Input
                                    id="skills"
                                    placeholder="e.g., Python, Event Management, Public Speaking"
                                    value={skills}
                                    onChange={e => setSkills(e.target.value)}
                                    className="text-lg p-6"
                                />
                                <p className="text-sm text-muted-foreground">
                                    These help us match you with relevant opportunities.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Volunteer Profile (only for volunteers) */}
                    {((step === 4 && showVolunteerStep && showSkillsStep) || 
                      (step === 3 && showVolunteerStep && !showSkillsStep)) && (
                        <div className="space-y-6">
                            {/* Volunteer Type */}
                            <div>
                                <Label className="text-base mb-3 block">Volunteer Type</Label>
                                <div className="grid grid-cols-3 gap-3">
                                    {VOLUNTEER_TYPE_OPTIONS.map(option => (
                                        <button
                                            key={option.id}
                                            onClick={() => setVolunteerType(option.id)}
                                            className={`p-4 rounded-xl border-2 text-center transition-all ${
                                                volunteerType === option.id
                                                    ? "bg-accent/10 border-accent"
                                                    : "bg-card border-border hover:border-muted-foreground/50"
                                            }`}
                                        >
                                            <div className="font-semibold text-sm">{option.label}</div>
                                            <div className="text-xs text-muted-foreground mt-1">{option.description}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Experience Level */}
                            <div>
                                <Label className="text-base mb-3 block">Experience Level</Label>
                                <div className="grid grid-cols-3 gap-3">
                                    {EXPERIENCE_OPTIONS.map(option => (
                                        <button
                                            key={option.id}
                                            onClick={() => setExperienceLevel(option.id)}
                                            className={`p-4 rounded-xl border-2 text-center transition-all ${
                                                experienceLevel === option.id
                                                    ? "bg-accent/10 border-accent"
                                                    : "bg-card border-border hover:border-muted-foreground/50"
                                            }`}
                                        >
                                            <div className="font-semibold text-sm">{option.label}</div>
                                            <div className="text-xs text-muted-foreground mt-1">{option.description}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Availability */}
                            <div>
                                <Label className="text-base mb-3 block">Availability (select all that apply)</Label>
                                <div className="flex flex-wrap gap-2">
                                    {AVAILABILITY_OPTIONS.map(option => (
                                        <button
                                            key={option.id}
                                            onClick={() => toggleAvailability(option.id)}
                                            className={`px-4 py-2 rounded-full border-2 text-sm transition-all ${
                                                availability.includes(option.id)
                                                    ? "bg-accent text-accent-foreground border-accent"
                                                    : "bg-card border-border hover:border-muted-foreground/50"
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between mt-10">
                        <Button
                            onClick={() => setStep(s => s - 1)}
                            disabled={step === 1}
                            className="gap-1 bg-transparent text-foreground hover:bg-muted"
                        >
                            <ChevronLeft className="h-4 w-4" /> Back
                        </Button>

                        {step < totalSteps ? (
                            <Button
                                onClick={() => setStep(s => s + 1)}
                                disabled={!canProceed()}
                                className="gap-1"
                            >
                                Next <ChevronRight className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button 
                                onClick={handleComplete} 
                                disabled={!canProceed()}
                                className="gap-1 bg-accent hover:bg-accent/90"
                            >
                                Get Started <Sparkles className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
