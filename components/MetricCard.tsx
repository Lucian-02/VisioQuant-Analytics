import React from 'react';

interface MetricCardProps {
  label: string;
  value: number;
  isPercent?: boolean;
  color?: 'blue' | 'green' | 'red' | 'indigo' | 'orange';
  subtext?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, isPercent = true, color = 'blue', subtext }) => {
  
  const formattedValue = isPercent 
    ? `${(value * 100).toFixed(2)}%` 
    : value.toLocaleString();

  const colorStyles = {
    blue: 'border-blue-500/30 text-blue-400 bg-blue-500/5',
    green: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5',
    red: 'border-rose-500/30 text-rose-400 bg-rose-500/5',
    indigo: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/5',
    orange: 'border-orange-500/30 text-orange-400 bg-orange-500/5',
  };

  return (
    <div className={`flex flex-col p-4 rounded-xl border ${colorStyles[color]} backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]`}>
      <span className="text-xs font-semibold tracking-wider uppercase opacity-80 mb-1">{label}</span>
      <span className="text-2xl font-bold tracking-tight">{formattedValue}</span>
      {subtext && <span className="text-[10px] opacity-60 mt-1">{subtext}</span>}
    </div>
  );
};

export default MetricCard;