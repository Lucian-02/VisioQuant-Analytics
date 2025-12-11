import React from 'react';
import { EvaluationRecord } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Language, translations } from '../utils/translations';

interface TrendChartProps {
  records: EvaluationRecord[];
  lang: Language;
}

const TrendChart: React.FC<TrendChartProps> = ({ records, lang }) => {
  const t = translations[lang];

  // Reverse records for chart (Oldest -> Newest)
  const chartData = [...records].reverse().map(r => ({
    name: r.model_name.length > 10 ? r.model_name.substring(0, 10) + '...' : r.model_name,
    f1: parseFloat((r.f1_score * 100).toFixed(2)),
    recall: parseFloat((r.recall * 100).toFixed(2)),
    precision: parseFloat((r.precision * 100).toFixed(2)),
    fullDate: new Date(r.timestamp).toLocaleTimeString()
  }));

  if (records.length < 2) {
    return (
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 h-[400px] flex flex-col items-center justify-center text-slate-500">
         <span className="text-4xl mb-2 opacity-30">📉</span>
         <p>{t.trendNeedData}</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 h-full min-h-[400px]">
      <h3 className="font-semibold text-slate-200 mb-6 flex items-center gap-2">
         <span className="w-1 h-5 bg-purple-500 rounded-full"></span>
         {t.trendTitle}
      </h3>
      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} tickLine={false} />
            <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                itemStyle={{ color: '#e2e8f0' }}
            />
            <Legend />
            <Line type="monotone" dataKey="f1" name={t.tableF1} stroke="#818cf8" strokeWidth={3} activeDot={{ r: 8 }} dot={{fill: '#818cf8'}} />
            <Line type="monotone" dataKey="recall" name={t.tableRecall} stroke="#34d399" strokeWidth={2} dot={false} strokeDasharray="5 5" />
            <Line type="monotone" dataKey="precision" name={t.tablePrecision} stroke="#60a5fa" strokeWidth={2} dot={false} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendChart;