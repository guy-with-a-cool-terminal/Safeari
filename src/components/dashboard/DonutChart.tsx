// components/dashboard/DonutChart.tsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DonutChartProps {
  safeCount: number;
  blockedCount: number;
  size?: number;
  className?: string;
}

const DonutChart: React.FC<DonutChartProps> = ({ 
  safeCount, 
  blockedCount,
  size = 200,
  className = ''
}) => {
  const total = safeCount + blockedCount;
  const safePercentage = total > 0 ? Math.round((safeCount / total) * 100) : 0;
  
  const data = [
    { 
      name: 'Safe', 
      value: safeCount, 
      color: 'hsl(142 76% 36%)', // green-600
      label: `${safeCount.toLocaleString()} safe`
    },
    { 
      name: 'Blocked', 
      value: blockedCount, 
      color: 'hsl(0 84% 60%)', // red-500/destructive
      label: `${blockedCount.toLocaleString()} blocked`
    }
  ];

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
          <p className="text-sm font-semibold">{payload[0].name}</p>
          <p className="text-xs text-muted-foreground">{payload[0].payload.label}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={90}
            endAngle={-270}
            innerRadius="60%"
            outerRadius="85%"
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
            animationDuration={800}
            animationBegin={0}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center text overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="text-3xl sm:text-4xl font-bold text-green-600 dark:text-green-500">
          {safePercentage}%
        </div>
        <div className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">
          Safe
        </div>
      </div>
    </div>
  );
};

export default DonutChart;