import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { checkinService } from '../services/firestore';
import type { CheckIn, User } from '../types';
import { Card } from './Card';
import { GraphSkeleton } from './LoadingSkeleton';
import { EmptyState } from './EmptyState';

const USER_COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

interface GroupGraphProps {
  users: User[];
}

export function GroupGraph({ users }: GroupGraphProps) {
  const [allCheckIns, setAllCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleUsers, setVisibleUsers] = useState<Set<string>>(new Set(users.map(u => u.id)));

  useEffect(() => {
    async function loadData() {
      const data = await checkinService.getAllCheckIns();
      setAllCheckIns(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const toggleUserVisibility = (userId: string) => {
    const newVisible = new Set(visibleUsers);
    if (newVisible.has(userId)) {
      newVisible.delete(userId);
    } else {
      newVisible.add(userId);
    }
    setVisibleUsers(newVisible);
  };

  if (loading) {
    return <GraphSkeleton />;
  }

  if (users.length === 0) {
    return (
      <Card>
        <EmptyState
          title="No users yet"
          description="Wait for team members to join and check in."
          icon="👥"
        />
      </Card>
    );
  }

  const userCheckInsMap = new Map<string, CheckIn[]>();
  users.forEach(user => {
    const userCheckIns = allCheckIns
      .filter(ci => ci.userId === user.id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    userCheckInsMap.set(user.id, userCheckIns);
  });

  const allDates = new Set<string>();
  userCheckInsMap.forEach(checkIns => {
    checkIns.forEach(ci => {
      allDates.add(new Date(ci.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    });
  });

  const sortedDates = Array.from(allDates).sort((a, b) => {
    const dateA = new Date(a + ', 2024');
    const dateB = new Date(b + ', 2024');
    return dateA.getTime() - dateB.getTime();
  });

  const chartData = sortedDates.map(date => {
    const dataPoint: any = { date };
    users.forEach(user => {
      const checkIns = userCheckInsMap.get(user.id) || [];
      const checkIn = checkIns.find(ci => 
        new Date(ci.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) === date
      );
      if (checkIn) {
        dataPoint[user.name] = checkIn.weight;
      }
    });
    return dataPoint;
  });

  return (
    <Card>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-dark-text mb-3">Group Progress</h2>
        <div className="flex flex-wrap gap-2">
          {users.map((user, index) => (
            <button
              key={user.id}
              onClick={() => toggleUserVisibility(user.id)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                visibleUsers.has(user.id)
                  ? 'text-white'
                  : 'bg-dark-border text-dark-muted'
              }`}
              style={{
                backgroundColor: visibleUsers.has(user.id) ? USER_COLORS[index % USER_COLORS.length] : undefined,
              }}
            >
              {user.name}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
          <XAxis
            dataKey="date"
            stroke="#737373"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#737373"
            style={{ fontSize: '12px' }}
            domain={['dataMin - 5', 'dataMax + 5']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#141414',
              border: '1px solid #262626',
              borderRadius: '8px',
              color: '#ededed',
            }}
          />
          <Legend />
          {users.map((user, index) => (
            visibleUsers.has(user.id) && (
              <Line
                key={user.id}
                type="monotone"
                dataKey={user.name}
                stroke={USER_COLORS[index % USER_COLORS.length]}
                strokeWidth={2}
                dot={{ fill: USER_COLORS[index % USER_COLORS.length], strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            )
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
