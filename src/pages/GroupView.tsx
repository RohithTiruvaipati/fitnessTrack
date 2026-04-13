import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { userService, checkinService } from '../services/firestore';
import type { User, CheckIn } from '../types';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';

export function GroupView() {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'progress' | 'consistency'>('progress');

  useEffect(() => {
    async function loadData() {
      const allUsers = await userService.getAllUsers();
      const allCheckIns = await checkinService.getAllCheckIns();
      setUsers(allUsers);
      setCheckIns(allCheckIns);
      setLoading(false);
    }
    loadData();
  }, []);

  const getUserProgress = (user: User) => {
    if (user.startingWeight === 0 || user.goalWeight === 0) return 0;
    
    const currentWeight = user.currentWeight || user.startingWeight;
    if (user.goalType === 'cut') {
      return ((user.startingWeight - currentWeight) / (user.startingWeight - user.goalWeight)) * 100;
    } else if (user.goalType === 'bulk') {
      return ((currentWeight - user.startingWeight) / (user.goalWeight - user.startingWeight)) * 100;
    }
    return 50;
  };

  const getUserConsistency = (user: User) => {
    const userCheckIns = checkIns.filter(ci => ci.userId === user.id);
    return userCheckIns.length;
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (sortBy === 'progress') {
      return getUserProgress(b) - getUserProgress(a);
    } else {
      return getUserConsistency(b) - getUserConsistency(a);
    }
  });

  const getProgressColor = (user: User) => {
    const progress = getUserProgress(user);
    if (progress >= 75) return '#10b981';
    if (progress >= 50) return '#0ea5e9';
    if (progress >= 25) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-dark-text mb-2">Group View</h1>
          <p className="text-dark-muted">See how everyone is progressing</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('progress')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              sortBy === 'progress'
                ? 'bg-primary-500 text-white'
                : 'bg-dark-card border border-dark-border text-dark-text hover:border-primary-500'
            }`}
          >
            By Progress
          </button>
          <button
            onClick={() => setSortBy('consistency')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              sortBy === 'consistency'
                ? 'bg-primary-500 text-white'
                : 'bg-dark-card border border-dark-border text-dark-text hover:border-primary-500'
            }`}
          >
            By Consistency
          </button>
        </div>
      </div>

      {users.length === 0 ? (
        <Card>
          <EmptyState
            title="No users yet"
            description="Wait for team members to join and set up their profiles."
            icon="👥"
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedUsers.map((user, index) => {
            const progress = getUserProgress(user);
            const consistency = getUserConsistency(user);
            const hasProfile = user.startingWeight > 0 && user.goalWeight > 0;
            
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-dark-text">{user.name}</h3>
                      <p className="text-sm text-dark-muted capitalize">{user.goalType}</p>
                    </div>
                    {user.id === userProfile?.id && (
                      <span className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded-full">
                        You
                      </span>
                    )}
                  </div>

                  {!hasProfile ? (
                    <p className="text-dark-muted text-sm">Profile not set up yet</p>
                  ) : (
                    <>
                      <div className="space-y-3 mb-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-dark-muted">Progress</span>
                            <span className="text-sm text-dark-text font-semibold">{Math.min(Math.round(progress), 100)}%</span>
                          </div>
                          <ProgressBar progress={progress} color={getProgressColor(user)} size="sm" />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-lg font-bold text-dark-text">{user.currentWeight.toFixed(1)}</p>
                          <p className="text-xs text-dark-muted">Current</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-dark-text">{user.goalWeight.toFixed(1)}</p>
                          <p className="text-xs text-dark-muted">Goal</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-dark-text">{consistency}</p>
                          <p className="text-xs text-dark-muted">Check-ins</p>
                        </div>
                      </div>

                      {user.focusAreas.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {user.focusAreas.slice(0, 3).map((area, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-dark-bg border border-dark-border rounded-full text-xs text-dark-muted"
                            >
                              {area}
                            </span>
                          ))}
                          {user.focusAreas.length > 3 && (
                            <span className="px-2 py-1 bg-dark-bg border border-dark-border rounded-full text-xs text-dark-muted">
                              +{user.focusAreas.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
