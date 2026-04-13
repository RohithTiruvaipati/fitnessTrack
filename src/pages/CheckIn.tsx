import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { checkinService } from '../services/firestore';
import type { CheckIn } from '../types';
import { Card } from '../components/Card';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';

export function CheckIn() {
  const { userProfile } = useAuth();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [weight, setWeight] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [canCheckIn, setCanCheckIn] = useState(true);
  const [nextCheckInDate, setNextCheckInDate] = useState<Date | null>(null);

  useEffect(() => {
    async function loadCheckIns() {
      if (userProfile) {
        const data = await checkinService.getUserCheckIns(userProfile.id);
        setCheckIns(data);
        
        // Check if user can check in this week
        const lastCheckIn = data.length > 0 ? data[data.length - 1] : null;
        if (lastCheckIn) {
          const lastDate = new Date(lastCheckIn.date);
          const now = new Date();
          const daysSinceLastCheckIn = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysSinceLastCheckIn < 7) {
            setCanCheckIn(false);
            const nextDate = new Date(lastDate);
            nextDate.setDate(nextDate.getDate() + 7);
            setNextCheckInDate(nextDate);
          }
        }
      }
      setLoading(false);
    }
    loadCheckIns();
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !weight) return;

    setSubmitting(true);
    try {
      await checkinService.addCheckIn(userProfile.id, parseFloat(weight));
      setWeight('');
      const data = await checkinService.getUserCheckIns(userProfile.id);
      setCheckIns(data);
      setCanCheckIn(false);
      const lastDate = new Date(data[data.length - 1].date);
      const nextDate = new Date(lastDate);
      nextDate.setDate(nextDate.getDate() + 7);
      setNextCheckInDate(nextDate);
    } catch (error) {
      console.error('Error submitting check-in:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !userProfile) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
      </div>
    );
  }

  const sortedCheckIns = [...checkIns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-dark-text mb-2">Weekly Check-in</h1>
        <p className="text-dark-muted">Log your weight once per week to track progress</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-dark-muted mb-2">Current Weight (lbs)</label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              disabled={!canCheckIn || submitting}
              placeholder="Enter your weight"
              className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {!canCheckIn && nextCheckInDate && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-yellow-400 text-sm">
                You can check in again on {nextCheckInDate.toLocaleDateString()}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={!canCheckIn || submitting || !weight}
            className="w-full px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Check-in'}
          </button>
        </form>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-dark-text mb-4">Check-in History</h2>
        {sortedCheckIns.length === 0 ? (
          <EmptyState
            title="No check-ins yet"
            description="Start tracking your progress by submitting your first check-in."
            icon="📝"
          />
        ) : (
          <div className="space-y-3">
            {sortedCheckIns.map((checkIn, index) => (
              <motion.div
                key={checkIn.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex justify-between items-center p-4 bg-dark-bg border border-dark-border rounded-lg"
              >
                <div>
                  <p className="text-dark-text font-semibold">{checkIn.weight.toFixed(1)} lbs</p>
                  <p className="text-sm text-dark-muted">
                    {new Date(checkIn.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                {index < sortedCheckIns.length - 1 && (
                  <div className="text-right">
                    <p
                      className={`text-sm font-semibold ${
                        checkIn.weight > sortedCheckIns[index + 1].weight
                          ? 'text-red-500'
                          : checkIn.weight < sortedCheckIns[index + 1].weight
                          ? 'text-green-500'
                          : 'text-dark-muted'
                      }`}
                    >
                      {checkIn.weight > sortedCheckIns[index + 1].weight
                        ? `+${(checkIn.weight - sortedCheckIns[index + 1].weight).toFixed(1)}`
                        : checkIn.weight < sortedCheckIns[index + 1].weight
                        ? `${(checkIn.weight - sortedCheckIns[index + 1].weight).toFixed(1)}`
                        : '0'}
                    </p>
                    <p className="text-xs text-dark-muted">vs previous</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
