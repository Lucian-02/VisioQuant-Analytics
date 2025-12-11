import React from 'react';
import { EvaluationRecord } from '../types';
import { Trash2 } from 'lucide-react';
import { Language, translations } from '../utils/translations';

interface HistoryTableProps {
  records: EvaluationRecord[];
  onDelete: (id: number) => void;
  lang: Language;
  title?: string;
  compact?: boolean;
}

const HistoryTable: React.FC<HistoryTableProps> = ({ records, onDelete, lang, title, compact = false }) => {
  const t = translations[lang];
  const displayTitle = title || t.historyTitle;
  const isZh = lang === 'zh';

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 md:px-6 md:py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 shrink-0 z-10">
        <h3 className="font-semibold text-slate-200 text-sm md:text-base">{displayTitle}</h3>
        <span className="text-[10px] md:text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-full">{records.length} <span className="hidden sm:inline">Records</span></span>
      </div>
      
      {/* Mobile Card View (Vertical List) - Visible only on mobile */}
      <div className="md:hidden flex-1 overflow-y-auto p-3 space-y-3 bg-slate-900/50">
        {records.length === 0 ? (
             <div className="text-center text-slate-600 py-12 text-sm">{t.noHistory}</div>
        ) : (
             records.map(record => (
                <div key={record.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-sm relative group">
                   {/* Top Row: Model + Timestamp */}
                   <div className="flex justify-between items-start mb-3 pr-6">
                      <div className="min-w-0">
                         <div className="font-bold text-slate-200 text-sm truncate">{record.model_name}</div>
                         <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {new Date(record.timestamp).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US', { month:'numeric', day:'numeric', hour:'numeric', minute:'numeric' })}
                         </div>
                      </div>
                   </div>
                   
                   {/* Delete Button (Absolute top-right) */}
                   <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(record.id);
                        }}
                        className="absolute top-3 right-3 text-slate-600 hover:text-rose-500 p-1.5 rounded-lg active:bg-slate-900 transition-colors"
                        title={t.modalDeleteTitle}
                      >
                        <Trash2 size={16} />
                   </button>

                   {/* Key Metrics Grid */}
                   <div className="grid grid-cols-4 gap-2 mb-3">
                       {/* F1 - Highlighted */}
                       <div className="bg-indigo-500/10 rounded-lg py-2 px-1 flex flex-col items-center justify-center border border-indigo-500/20">
                           <span className="text-[9px] text-indigo-300 font-semibold uppercase tracking-wider">F1</span>
                           <span className="text-sm font-bold text-indigo-400">{(record.f1_score * 100).toFixed(0)}</span>
                       </div>
                       {/* Recall */}
                       <div className="bg-slate-900/80 rounded-lg py-2 px-1 flex flex-col items-center justify-center border border-slate-800">
                           <span className="text-[9px] text-slate-500 uppercase tracking-wider">{isZh ? '召回' : 'Rec'}</span>
                           <span className="text-sm font-medium text-emerald-400">{(record.recall * 100).toFixed(0)}%</span>
                       </div>
                       {/* Precision */}
                       <div className="bg-slate-900/80 rounded-lg py-2 px-1 flex flex-col items-center justify-center border border-slate-800">
                           <span className="text-[9px] text-slate-500 uppercase tracking-wider">{isZh ? '精确' : 'Pre'}</span>
                           <span className="text-sm font-medium text-blue-400">{(record.precision * 100).toFixed(0)}%</span>
                       </div>
                        {/* FAR or GT */}
                       <div className="bg-slate-900/80 rounded-lg py-2 px-1 flex flex-col items-center justify-center border border-slate-800">
                           <span className="text-[9px] text-slate-500 uppercase tracking-wider">
                                {compact ? (isZh ? '真值' : 'GT') : (isZh ? '误报' : 'FAR')}
                           </span>
                           <span className={`text-sm font-medium ${compact ? 'text-slate-400' : 'text-rose-400'}`}>
                                {compact ? record.gt_total : (record.far * 100).toFixed(0) + '%'}
                           </span>
                       </div>
                   </div>

                    {/* Metadata Footer (Scenario, Confidence) - Show if not compact */}
                    {!compact && (
                        <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 border-t border-slate-900/80 pt-2.5">
                             <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                                <span className="opacity-70 truncate max-w-[120px]">{record.scenario}</span>
                             </div>
                             {record.confidence > 0 && (
                                <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                                    <span className="opacity-70">{isZh ? '置信度' : 'Conf'}: {record.confidence}</span>
                                </div>
                             )}
                        </div>
                    )}
                </div>
             ))
        )}
      </div>
      
      {/* Desktop Table View - Visible only on md+ */}
      <div className="hidden md:block overflow-x-auto flex-1 custom-scrollbar">
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-slate-950/50 text-slate-500 uppercase text-[10px] md:text-xs font-semibold tracking-wider sticky top-0 z-10 backdrop-blur-sm">
            <tr>
              <th className="px-4 py-2 md:px-6 md:py-3 whitespace-nowrap">{t.tableTimestamp}</th>
              <th className="px-4 py-2 md:px-6 md:py-3 whitespace-nowrap">{t.tableModel}</th>
              {!compact && <th className="px-4 py-2 md:px-6 md:py-3 whitespace-nowrap">{t.tableConfidence}</th>}
              {!compact && <th className="px-4 py-2 md:px-6 md:py-3 whitespace-nowrap">{t.tableScenario}</th>}
              <th className="px-4 py-2 md:px-6 md:py-3 text-center whitespace-nowrap">{t.tableRecall}</th>
              <th className="px-4 py-2 md:px-6 md:py-3 text-center whitespace-nowrap">{t.tablePrecision}</th>
              {!compact && <th className="px-4 py-2 md:px-6 md:py-3 text-center text-rose-400 whitespace-nowrap">{t.tableFar}</th>}
              <th className="px-4 py-2 md:px-6 md:py-3 text-center text-indigo-400 whitespace-nowrap">{t.tableF1}</th>
              <th className="px-4 py-2 md:px-6 md:py-3 text-right whitespace-nowrap">{t.tableAction}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {records.length === 0 ? (
                <tr>
                    <td colSpan={compact ? 6 : 9} className="px-6 py-12 text-center text-slate-600">
                        {t.noHistory}
                    </td>
                </tr>
            ) : (
                records.map((record) => (
                <tr key={record.id} className="hover:bg-slate-800/50 transition-colors group">
                    <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap font-mono text-xs text-slate-500">
                    {new Date(record.timestamp).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap font-medium text-slate-200 text-xs md:text-sm">
                    {record.model_name}
                    </td>
                    {!compact && (
                        <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap font-mono text-xs text-slate-400">
                        {record.confidence !== undefined ? record.confidence : '-'}
                        </td>
                    )}
                    {!compact && (
                      <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap text-slate-400 text-xs">
                      {record.scenario}
                      </td>
                    )}
                    <td className="px-4 py-3 md:px-6 md:py-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 md:px-2.5 rounded-full text-[10px] md:text-xs font-medium bg-emerald-500/10 text-emerald-400">
                            {(record.recall * 100).toFixed(1)}%
                        </span>
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 md:px-2.5 rounded-full text-[10px] md:text-xs font-medium bg-blue-500/10 text-blue-400">
                            {(record.precision * 100).toFixed(1)}%
                        </span>
                    </td>
                    {!compact && (
                        <td className="px-4 py-3 md:px-6 md:py-4 text-center whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-0.5 md:px-2.5 rounded-full text-[10px] md:text-xs font-medium bg-rose-500/10 text-rose-400">
                                {(record.far * 100).toFixed(1)}%
                            </span>
                        </td>
                    )}
                    <td className="px-4 py-3 md:px-6 md:py-4 text-center whitespace-nowrap font-bold text-indigo-300 text-xs md:text-sm">
                    {(record.f1_score * 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap text-right">
                    <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(record.id);
                        }}
                        className="text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 transition-colors p-1.5 md:p-2 rounded-lg active:scale-95"
                        title={t.modalDeleteTitle}
                    >
                        <Trash2 size={16} />
                    </button>
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryTable;