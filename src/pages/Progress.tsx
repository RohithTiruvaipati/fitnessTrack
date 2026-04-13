import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/firestore';
import type { User } from '../types';
import { PersonalGraph } from '../components/PersonalGraph';
import { GroupGraph } from '../components/GroupGraph';
import { GraphSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';

export function Progress() {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      const allUsers = await userService.getAllUsers();
      setUsers(allUsers);
      setLoading(false);
    }
    loadUsers();
  }, []);

  if (loading || !userProfile) {
    return (
      <div className="space-y-6">
        <GraphSkeleton />
        <GraphSkeleton />
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
      <div>
        <h1 className="text-3xl font-bold text-dark-text mb-2">Progress</h1>
        <p className="text-dark-muted">Track your and the group's fitness journey</p>
      </div>

      <PersonalGraph userId={userProfile.id} userName={userProfile.name} />

      {users.length > 1 && (
        <GroupGraph users={users} />
      )}

      {users.length === 1 && (
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
          <EmptyState
            title="Waiting for team members"
            description="Invite more users to see group progress comparison."
            icon="👥"
          />
        </div>
      )}
    </motion.div>
  );
}
