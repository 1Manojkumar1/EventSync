import { db } from "./firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit
} from "firebase/firestore";
import {
  User,
  VolunteerPoll,
  VolunteerFeedback,
  VolunteerScores,
  ExperienceLevel
} from "./types";
import { firestoreService } from "./firestore";

const POLLS_COLLECTION = "volunteerPolls";
const FEEDBACK_COLLECTION = "volunteerFeedback";
const USERS_COLLECTION = "users";

// Scoring weights
const WEIGHTS = {
  participation: 0.25,
  reliability: 0.30,
  feedback: 0.25,
  skillMatch: 0.20,
};

export class VolunteerService {
  // ==================== POLLS ====================

  async createPoll(pollData: Omit<VolunteerPoll, 'id'>): Promise<VolunteerPoll> {
    // Find matching volunteers
    const matchedVolunteers = await this.findMatchingVolunteers(
      pollData.skillsRequired,
      pollData.experienceLevel
    );

    const pollWithMatches = {
      ...pollData,
      matchedVolunteers: matchedVolunteers.map(v => v.id),
    };

    const docRef = await addDoc(collection(db, POLLS_COLLECTION), pollWithMatches);
    return { id: docRef.id, ...pollWithMatches };
  }

  async getPollById(id: string): Promise<VolunteerPoll | undefined> {
    const docRef = doc(db, POLLS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as VolunteerPoll;
    }
    return undefined;
  }

  async getPollsByEvent(eventId: string): Promise<VolunteerPoll[]> {
    const q = query(collection(db, POLLS_COLLECTION), where("eventId", "==", eventId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VolunteerPoll));
  }

  async getPollsByOrganizer(organizerId: string): Promise<VolunteerPoll[]> {
    const q = query(
      collection(db, POLLS_COLLECTION),
      where("createdBy", "==", organizerId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VolunteerPoll));
  }

