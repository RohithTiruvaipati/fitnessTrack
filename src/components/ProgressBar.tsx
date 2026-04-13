import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({ progress, color = '#0ea5e9', size = 'md' }: ProgressBarProps) {
  const heights = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div className={`w-full bg-dark-border rounded-full overflow-hidden ${heights[size]}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(progress, 100)}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}
