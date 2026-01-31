import { DataService } from "./data-service";
import { Event, EventFormData, User, EventReview, ChatMessage, CheckIn } from "./types";
import { db } from "./firebase";
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove, query, where, setDoc, orderBy, onSnapshot, limit } from "firebase/firestore";

const EVENTS_COLLECTION = "events";
const USERS_COLLECTION = "users";
const REVIEWS_COLLECTION = "eventReviews";
const MESSAGES_COLLECTION = "messages";
const CHECKINS_COLLECTION = "checkins";

export class FirestoreService implements DataService {
  // --- Event Methods ---
  async getEvents(): Promise<Event[]> {
    const querySnapshot = await getDocs(collection(db, EVENTS_COLLECTION));
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        attendeeIds: data.attendeeIds || []
      } as Event;
    });
  }

  async getEventById(id: string): Promise<Event | undefined> {
    const docRef = doc(db, EVENTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Event;
    }
    return undefined;
  }

  async createEvent(data: EventFormData, organizerId: string): Promise<Event> {
    const newEventData = {
      ...data,
      organizerId,
      attendeeIds: [],
      createdAt: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, EVENTS_COLLECTION), newEventData);
    return { id: docRef.id, ...newEventData } as Event;
  }

  async updateEvent(id: string, data: Partial<EventFormData>): Promise<Event> {
    const docRef = doc(db, EVENTS_COLLECTION, id);
    await updateDoc(docRef, data);
    const updated = await this.getEventById(id);
    if (!updated) throw new Error("Event not found after update");
    return updated;
  }

  async deleteEvent(id: string): Promise<void> {
    await deleteDoc(doc(db, EVENTS_COLLECTION, id));
  }

  async registerForEvent(eventId: string, userId: string): Promise<void> {
    const docRef = doc(db, EVENTS_COLLECTION, eventId);
    await updateDoc(docRef, {
      attendeeIds: arrayUnion(userId)
    });
  }

  async unregisterFromEvent(eventId: string, userId: string): Promise<void> {
    const docRef = doc(db, EVENTS_COLLECTION, eventId);
    await updateDoc(docRef, {
      attendeeIds: arrayRemove(userId)
    });
  }

  async submitEventReview(review: Omit<EventReview, 'id'>): Promise<EventReview> {
    const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), review);
    return { id: docRef.id, ...review };
  }

  async getReviewsByEvent(eventId: string): Promise<EventReview[]> {
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where("eventId", "==", eventId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EventReview));
  }

  async getReviewsByUser(userId: string): Promise<EventReview[]> {
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EventReview));
  }

  // --- User Methods ---
  async getUserByEmail(email: string): Promise<User | undefined> {
    const q = query(collection(db, USERS_COLLECTION), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docData = querySnapshot.docs[0];
      return { id: docData.id, ...docData.data() } as User;
    }
    return undefined;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const docRef = doc(db, USERS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as User;
    }
    return undefined;
  }

  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    const docRef = await addDoc(collection(db, USERS_COLLECTION), userData);
    return { id: docRef.id, ...userData };
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const docRef = doc(db, USERS_COLLECTION, id);
    await updateDoc(docRef, updates);
    const updated = await this.getUserById(id);
    if (!updated) throw new Error("User not found after update");
    return updated;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const q = query(collection(db, USERS_COLLECTION), where("username", "==", username));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docData = querySnapshot.docs[0];
      return { id: docData.id, ...docData.data() } as User;
    }
    return undefined;
  }

  async getAllUsers(): Promise<User[]> {
    const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  }

  // --- Monitoring & Chat Methods ---
  async toggleCheckIn(eventId: string, userId: string, userName: string, status: 'present' | 'absent'): Promise<void> {
    const checkInId = `${eventId}_${userId}`;
    const docRef = doc(db, CHECKINS_COLLECTION, checkInId);

    await setDoc(docRef, {
      eventId,
      userId,
      userName,
      status,
      timestamp: new Date().toISOString()
    }, { merge: true });
  }

  async getCheckInsByEvent(eventId: string): Promise<CheckIn[]> {
    const q = query(collection(db, CHECKINS_COLLECTION), where("eventId", "==", eventId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CheckIn));
  }

  subscribeToMessages(eventId: string, callback: (messages: ChatMessage[]) => void): () => void {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where("eventId", "==", eventId),
      orderBy("timestamp", "asc")
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
      callback(messages);
    }, (error) => console.error("Error subscribing to messages:", error));
  }

  subscribeToCheckIns(eventId: string, callback: (checkIns: CheckIn[]) => void): () => void {
    const q = query(collection(db, CHECKINS_COLLECTION), where("eventId", "==", eventId));

    return onSnapshot(q, (snapshot) => {
      const checkIns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CheckIn));
      callback(checkIns);
    }, (error) => console.error("Error subscribing to check-ins:", error));
  }

  subscribeToEvent(eventId: string, callback: (event: Event) => void): () => void {
    const docRef = doc(db, EVENTS_COLLECTION, eventId);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() } as Event);
      }
    }, (error) => console.error("Error subscribing to event:", error));
  }

  async sendChatMessage(eventId: string, message: Omit<ChatMessage, 'id' | 'timestamp' | 'eventId'>): Promise<void> {
    const data: any = {
      ...message,
      eventId,
      timestamp: new Date().toISOString()
    };

    // Firestore doesn't accept undefined values
    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

    await addDoc(collection(db, MESSAGES_COLLECTION), data);
  }

  async updateChatRole(eventId: string, userId: string, roleName: string): Promise<void> {
    const docRef = doc(db, EVENTS_COLLECTION, eventId);
    const updatePath = `chatRoleMap.${userId}`;
    await updateDoc(docRef, {
      [updatePath]: roleName
    });
  }

  async updateEventAttendanceStatus(eventId: string, isOpen: boolean): Promise<void> {
    const docRef = doc(db, EVENTS_COLLECTION, eventId);
    await updateDoc(docRef, {
      isAttendanceOpen: isOpen
    });
  }

  async bulkCheckIn(eventId: string, checkIns: {userId: string, userName: string, status: 'present' | 'absent'}[]): Promise<void> {
    const batch: any[] = []; // In a real app, I'd use writeBatch
    for (const ci of checkIns) {
      const checkInId = `${eventId}_${ci.userId}`;
      const docRef = doc(db, CHECKINS_COLLECTION, checkInId);
      await setDoc(docRef, {
        eventId,
        userId: ci.userId,
        userName: ci.userName,
        status: ci.status,
        timestamp: new Date().toISOString()
      }, { merge: true });
    }
  }
}

export const firestoreService = new FirestoreService();
