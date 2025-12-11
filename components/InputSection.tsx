
import React, { useEffect, useState } from 'react';
import { InputState, CalculatedMetrics, ValidationResult } from '../types';
import { calculateMetrics, validateInput } from '../services/calcService';
import { Save, AlertTriangle, AlertOctagon, RotateCcw } from 'lucide-react';
import MetricCard from './MetricCard';
import PerformanceRadar from './PerformanceRadar';
import { Language, translations } from '../utils/translations';

interface InputSectionProps {
  onSave: (data: InputState, metrics: CalculatedMetrics) => void;
  lang: Language;
  initialData?: InputState | null; // Support loading from history
}

const initialInputState: InputState = {
  model_name: '',
  confidence: '',
  scenario: 'Default_Env_01',
  gt_total: '',
  tp: '',
  fp: ''
};

const InputSection: React.FC<InputSectionProps> = ({ onSave, lang, initialData }) => {
  const [form, setForm] = useState<InputState>(initialInputState);
  const [metrics, setMetrics] = useState<CalculatedMetrics | null>(null);
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true, hardError: null, softWarning: null });
  
  const t = translations[lang];

  // Handle external data load
  useEffect(() => {
    if (initialData) {
        setForm(initialData);
    }
  }, [initialData]);

  // Watch for changes and calculate/validate
  useEffect(() => {
    const gt = parseInt(form.gt_total) || 0;
    const tp = parseInt(form.tp) || 0;
    const fp = parseInt(form.fp) || 0;

    const valResult = validateInput(gt, tp, fp);
    setValidation(valResult);

    if (valResult.isValid) {
        // Only calculate if we have at least one valid input to avoid empty 0 metrics on reset
        if (form.gt_total !== '' || form.tp !== '' || form.fp !== '') {
             setMetrics(calculateMetrics(gt, tp, fp));
        } else {
             setMetrics(null);
        }
    } else {
      setMetrics(null);
    }
  }, [form]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSaveClick = () => {
    if (validation.isValid && metrics && form.model_name) {
      onSave(form, metrics);
      // Keep context (model, confidence, scenario), clear numbers
      setForm({ 
          ...initialInputState, 
          model_name: form.model_name, 
          confidence: form.confidence,
          scenario: form.scenario 
      }); 
    }
  };

  const handleReset = () => {
    setForm(initialInputState);
  };

  // Helper to safely get translation for error keys
  const getErrorText = (key: string | null) => {
    if (!key) return null;
    return (t as any)[key] || key;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
      {/* Input Column */}
      <div className="xl:col-span-4 space-y-4 bg-slate-900/50 p-4 md:p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
        <div className="space-y-4">
            <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <span className="w-1 h-5 bg-indigo-500 rounded-full"></span>
            {t.inputTitle}
            </h2>
            
            <div className="grid grid-cols-1 gap-3 md:gap-4">
            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">{t.modelName}</label>
                <input
                name="model_name"
                value={form.model_name}
                onChange={handleChange}
                placeholder="e.g. YOLOv8-Nano-v2"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">{t.modelConfidence}</label>
                    <input
                    name="confidence"
                    value={form.confidence}
                    onChange={handleChange}
                    placeholder="0.0 - 1.0"
                    type="number"
                    step="0.01"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">{t.scenario}</label>
                    <input
                    name="scenario"
                    value={form.scenario}
                    onChange={handleChange}
                    placeholder="Env_01"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 text-center">{t.gt}</label>
                <input
                    type="number"
                    name="gt_total"
                    value={form.gt_total}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-sm text-white text-center font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                />
                </div>
                <div>
                <label className="block text-xs font-medium text-emerald-400 mb-1 text-center">{t.tp}</label>
                <input
                    type="number"
                    name="tp"
                    value={form.tp}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-emerald-500/50 rounded-lg px-2 py-2 text-sm text-white text-center font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                </div>
                <div>
                <label className="block text-xs font-medium text-rose-400 mb-1 text-center">{t.fp}</label>
                <input
                    type="number"
                    name="fp"
                    value={form.fp}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-rose-500/50 rounded-lg px-2 py-2 text-sm text-white text-center font-mono focus:ring-2 focus:ring-rose-500 outline-none"
                />
                </div>
            </div>
            </div>

            {/* Validation Messages */}
            <div className="min-h-[40px] flex items-center justify-center">
                {!validation.isValid && validation.hardError && (
                <div className="flex items-center gap-2 text-rose-400 bg-rose-950/30 px-3 py-2 rounded-lg border border-rose-900 text-xs w-full justify-center">
                    <AlertOctagon size={16} />
                    {getErrorText(validation.hardError)}
                </div>
                )}
                {validation.isValid && validation.softWarning && (
                <div className="flex items-center gap-2 text-amber-400 bg-amber-950/30 px-3 py-2 rounded-lg border border-amber-900 text-xs w-full justify-center">
                <AlertTriangle size={16} />
                {getErrorText(validation.softWarning)}
                </div>
                )}
            </div>
        </div>

        <div className="flex gap-3 mt-2 md:mt-4">
            <button 
                onClick={handleReset}
                className="flex-1 py-2 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
                <RotateCcw size={16} /> {t.reset}
            </button>
            <button 
                onClick={handleSaveClick}
                disabled={!validation.isValid || !form.model_name || !metrics}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-all
                    ${(!validation.isValid || !form.model_name || !metrics) 
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'}`}
            >
                <Save size={16} /> {t.save}
            </button>
        </div>
      </div>

      {/* Real-time Preview Column */}
      <div className="xl:col-span-8 flex flex-col h-full space-y-4">
        <h2 className="text-lg font-medium text-white flex items-center gap-2 px-1">
          <span className="w-1 h-5 bg-emerald-500 rounded-full"></span>
          {t.livePreview}
        </h2>
        
        {metrics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
                {/* Metrics Cards Grid - Spans 2 cols on LG */}
                <div className="md:col-span-2 lg:col-span-2 grid grid-cols-2 gap-3 h-full content-start">
                    <MetricCard label={t.metricPrecision} value={metrics.precision} color="blue" subtext={t.subAntiInterference} />
                    <MetricCard label={t.metricRecall} value={metrics.recall} color="green" subtext={t.subCoverage} />
                    <MetricCard label={t.metricF1} value={metrics.f1_score} color="indigo" subtext={t.subHarmonic} />
                    <MetricCard label={t.metricFar} value={metrics.far} color="red" subtext={t.subFalseAlarm} />
                    
                    {/* Secondary Derived stats */}
                    <div className="col-span-2 grid grid-cols-3 gap-3 mt-1">
                        <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800 text-center flex flex-col justify-center">
                            <span className="block text-slate-500 text-[10px] uppercase mb-1">{t.calcFn}</span>
                            <span className="text-xl font-mono text-slate-300">{metrics.fn}</span>
                        </div>
                        <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800 text-center flex flex-col justify-center">
                            <span className="block text-slate-500 text-[10px] uppercase mb-1">{t.totalPred}</span>
                            <span className="text-xl font-mono text-slate-300">{parseInt(form.tp) + parseInt(form.fp)}</span>
                        </div>
                        <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800 text-center flex flex-col justify-center">
                            <span className="block text-slate-500 text-[10px] uppercase mb-1">{t.successRate}</span>
                            <span className="text-xl font-mono text-emerald-400">
                            { parseInt(form.gt_total) > 0 ? ((parseInt(form.tp) / parseInt(form.gt_total)) * 100).toFixed(1) + '%' : '0%'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Radar Chart - Spans 1 col */}
                <div className="md:col-span-2 lg:col-span-1 h-full min-h-[300px]">
                    <PerformanceRadar metrics={metrics} lang={lang} />
                </div>
            </div>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/20 p-8 md:p-12 min-h-[200px] md:min-h-[300px]">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 text-slate-600">
                    <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <p className="text-slate-500 font-medium text-sm md:text-base">{t.enterValid}</p>
                <p className="text-slate-600 text-xs md:text-sm mt-1">{t.awaitingInput}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default InputSection;
