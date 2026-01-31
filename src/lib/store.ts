import { Event, EventFormData, Role, User } from './types';

const STORAGE_KEY_EVENTS = 'campus_events_data';
const STORAGE_KEY_USERS = 'campus_users_data';

// Mock Users
export const MOCK_USERS: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@uni.edu', role: 'admin', username: 'admin', password: 'password123', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice' },
  { id: '2', name: 'Coordinator User', email: 'coordinator@uni.edu', role: 'coordinator', username: 'coordinator', password: 'password123', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' },
  { id: '3', name: 'Student User', email: '24eg105p52@anurag.edu.in', role: 'participant', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie' },
];

const INITIAL_EVENTS: Event[] = [
  {
    id: 'e1',
    title: 'Computer Science Fair',
    description: 'Showcase of final year projects.',
    date: new Date(Date.now() + 86400000 * 5).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 5 + 3600000 * 2).toISOString(),
    location: 'Tech Hub Hall A',
    organizerId: '2',
    maxAttendees: 100,
    attendeeIds: ['3'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'e2',
    title: 'Music Festival',
    description: 'Live performances by student bands.',
    date: new Date(Date.now() + 86400000 * 10).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 10 + 3600000 * 4).toISOString(),
    location: 'Open Grounds',
    organizerId: '2',
    maxAttendees: 500,
    attendeeIds: [],
    createdAt: new Date().toISOString(),
  },
];

class MockDataService {
  private events: Event[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.load();
    } else {
      this.events = [...INITIAL_EVENTS];
    }
  }

  private load() {
    const stored = localStorage.getItem(STORAGE_KEY_EVENTS);
    if (stored) {
      this.events = JSON.parse(stored);
    } else {
      this.events = [...INITIAL_EVENTS];
      this.save();
    }
  }

  private save() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(this.events));
    }
  }

  getEvents(): Event[] {
    this.load(); // Refresh from storage
    return this.events;
  }

  getEventById(id: string): Event | undefined {
    this.load();
    return this.events.find(e => e.id === id);
  }

  createEvent(data: EventFormData, organizerId: string): Event {
    this.load();
    const newEvent: Event = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      organizerId,
      attendeeIds: [],
      createdAt: new Date().toISOString(),
    };
    this.events.push(newEvent);
    this.save();
    return newEvent;
  }

  updateEvent(id: string, data: Partial<EventFormData>): Event {
    this.load();
    const index = this.events.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Event not found');

    this.events[index] = { ...this.events[index], ...data };
    this.save();
    return this.events[index];
  }

  deleteEvent(id: string): void {
    this.load();
    this.events = this.events.filter(e => e.id !== id);
    this.save();
  }

  registerForEvent(eventId: string, userId: string): void {
    this.load();
    const index = this.events.findIndex(e => e.id === eventId);
    if (index === -1) throw new Error('Event not found');

    const event = this.events[index];
    if (!event.attendeeIds.includes(userId)) {
      event.attendeeIds.push(userId);
      this.save();
    }
  }

  unregisterFromEvent(eventId: string, userId: string): void {
    this.load();
    const index = this.events.findIndex(e => e.id === eventId);
    if (index === -1) throw new Error('Event not found');

    const event = this.events[index];
    event.attendeeIds = event.attendeeIds.filter(id => id !== userId);
    this.save();
  }
}

import { firestoreService } from './firestore';

// ... MockDataService class definitions ...

// Exporting Firestore Service as the primary data service
export const dataService = firestoreService;
// export const dataService = new MockDataService(); // Swapped out

