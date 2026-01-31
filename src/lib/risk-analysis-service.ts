import { Event, VolunteerPoll } from "./types";

export interface RiskAnalysis {
    score: number; // 0 (Safe) to 100 (Critical)
    level: 'low' | 'medium' | 'high';
    signals: string[];
    recommendations: string[];
}

export class RiskAnalysisService {
    /**
     * Evaluates the failure risk for a specific event
     */
    static calculateRisk(
        event: Event,
        allEvents: Event[],
        volunteerPoll?: VolunteerPoll
    ): RiskAnalysis {
        let score = 0;
        const signals: string[] = [];
        const recommendations: string[] = [];

        const now = new Date();
        const eventDate = new Date(event.date);
        const creationDate = new Date(event.createdAt);

        // Time metrics
        const totalDays = (eventDate.getTime() - creationDate.getTime()) / (1000 * 3600 * 24);
        const daysRemaining = (eventDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
        const progressPercent = Math.max(0, Math.min(100, (1 - daysRemaining / totalDays) * 100));

        // 1. Registration Signal
        const registrationRate = (event.attendeeIds.length / event.maxAttendees) * 100;

        if (daysRemaining > 0) {
            // Expect registration rate to at least match progress percentage
            if (registrationRate < progressPercent * 0.5) {
                score += 40;
                signals.push("Critically low registration growth relative to event date");
                recommendations.push("Boost promotion targeting specific student groups");
                recommendations.push("Consider extending registration deadline");
            } else if (registrationRate < progressPercent * 0.8) {
                score += 20;
                signals.push("Registration trailing behind targets");
                recommendations.push("Increase social media engagement");
            }
        }

        // 2. Competition Signal
        const sameDayEvents = allEvents.filter(e => {
            if (e.id === event.id) return false;
            const d1 = new Date(e.date).toDateString();
            const d2 = eventDate.toDateString();
            return d1 === d2;
        });

        const strongerCompetitors = sameDayEvents.filter(e => e.attendeeIds.length > event.attendeeIds.length * 1.5);
        if (strongerCompetitors.length > 0) {
            score += 25;
            signals.push(`Competing with ${strongerCompetitors.length} high-popularity event(s) on the same day`);
            recommendations.push("Consider rescheduling to avoid heavy competition");
            recommendations.push("Collaborate or merge with similar high-popularity events");
        }

        // 3. Volunteer Signal
        if (volunteerPoll) {
            const unfilledRatio = (poll: VolunteerPoll) => {
                const accepted = poll.respondedVolunteers.length;
                return (poll.volunteerCount - accepted) / poll.volunteerCount;
            };

            if (volunteerPoll.status !== 'filled' && unfilledRatio(volunteerPoll) > 0.5 && daysRemaining < 7) {
                score += 30;
                signals.push("Critical shortage of volunteers with less than a week remaining");
                recommendations.push("Change event format to require fewer staff");
                recommendations.push("Incentivize volunteering with additional credits/benefits");
            } else if (volunteerPoll.status === 'open' && unfilledRatio(volunteerPoll) > 0.2) {
                score += 10;
                signals.push("Volunteer recruitment slower than expected");
            }
        }

        // Cap score at 100
        score = Math.min(100, score);

        // Determine level
        let level: RiskAnalysis['level'] = 'low';
        if (score >= 70) level = 'high';
        else if (score >= 30) level = 'medium';

        // Default recommendation for low score
        if (recommendations.length === 0) {
            recommendations.push("Maintain current promotion strategy");
            recommendations.push("Monitor registration trends daily");
        }

        return {
            score,
            level,
            signals,
            recommendations: Array.from(new Set(recommendations)) // Unique recommendations
        };
    }
}
