import { db } from '../lib/firebase';
import { ref, get, set, update, push } from 'firebase/database';
import type { User, CheckIn } from '../types';

export const userService = {
  async getUser(userId: string): Promise<User | null> {
    const userRef = ref(db, `users/${userId}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      return snapshot.val() as User;
    }
    return null;
  },

  async updateUser(userId: string, data: Partial<User>): Promise<void> {
    const userRef = ref(db, `users/${userId}`);
    await update(userRef, data);
  },

  async getAllUsers(): Promise<User[]> {
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    
    if (snapshot.exists()) {
      const usersData = snapshot.val();
      return Object.values(usersData) as User[];
    }
    return [];
  },
};

export const checkinService = {
  async addCheckIn(userId: string, weight: number): Promise<void> {
    const checkInData: Omit<CheckIn, 'id'> = {
      userId,
      weight,
      date: new Date(),
    };
    
    const checkInsRef = ref(db, 'checkins');
    const newCheckInRef = push(checkInsRef);
    await set(newCheckInRef, {
      ...checkInData,
      date: checkInData.date.toISOString(),
    });

    // Update user's current weight
    await userService.updateUser(userId, { currentWeight: weight });
  },

  async getUserCheckIns(userId: string): Promise<CheckIn[]> {
    const checkInsRef = ref(db, 'checkins');
    const snapshot = await get(checkInsRef);
    
    if (snapshot.exists()) {
      const checkInsData = snapshot.val();
      const allCheckIns: CheckIn[] = Object.entries(checkInsData).map(([id, data]: [string, any]) => ({
        id,
        ...data,
        date: new Date(data.date),
      }));
      
      // Filter by userId and sort by date
      return allCheckIns
        .filter(checkIn => checkIn.userId === userId)
        .sort((a, b) => a.date.getTime() - b.date.getTime());
    }
    return [];
  },

  async getAllCheckIns(): Promise<CheckIn[]> {
    const checkInsRef = ref(db, 'checkins');
    const snapshot = await get(checkInsRef);
    
    if (snapshot.exists()) {
      const checkInsData = snapshot.val();
      return Object.entries(checkInsData).map(([id, data]: [string, any]) => ({
        id,
        ...data,
        date: new Date(data.date),
      })).sort((a, b) => a.date.getTime() - b.date.getTime());
    }
    return [];
  },

  async getLastCheckIn(userId: string): Promise<CheckIn | null> {
    const userCheckIns = await this.getUserCheckIns(userId);
    if (userCheckIns.length === 0) return null;
    
    // Return the most recent check-in (last in sorted array)
    return userCheckIns[userCheckIns.length - 1];
  },
};
