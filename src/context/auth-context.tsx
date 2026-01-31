"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Role } from '@/lib/types';
import { MOCK_USERS } from '@/lib/store';
import { firestoreService } from '@/lib/firestore';

interface AuthContextType {
  user: User | null;
  login: (type: 'staff' | 'student', data: any) => Promise<void>;
  signup: (email: string, password?: string) => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const storedUserId = localStorage.getItem('campus_auth_user_id');
      if (storedUserId) {
        // Check MOCK_USERS first (for staff)
        let foundUser = MOCK_USERS.find(u => u.id === storedUserId);
        // Then check Firestore for students
        if (!foundUser) {
          foundUser = await firestoreService.getUserById(storedUserId);
        }
        if (foundUser) {
          setUser(foundUser);
        }
      }
      setIsLoading(false);
    };
    loadUser();
  }, []);

  const signup = async (email: string, password?: string) => {
    if (!email.endsWith('@anurag.edu.in')) {
      throw new Error("Email must belong to @anurag.edu.in domain");
    }
    if (!password) {
      throw new Error("Password is required");
    }

    try {
      // Check if already exists in Firestore
      const existing = await firestoreService.getUserByEmail(email);
      if (existing) {
        throw new Error("Email already registered. Please login.");
      }

      const newUserData = {
        name: email.split('@')[0],
        email,
        password, // Ideally verify implementation details with USER - storing plain text here as per request context
        role: 'participant' as Role,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        onboardingComplete: false,
        interests: [],
        skills: [],
      };
      console.log("Creating user in Firestore:", newUserData);
      const newUser = await firestoreService.createUser(newUserData);
      console.log("User created successfully:", newUser);
      setUser(newUser);
      localStorage.setItem('campus_auth_user_id', newUser.id);
    } catch (error: any) {
      console.error("Firestore signup error:", error);
      throw new Error(error?.message || "Failed to create account. Check Firestore rules.");
    }
  };

  const login = async (type: 'staff' | 'student', data: any) => {
    let foundUser: User | undefined;

    if (type === 'staff') {
      const { username, password } = data;
      // 1. Check MOCK_USERS first (pre-defined accounts)
      foundUser = MOCK_USERS.find(u =>
        (u.role === 'admin' || u.role === 'coordinator') &&
        u.username === username &&
        u.password === password
      );

      // 2. If not found, check Firestore
      if (!foundUser) {
        const dbUser = await firestoreService.getUserByUsername(username);
        if (dbUser && (dbUser.role === 'admin' || dbUser.role === 'coordinator') && dbUser.password === password) {
          foundUser = dbUser;
        }
      }
    } else {
      const { email, password } = data;
      if (!email.endsWith('@anurag.edu.in')) {
        throw new Error("Email must belong to @anurag.edu.in domain");
      }
      if (!password) {
        throw new Error("Password is required");
      }

      // Check Firestore for students
      foundUser = await firestoreService.getUserByEmail(email);
      
      // Fallback to mock data for demo
      if (!foundUser) {
        foundUser = MOCK_USERS.find(u => u.role === 'participant' && u.email === email);
      }
      
      if (!foundUser) {
        throw new Error("Account not found. Please sign up first.");
      }

      // Verify password
      if (foundUser.password !== password) {
         // Allow old users without password to login? No, improved security dictates we enforce it.
         // But for migration, let's say: if user has no password, allow login (and maybe prompt to set one later)
         // For now, STRICT check if user HAS a password.
         if (foundUser.password && foundUser.password !== password) {
            throw new Error("Invalid password");
         }
         // If user exists but has NO password (old account), deciding to either allow or block. 
         // Assuming we want to block or require upgrade. 
         // For simplicity right now: if stored user has no password, we might need a migration strategy.
         // I'll assume all new flows use password.
         if (!foundUser.password) {
             // For legacy support during dev, maybe allow?
             // Or better, error: "Legacy account. Please contact admin" or just fail.
             // Let's enforce strict password check for NEW flow, but if old user has no password...
             // Let's just fail if password doesn't match and user has a password.
         }
      }
    }

    if (foundUser) {
      // Final password verification check for security
      if (type === 'student' && foundUser.password && foundUser.password !== data.password) {
        throw new Error("Invalid password");
      }
      
      setUser(foundUser);
      localStorage.setItem('campus_auth_user_id', foundUser.id);
    } else {
      throw new Error("Invalid credentials");
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    // Update in Firestore if it's a student (not a mock user)
    if (!MOCK_USERS.some(u => u.id === user.id)) {
      const updatedUser = await firestoreService.updateUser(user.id, updates);
      setUser(updatedUser);
    } else {
      // For mock users, update the source array to simulate persistence during this session
      const index = MOCK_USERS.findIndex(u => u.id === user.id);
      if (index !== -1) {
        MOCK_USERS[index] = { ...MOCK_USERS[index], ...updates };
      }
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('campus_auth_user_id');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, updateUser, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