  async getPollsForVolunteer(userId: string): Promise<VolunteerPoll[]> {
    const q = query(
      collection(db, POLLS_COLLECTION),
      where("matchedVolunteers", "array-contains", userId),
      where("status", "==", "open")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VolunteerPoll));
  }

  async getAllOpenPolls(): Promise<VolunteerPoll[]> {
    const q = query(
      collection(db, POLLS_COLLECTION),
      where("status", "==", "open")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VolunteerPoll));
  }

  async respondToPoll(pollId: string, userId: string, accept: boolean): Promise<void> {
    const poll = await this.getPollById(pollId);
    if (!poll) throw new Error("Poll not found");

    const updates: Partial<VolunteerPoll> = {};

    if (accept) {
      updates.respondedVolunteers = [...poll.respondedVolunteers, userId];
      // Check if poll is now filled
      if (updates.respondedVolunteers.length >= poll.volunteerCount) {
        updates.status = 'filled';
      }
    } else {
      updates.declinedVolunteers = [...poll.declinedVolunteers, userId];
    }

    await updateDoc(doc(db, POLLS_COLLECTION, pollId), updates);
  }

  async updatePollStatus(pollId: string, status: 'open' | 'closed' | 'filled'): Promise<void> {
    await updateDoc(doc(db, POLLS_COLLECTION, pollId), { status });
  }

  // ==================== MATCHING ====================

  async findMatchingVolunteers(
    skillsRequired: string[],
    experienceLevel: ExperienceLevel | 'any'
  ): Promise<User[]> {
    // Get all volunteers
    const allUsers = await firestoreService.getAllUsers();
    const volunteers = allUsers.filter(u => u.isVolunteer && u.volunteerProfile);

    // Filter by skills and experience
    return volunteers.filter(v => {
      const profile = v.volunteerProfile!;

      // Check experience level
      if (experienceLevel !== 'any') {
        const levels = ['beginner', 'intermediate', 'expert'];
        const requiredIndex = levels.indexOf(experienceLevel);
        const userIndex = levels.indexOf(profile.experienceLevel);
        if (userIndex < requiredIndex) return false;
      }

      // Check skills (at least one matching skill)
      if (skillsRequired.length > 0) {
        const hasMatchingSkill = skillsRequired.some(skill =>
          profile.skills.map(s => s.toLowerCase()).includes(skill.toLowerCase())
        );
        if (!hasMatchingSkill) return false;
      }

      return true;
    });
  }

  async getVolunteerLeaderboard(limit_count: number = 10): Promise<User[]> {
    const allUsers = await firestoreService.getAllUsers();
    const volunteers = allUsers.filter(u => u.isVolunteer && u.volunteerScores);

    // Sort by overall score
    return volunteers
      .sort((a, b) => (b.volunteerScores?.overall || 0) - (a.volunteerScores?.overall || 0))
      .slice(0, limit_count);
  }

  // ==================== FEEDBACK ====================

  async submitFeedback(feedback: Omit<VolunteerFeedback, 'id'>): Promise<VolunteerFeedback> {
    const docRef = await addDoc(collection(db, FEEDBACK_COLLECTION), feedback);

    // Recalculate volunteer scores
    await this.recalculateScores(feedback.volunteerId);

    return { id: docRef.id, ...feedback };
  }

  async getFeedbackForVolunteer(volunteerId: string): Promise<VolunteerFeedback[]> {
    const q = query(
      collection(db, FEEDBACK_COLLECTION),
      where("volunteerId", "==", volunteerId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VolunteerFeedback));
  }

  // ==================== SCORING ====================

  async recalculateScores(volunteerId: string): Promise<VolunteerScores> {
    const user = await firestoreService.getUserById(volunteerId);
    if (!user) throw new Error("User not found");

    // Get feedback
    const feedbacks = await this.getFeedbackForVolunteer(volunteerId);

    // Calculate feedback score (average rating * 20 to get 0-100)
    const feedbackScore = feedbacks.length > 0
      ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length) * 20
      : 50; // Default score

    // Get participation data
    const history = user.volunteerHistory || { eventsParticipated: 0, totalHours: 0, lastActive: '' };

    // Calculate reliability (based on acceptance rate and history)
    const reliabilityScore = Math.min(100, 50 + (history.eventsParticipated * 5));

    // Skill usage score (placeholder - would need more data)
    const skillUsageScore = user.volunteerProfile?.skills?.length
      ? Math.min(100, user.volunteerProfile.skills.length * 15 + 40)
      : 50;

    // Impact score (based on hours contributed)
    const impactScore = Math.min(100, 40 + (history.totalHours * 2));

    // Calculate overall score
    const overall = Math.round(
      (reliabilityScore * WEIGHTS.reliability) +
      (feedbackScore * WEIGHTS.feedback) +
      (skillUsageScore * WEIGHTS.skillMatch) +
      (history.eventsParticipated * WEIGHTS.participation * 10)
    );

    const scores: VolunteerScores = {
      reliability: Math.round(reliabilityScore),
      skillUsage: Math.round(skillUsageScore),
      feedback: Math.round(feedbackScore),
      impact: Math.round(impactScore),
      overall: Math.min(100, overall),
    };

    // Update user in Firestore
    await firestoreService.updateUser(volunteerId, { volunteerScores: scores });

    return scores;
  }

  // ==================== FORECASTING (Simplified) ====================

  async getVolunteerDemandForecast(eventType?: string): Promise<{ average: number; trend: string }> {
    // Get all closed/filled polls
    const q = query(
      collection(db, POLLS_COLLECTION),
      where("status", "in", ["closed", "filled"])
    );
    const querySnapshot = await getDocs(q);
    const polls = querySnapshot.docs.map(doc => doc.data() as VolunteerPoll);

    if (polls.length === 0) {
      return { average: 5, trend: 'stable' };
    }

    // Calculate average volunteer count
    const average = Math.round(
      polls.reduce((sum, p) => sum + p.volunteerCount, 0) / polls.length
    );

    // Simple trend based on last 5 vs previous 5
    const recent = polls.slice(0, 5);
    const older = polls.slice(5, 10);

    const recentAvg = recent.reduce((sum, p) => sum + p.volunteerCount, 0) / (recent.length || 1);
    const olderAvg = older.reduce((sum, p) => sum + p.volunteerCount, 0) / (older.length || 1);

    let trend = 'stable';
    if (recentAvg > olderAvg * 1.2) trend = 'increasing';
    else if (recentAvg < olderAvg * 0.8) trend = 'decreasing';

    return { average, trend };
  }

  // ==================== ANALYTICS ====================

  async getVolunteerStats(): Promise<{
    totalVolunteers: number;
    activeVolunteers: number;
    avgScore: number;
    skillDistribution: Record<string, number>;
  }> {
    const allUsers = await firestoreService.getAllUsers();
    const volunteers = allUsers.filter(u => u.isVolunteer);

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const activeVolunteers = volunteers.filter(v => {
      const lastActive = v.volunteerHistory?.lastActive;
      return lastActive && new Date(lastActive) > thirtyDaysAgo;
    });

    const avgScore = volunteers.length > 0
      ? volunteers.reduce((sum, v) => sum + (v.volunteerScores?.overall || 0), 0) / volunteers.length
      : 0;

    // Calculate skill distribution
    const skillDistribution: Record<string, number> = {};
    volunteers.forEach(v => {
      v.volunteerProfile?.skills?.forEach(skill => {
        skillDistribution[skill] = (skillDistribution[skill] || 0) + 1;
      });
    });

    return {
      totalVolunteers: volunteers.length,
      activeVolunteers: activeVolunteers.length,
      avgScore: Math.round(avgScore),
      skillDistribution,
    };
  }
}

export const volunteerService = new VolunteerService();
