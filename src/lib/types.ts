export type Role = 'admin' | 'coordinator' | 'participant';
export type VolunteerType = 'technical' | 'non-technical' | 'both';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'expert';
export type PollPriority = 'low' | 'medium' | 'high' | 'urgent';
export type PollStatus = 'open' | 'closed' | 'filled';

export interface VolunteerProfile {
  type: VolunteerType;
  skills: string[];
  experienceLevel: ExperienceLevel;
  availability: string[]; // e.g., ["weekends", "evenings"]
}

export interface VolunteerScores {
  reliability: number;      // 0-100
  skillUsage: number;       // 0-100
  feedback: number;         // 0-100
  impact: number;           // 0-100
  overall: number;          // Weighted average
}

export interface VolunteerHistory {
  eventsParticipated: number;
  totalHours: number;
  lastActive: string; // ISO date
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  username?: string; // For staff login
  password?: string; // For staff login
  // Onboarding preferences (for students)
  interests?: string[];
  participationRole?: string;
  skills?: string[];
  onboardingComplete?: boolean;
  // Volunteer Intelligence
  volunteerProfile?: VolunteerProfile;
  volunteerScores?: VolunteerScores;
  volunteerHistory?: VolunteerHistory;
  isVolunteer?: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO String
  endDate: string; // ISO String
  location: string;
  organizerId: string;
  maxAttendees: number;
  attendeeIds: string[];
  createdAt: string;
  // Volunteer fields
  volunteerPollId?: string;
  assignedVolunteers?: string[];
  // Live monitoring & Chat
  chatRoleMap?: Record<string, string>; // userId -> custom role name (e.g. "Event Moderator")
  isLive?: boolean;
  // Detail Page Fields
  posterImage?: string;
  category?: string;
  organizer?: string; // Organizer/Club Name
  tags?: string[];
  schedule?: ScheduleItem[];
  registrationStartDate?: string;
  registrationEndDate?: string;
  isAttendanceOpen?: boolean;
}

export interface ScheduleItem {
  time: string;
  activityTitle: string;
  activityDescription: string;
  responsiblePerson?: string;
}

export interface EventFormData {
  title: string;
  description: string;
  date: string;
  endDate: string;
  location: string;
  maxAttendees: number;
  category?: string;
  organizer?: string;
  posterImage?: string;
  tags?: string[];
  schedule?: ScheduleItem[];
  registrationStartDate?: string;
  registrationEndDate?: string;
  isAttendanceOpen?: boolean;
}

// Volunteer Intelligence Types
export interface VolunteerPoll {
  id: string;
  eventId: string;
  createdBy: string; // organizerId
  title: string;
  description?: string;
  skillsRequired: string[];
  experienceLevel: ExperienceLevel | 'any';
  volunteerCount: number;
  priority: PollPriority;
  status: PollStatus;
  respondedVolunteers: string[]; // userIds who accepted
  declinedVolunteers: string[];
  matchedVolunteers: string[]; // userIds who match criteria
  createdAt: string;
  deadline: string;
}

export interface VolunteerFeedback {
  id: string;
  eventId: string;
  volunteerId: string;
  rating: number; // 1-5
  comment?: string;
  givenBy: string; // organizerId
  createdAt: string;
}

export interface EventReview {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  experience: string;
  improvements: string;
  createdAt: string;
}

export interface CheckIn {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  timestamp: string;
  status: 'present' | 'absent';
  activitySignal?: string; // Latest active signal
}

export interface ChatMessage {
  id: string;
  eventId: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  text: string;
  timestamp: string;
  customRole?: string; // e.g. "Event Moderator"
}
