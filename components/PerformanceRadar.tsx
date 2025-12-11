
import React from 'react';
import { CalculatedMetrics } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Language, translations } from '../utils/translations';
import { ScanEye } from 'lucide-react';

interface PerformanceRadarProps {
  metrics: CalculatedMetrics;
  lang: Language;
}

const PerformanceRadar: React.FC<PerformanceRadarProps> = ({ metrics, lang }) => {
  const t = translations[lang];

  // Prepare data for the 5-axis radar
  // 1. Precision
  // 2. Recall
  // 3. F1
  // 4. Anti-Noise (1 - FAR): How good is it at rejecting backgrounds?
  // 5. Efficiency (TP / Total Predictions): How much of the output is useful?
  
  const totalPred = (metrics.precision > 0 && metrics.recall > 0) ? (metrics.recall * 100) : 1; // Simplified proxy if needed, but better to use TP/TP+FP from metrics logic if available. 
  // Actually, we only have ratios in CalculatedMetrics. 
  // Let's use FAR's complement. 
  const antiNoise = Math.max(0, 1 - metrics.far);
  
  // For the 5th dimension, let's use the Geometric Mean of Precision and Recall (G-Mean) often used in imbalanced datasets
  const gMean = Math.sqrt(metrics.precision * metrics.recall);

  const data = [
    { subject: t.radarPrecision, A: parseFloat((metrics.precision * 100).toFixed(1)), fullMark: 100 },
    { subject: t.radarRecall, A: parseFloat((metrics.recall * 100).toFixed(1)), fullMark: 100 },
    { subject: t.radarF1, A: parseFloat((metrics.f1_score * 100).toFixed(1)), fullMark: 100 },
    { subject: t.radarAntiNoise, A: parseFloat((antiNoise * 100).toFixed(1)), fullMark: 100 },
    { subject: t.radarEfficiency, A: parseFloat((gMean * 100).toFixed(1)), fullMark: 100 },
  ];

  return (
    <div className="bg-slate-900/40 rounded-xl border border-slate-800 p-4 flex flex-col items-center justify-center relative overflow-hidden h-full min-h-[300px]">
        <div className="absolute top-3 left-3 flex items-center gap-2 text-indigo-400">
            <ScanEye size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">{t.radarTitle}</span>
        </div>

        <div className="w-full h-[260px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="Model Performance"
                        dataKey="A"
                        stroke="#818cf8"
                        strokeWidth={2}
                        fill="#6366f1"
                        fillOpacity={0.4}
                    />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', fontSize: '12px' }}
                        itemStyle={{ color: '#818cf8' }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    </div>
  );
};

export default PerformanceRadar;
