import { Event, EventFormData, EventReview, ChatMessage, CheckIn } from "./types";

export interface DataService {
  getEvents(): Promise<Event[]>;
  getEventById(id: string): Promise<Event | undefined>;
  createEvent(data: EventFormData, organizerId: string): Promise<Event>;
  updateEvent(id: string, data: Partial<EventFormData>): Promise<Event>;
  deleteEvent(id: string): Promise<void>;
  registerForEvent(eventId: string, userId: string): Promise<void>;
  unregisterFromEvent(eventId: string, userId: string): Promise<void>;
  submitEventReview(review: Omit<EventReview, 'id'>): Promise<EventReview>;
  getReviewsByEvent(eventId: string): Promise<EventReview[]>;
  getReviewsByUser(userId: string): Promise<EventReview[]>;
  // Monitoring & Chat
  toggleCheckIn(eventId: string, userId: string, userName: string, status: 'present' | 'absent'): Promise<void>;
  getCheckInsByEvent(eventId: string): Promise<CheckIn[]>;
  subscribeToMessages(eventId: string, callback: (messages: ChatMessage[]) => void): () => void;
  subscribeToCheckIns(eventId: string, callback: (checkIns: CheckIn[]) => void): () => void;
  subscribeToEvent(eventId: string, callback: (event: Event) => void): () => void;
  sendChatMessage(eventId: string, message: Omit<ChatMessage, 'id' | 'timestamp' | 'eventId'>): Promise<void>;
  updateChatRole(eventId: string, userId: string, roleName: string): Promise<void>;
  updateEventAttendanceStatus(eventId: string, isOpen: boolean): Promise<void>;
  bulkCheckIn(eventId: string, checkIns: { userId: string, userName: string, status: 'present' | 'absent' }[]): Promise<void>;
}
