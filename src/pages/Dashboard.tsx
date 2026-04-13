import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { checkinService } from '../services/firestore';
import type { CheckIn } from '../types';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';

export function Dashboard() {
  const { userProfile } = useAuth();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCheckIns() {
      if (userProfile) {
        const data = await checkinService.getUserCheckIns(userProfile.id);
        setCheckIns(data);
      }
      setLoading(false);
    }
    loadCheckIns();
  }, [userProfile]);

  if (loading || !userProfile) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const hasProfile = userProfile.startingWeight > 0 && userProfile.goalWeight > 0;
  const currentWeight = userProfile.currentWeight || userProfile.startingWeight;
  const goalWeight = userProfile.goalWeight;
  
  const progress = hasProfile
    ? userProfile.goalType === 'cut'
      ? ((userProfile.startingWeight - currentWeight) / (userProfile.startingWeight - goalWeight)) * 100
      : userProfile.goalType === 'bulk'
      ? ((currentWeight - userProfile.startingWeight) / (goalWeight - userProfile.startingWeight)) * 100
      : 50
    : 0;

  const lastCheckIn = checkIns.length > 0 ? checkIns[checkIns.length - 1] : null;
  const previousCheckIn = checkIns.length > 1 ? checkIns[checkIns.length - 2] : null;
  const weeklyChange = lastCheckIn && previousCheckIn 
    ? lastCheckIn.weight - previousCheckIn.weight 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-dark-text mb-2">
            Welcome back, {userProfile.name}!
          </h1>
          <p className="text-dark-muted">Track your fitness journey</p>
        </div>
      </div>

      {!hasProfile ? (
        <Card>
          <EmptyState
            title="Set up your profile"
            description="Go to the Profile page to set your starting weight, goal, and focus areas."
            icon="🎯"
          />
        </Card>
      ) : (
        <>
          <Card delay={0.1}>
            <h2 className="text-lg font-semibold text-dark-text mb-4">Overall Progress</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-dark-muted">Progress to goal</span>
                  <span className="text-dark-text font-semibold">{Math.min(Math.round(progress), 100)}%</span>
                </div>
                <ProgressBar progress={progress} />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-dark-text">{currentWeight.toFixed(1)}</p>
                  <p className="text-sm text-dark-muted">Current (lbs)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-dark-text">{goalWeight.toFixed(1)}</p>
                  <p className="text-sm text-dark-muted">Goal (lbs)</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${weeklyChange > 0 ? 'text-green-500' : weeklyChange < 0 ? 'text-red-500' : 'text-dark-text'}`}>
                    {weeklyChange > 0 ? '+' : ''}{weeklyChange.toFixed(1)}
                  </p>
                  <p className="text-sm text-dark-muted">Weekly Change</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card delay={0.2}>
              <h3 className="text-sm text-dark-muted mb-2">Starting Weight</h3>
              <p className="text-2xl font-bold text-dark-text">{userProfile.startingWeight.toFixed(1)} lbs</p>
            </Card>
            <Card delay={0.3}>
              <h3 className="text-sm text-dark-muted mb-2">Goal Type</h3>
              <p className="text-2xl font-bold text-dark-text capitalize">{userProfile.goalType}</p>
            </Card>
            <Card delay={0.4}>
              <h3 className="text-sm text-dark-muted mb-2">Total Check-ins</h3>
              <p className="text-2xl font-bold text-dark-text">{checkIns.length}</p>
            </Card>
          </div>

          {userProfile.focusAreas.length > 0 && (
            <Card delay={0.5}>
              <h2 className="text-lg font-semibold text-dark-text mb-4">Focus Areas</h2>
              <div className="flex flex-wrap gap-2">
                {userProfile.focusAreas.map((area, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="px-4 py-2 bg-primary-500/20 text-primary-400 rounded-full text-sm"
                  >
                    {area}
                  </motion.span>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </motion.div>
  );
}
