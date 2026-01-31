import { dataService } from "./store";
import { Event, CheckIn, EventReview, ChatMessage, User } from "./types";
import { startOfDay, parseISO, format, eachHourOfInterval, startOfHour, endOfHour, isWithinInterval } from "date-fns";

export interface DashboardStats {
    totalEvents: number;
    totalAttendees: number;
    averageSuccessScore: number;
    activeVolunteers: number;
}

export interface EventSuccessData {
    name: string;
    score: number;
    attendance: number;
    feedback: number;
}

export interface AttendanceTrend {
    date: string;
    predicted: number;
    actual: number;
}

export interface HeatmapData {
    hour: string;
    activity: number;
}

export interface InterestStats {
    subject: string;
    count: number;
    fullMark: number;
}

class AnalyticsService {
    async getDashboardStats(): Promise<DashboardStats> {
        const events = await dataService.getEvents();
        const users = await dataService.getAllUsers();

        const totalEvents = events.length;
        const totalAttendees = events.reduce((acc, e) => acc + (e.attendeeIds?.length || 0), 0);
        const activeVolunteers = users.filter(u => u.isVolunteer).length;

        // Calculate average success score across all events
        let totalScore = 0;
        for (const event of events) {
            totalScore += await this.calculateEventSuccessScore(event);
        }
        const averageSuccessScore = totalEvents > 0 ? totalScore / totalEvents : 0;

        return {
            totalEvents,
            totalAttendees,
            averageSuccessScore,
            activeVolunteers
        };
    }

    async calculateEventSuccessScore(event: Event): Promise<number> {
        const checkIns = await dataService.getCheckInsByEvent(event.id);
        const reviews = await dataService.getReviewsByEvent(event.id);

        // 1. Attendance Rate (40%)
        const attendanceRate = event.maxAttendees > 0
            ? (checkIns.filter(c => c.status === 'present').length / event.maxAttendees) * 100
            : 0;

        // 2. Feedback Score (40%)
        const avgRating = reviews.length > 0
            ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
            : 0;
        const feedbackScore = (avgRating / 5) * 100;

        // 3. Engagement (20%) - Based on check-in ratio vs registrations
        const registrationEngagement = event.attendeeIds.length > 0
            ? (checkIns.length / event.attendeeIds.length) * 100
            : 0;

        const finalScore = (attendanceRate * 0.4) + (feedbackScore * 0.4) + (registrationEngagement * 0.2);
        return Math.min(Math.round(finalScore), 100);
    }

    async getTopEventsSuccess(): Promise<EventSuccessData[]> {
        const events = await dataService.getEvents();
        const eventData: EventSuccessData[] = [];

        // Get top 6 events by score
        for (const event of events.slice(0, 10)) {
            const score = await this.calculateEventSuccessScore(event);
            const checkIns = await dataService.getCheckInsByEvent(event.id);
            const reviews = await dataService.getReviewsByEvent(event.id);
            const avgRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;

            eventData.push({
                name: event.title,
                score,
                attendance: checkIns.filter(c => c.status === 'present').length,
                feedback: parseFloat(avgRating.toFixed(1))
            });
        }

        return eventData.sort((a, b) => b.score - a.score).slice(0, 6);
    }

    async getAttendanceTrend(): Promise<AttendanceTrend[]> {
        const events = await dataService.getEvents();
        // Simplified: aggregate by month/date of recently completed events
        const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-7);

        const trends: AttendanceTrend[] = [];
        for (const event of sortedEvents) {
            const checkIns = await dataService.getCheckInsByEvent(event.id);
            trends.push({
                date: format(parseISO(event.date), 'MMM dd'),
                predicted: event.attendeeIds.length,
                actual: checkIns.filter(c => c.status === 'present').length
            });
        }
        return trends;
    }

    async getEngagementHeatmap(): Promise<HeatmapData[]> {
        // Generate dummy engagement data based on 24 hours
        const hours = eachHourOfInterval({
            start: startOfDay(new Date()),
            end: new Date(startOfDay(new Date()).getTime() + 23 * 3600000)
        });

        return hours.map(h => ({
            hour: format(h, 'HH:mm'),
            activity: Math.floor(Math.random() * 100) // Dummy data for now as we don't track live duration yet
        }));
    }

    async getInterestEngagement(): Promise<InterestStats[]> {
        const users = await dataService.getAllUsers();
        const categories: Record<string, number> = {};

        users.forEach(u => {
            u.interests?.forEach(interest => {
                categories[interest] = (categories[interest] || 0) + 1;
            });
        });

        return Object.entries(categories).map(([subject, count]) => ({
            subject: subject.charAt(0).toUpperCase() + subject.slice(1),
            count,
            fullMark: Math.max(...Object.values(categories)) + 2
        })).slice(0, 6);
    }
}

export const analyticsService = new AnalyticsService();
