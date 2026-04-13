import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { db } from '../lib/firebase';
import { ref, set, get } from 'firebase/database';
import type { User } from '../types';

const ALLOWED_NAMES = ['Ajay', 'Shivam', 'Amogh', 'Rohith'];
const USER_PASSWORDS: Record<string, string> = {
  'Ajay': 'ajay',
  'Shivam': 'shivam',
  'Amogh': 'amogh',
  'Rohith': 'rohith',
};

interface AuthContextType {
  currentUser: string | null; // User's name
  userProfile: User | null;
  loading: boolean;
  login: (name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  availableNames: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('fittrack_user');
    if (savedUser) {
      setCurrentUser(savedUser);
      loadUserProfile(savedUser);
    }
    setLoading(false);
  }, []);

  const loadUserProfile = async (name: string) => {
    try {
      const userRef = ref(db, `users/${name}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        setUserProfile(snapshot.val() as User);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const login = async (name: string, password: string) => {
    console.log('Login attempt for:', name);
    
    if (!ALLOWED_NAMES.includes(name)) {
      throw new Error('Invalid name. Please choose from the available names.');
    }

    if (USER_PASSWORDS[name] !== password) {
      throw new Error('Incorrect password.');
    }

    setCurrentUser(name);
    localStorage.setItem('fittrack_user', name);
    console.log('User set, loading profile from Realtime Database...');

    try {
      const userRef = ref(db, `users/${name}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        setUserProfile(snapshot.val() as User);
        console.log('Existing user profile loaded');
      } else {
        console.log('Creating new user profile...');
        const newUser: User = {
          id: name,
          name,
          email: `${name.toLowerCase()}@fittrack.local`,
          startingWeight: 0,
          currentWeight: 0,
          goalWeight: 0,
          goalType: 'maintain',
          focusAreas: [],
          createdAt: new Date(),
        };
        await set(userRef, newUser);
        setUserProfile(newUser);
        console.log('New user profile created');
      }
    } catch (error) {
      console.error('Firebase error during login:', error);
      throw new Error('Failed to connect to database. Please check your internet connection and try again.');
    }
  };

  const logout = async () => {
    setCurrentUser(null);
    setUserProfile(null);
    localStorage.removeItem('fittrack_user');
  };

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, loading, login, logout, availableNames: ALLOWED_NAMES }}>
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
