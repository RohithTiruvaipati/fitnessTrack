import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { checkinService } from '../services/firestore';
import type { CheckIn } from '../types';
import { Card } from './Card';
import { GraphSkeleton } from './LoadingSkeleton';
import { EmptyState } from './EmptyState';

interface PersonalGraphProps {
  userId: string;
  userName: string;
}

export function PersonalGraph({ userId, userName }: PersonalGraphProps) {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await checkinService.getUserCheckIns(userId);
      setCheckIns(data);
      setLoading(false);
    }
    loadData();
  }, [userId]);

  if (loading) {
    return <GraphSkeleton />;
  }

  if (checkIns.length === 0) {
    return (
      <Card>
        <EmptyState
          title="No data yet"
          description="Start checking in to see your progress over time."
          icon="📈"
        />
      </Card>
    );
  }

  const chartData = checkIns.map((checkIn) => ({
    date: new Date(checkIn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: checkIn.weight,
  }));

  return (
    <Card>
      <h2 className="text-lg font-semibold text-dark-text mb-4">{userName}'s Progress</h2>
      <ResponsiveContainer width="100%" height={300}>
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
            domain={['dataMin - 2', 'dataMax + 2']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#141414',
              border: '1px solid #262626',
              borderRadius: '8px',
              color: '#ededed',
            }}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#0ea5e9"
            strokeWidth={2}
            dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
