export interface User {
  id: string;
  name: string;
  email: string;
  startingWeight: number;
  currentWeight: number;
  goalWeight: number;
  goalType: 'cut' | 'bulk' | 'maintain';
  focusAreas: string[];
  createdAt: Date;
}

export interface CheckIn {
  id: string;
  userId: string;
  weight: number;
  date: Date;
}

export interface UserProfile {
  name: string;
  startingWeight: number;
  goalWeight: number;
  goalType: 'cut' | 'bulk' | 'maintain';
  focusAreas: string[];
}
