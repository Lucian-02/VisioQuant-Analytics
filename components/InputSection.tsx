
import React, { useEffect, useState } from 'react';
import { InputState, CalculatedMetrics, ValidationResult } from '../types';
import { calculateMetrics, validateInput } from '../services/calcService';
import { Save, AlertOctagon, RotateCcw, Settings2, BarChart3, Layers, Zap, Activity } from 'lucide-react';
import MetricCard from './MetricCard';
import PerformanceRadar from './PerformanceRadar';
import { Language, translations } from '../utils/translations';

interface InputSectionProps {
  onSave: (data: InputState, metrics: CalculatedMetrics) => void;
  lang: Language;
  initialData?: InputState | null;
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
  
  // Modes: basic (Count) | spatial (S/M/L)
  const [inputMode, setInputMode] = useState<'basic' | 'spatial'>('basic');
  
  // Breakdown states
  const [spatialBreakdown, setSpatialBreakdown] = useState({ s: '', m: '', l: '' });
  
  const t = translations[lang];

  useEffect(() => {
    if (initialData) {
        setForm(initialData);
        setInputMode('basic');
    }
  }, [initialData]);

  // Handle Spatial Sync
  useEffect(() => {
    if (inputMode === 'spatial') {
      const sum = (parseInt(spatialBreakdown.s) || 0) + (parseInt(spatialBreakdown.m) || 0) + (parseInt(spatialBreakdown.l) || 0);
      setForm(prev => ({ ...prev, gt_total: sum > 0 ? sum.toString() : '' }));
    }
  }, [spatialBreakdown, inputMode]);

  // Main metrics calculation effect
  useEffect(() => {
    const gt = parseFloat(form.gt_total) || 0;
    const tp = parseFloat(form.tp) || 0;
    const fp = parseFloat(form.fp) || 0;

    const valResult = validateInput(gt, tp, fp);
    setValidation(valResult);

    if (valResult.isValid) {
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

  const handleSpatialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSpatialBreakdown({ ...spatialBreakdown, [e.target.name]: e.target.value });
  };

  const handleSaveClick = () => {
    if (validation.isValid && metrics && form.model_name) {
      onSave(form, metrics);
      setForm({ ...initialInputState, model_name: form.model_name });
      setSpatialBreakdown({ s: '', m: '', l: '' });
    }
  };

  const toggleMode = () => {
      setInputMode(inputMode === 'basic' ? 'spatial' : 'basic');
  };

  // Helper for spatial bars
  const totalSpat = (parseInt(spatialBreakdown.s) || 0) + (parseInt(spatialBreakdown.m) || 0) + (parseInt(spatialBreakdown.l) || 0);
  const getSpatWidth = (val: string) => totalSpat > 0 ? `${((parseInt(val) || 0) / totalSpat) * 100}%` : '0%';

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
      {/* Input Column */}
      <div className="xl:col-span-4 space-y-4 bg-slate-900/50 p-4 md:p-6 rounded-2xl border border-slate-800 flex flex-col">
        <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-medium text-white flex items-center gap-2">
                <span className="w-1 h-5 bg-indigo-500 rounded-full"></span>
                {t.inputTitle}
            </h2>
            <button 
                onClick={toggleMode}
                className={`p-1.5 rounded-lg transition-all flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200 active:scale-95 shadow-sm`}
            >
                <Settings2 size={12} />
                {inputMode === 'basic' ? t.gtModeBasic : t.gtModeAdvanced}
            </button>
        </div>
        
        <div className="space-y-4 flex-1">
            {/* Metadata inputs */}
            <div className="grid grid-cols-1 gap-3">
                <input
                    name="model_name"
                    value={form.model_name}
                    onChange={handleChange}
                    placeholder={t.modelName}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <div className="grid grid-cols-2 gap-3">
                    <input
                        name="confidence"
                        value={form.confidence}
                        onChange={handleChange}
                        type="number"
                        placeholder={t.modelConfidence}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono outline-none"
                    />
                    <input
                        name="scenario"
                        value={form.scenario}
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none"
                    />
                </div>
            </div>

            {/* GT Logic Area */}
            <div className={`bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-4 min-h-[140px] flex flex-col justify-center`}>
                {inputMode === 'basic' ? (
                    <div className="animate-in fade-in duration-300">
                        <label className="text-[10px] font-bold text-slate-500 mb-2 block uppercase">{t.gt}</label>
                        <input
                            type="number"
                            name="gt_total"
                            value={form.gt_total}
                            onChange={handleChange}
                            placeholder="0"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-3 text-2xl font-mono text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                ) : (
                    <div className="animate-in slide-in-from-right-2 fade-in duration-300 space-y-3">
                        <label className="text-[10px] font-bold text-indigo-400 mb-1 block uppercase flex items-center gap-1">
                            <Layers size={12} /> {t.gtDimensionScale}
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            <input name="s" value={spatialBreakdown.s} onChange={handleSpatialChange} placeholder="Small" className="bg-slate-900 border border-slate-700 rounded p-2 text-center text-xs font-mono text-white" />
                            <input name="m" value={spatialBreakdown.m} onChange={handleSpatialChange} placeholder="Med" className="bg-slate-900 border border-slate-700 rounded p-2 text-center text-xs font-mono text-white" />
                            <input name="l" value={spatialBreakdown.l} onChange={handleSpatialChange} placeholder="Large" className="bg-slate-900 border border-slate-700 rounded p-2 text-center text-xs font-mono text-white" />
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full flex overflow-hidden">
                            <div style={{ width: getSpatWidth(spatialBreakdown.s) }} className="bg-indigo-500 h-full transition-all"></div>
                            <div style={{ width: getSpatWidth(spatialBreakdown.m) }} className="bg-blue-500 h-full border-l border-slate-950 transition-all"></div>
                            <div style={{ width: getSpatWidth(spatialBreakdown.l) }} className="bg-emerald-500 h-full border-l border-slate-950 transition-all"></div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] px-1 pt-1">
                            <span className="text-slate-500">{t.autoSum}:</span>
                            <span className="text-white font-mono font-bold">{form.gt_total || 0}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Performance Inputs */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] font-bold text-emerald-500/80 mb-1.5 block uppercase flex items-center gap-1.5">
                        <Activity size={12} /> {t.tp}
                    </label>
                    <input
                        type="number"
                        name="tp"
                        value={form.tp}
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-emerald-500/30 rounded-lg px-3 py-2 text-lg text-white font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-rose-500/80 mb-1.5 block uppercase flex items-center gap-1.5">
                        <Zap size={12} /> {t.fp}
                    </label>
                    <input
                        type="number"
                        name="fp"
                        value={form.fp}
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-rose-500/30 rounded-lg px-3 py-2 text-lg text-white font-mono focus:ring-2 focus:ring-rose-500 outline-none"
                    />
                </div>
            </div>

            {!validation.isValid && validation.hardError && (
                <div className="flex items-center gap-2 text-rose-400 bg-rose-950/20 px-3 py-2 rounded-lg border border-rose-900/40 text-[10px] animate-pulse">
                    <AlertOctagon size={14} />
                    {translations[lang][validation.hardError as keyof typeof translations['en']]}
                </div>
            )}
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-800 mt-auto">
            <button onClick={() => { setForm(initialInputState); setSpatialBreakdown({s:'', m:'', l:''}) }} className="flex-1 py-2 rounded-lg border border-slate-700 text-slate-500 hover:text-slate-200 flex items-center justify-center gap-2 text-xs">
                <RotateCcw size={14} /> {t.reset}
            </button>
            <button 
                onClick={handleSaveClick}
                disabled={!validation.isValid || !form.model_name || !metrics}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 font-bold text-xs transition-all ${(!validation.isValid || !form.model_name || !metrics) ? 'bg-slate-800 text-slate-600 opacity-50' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/10'}`}
            >
                <Save size={14} /> {t.save}
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
                <div className="md:col-span-2 lg:col-span-2 grid grid-cols-2 gap-3 h-full content-start">
                    <MetricCard label={t.metricPrecision} value={metrics.precision} color="blue" subtext={t.subAntiInterference} />
                    <MetricCard label={t.metricRecall} value={metrics.recall} color="green" subtext={t.subCoverage} />
                    <MetricCard label={t.metricF1} value={metrics.f1_score} color="indigo" subtext={t.subHarmonic} />
                    <MetricCard label={t.metricFar} value={metrics.far} color="red" subtext={t.subFalseAlarm} />
                    
                    <div className="col-span-2 grid grid-cols-3 gap-3 mt-1">
                        <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800 text-center flex flex-col justify-center">
                            <span className="block text-slate-500 text-[9px] uppercase mb-1">{t.calcFn}</span>
                            <span className="text-xl font-mono text-slate-300">
                                {metrics.fn}
                            </span>
                        </div>
                        <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800 text-center flex flex-col justify-center">
                            <span className="block text-slate-500 text-[9px] uppercase mb-1">{t.totalPred}</span>
                            <span className="text-xl font-mono text-slate-300">
                                {(parseInt(form.tp) || 0) + (parseInt(form.fp) || 0)}
                            </span>
                        </div>
                        <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800 text-center flex flex-col justify-center overflow-hidden">
                            <span className="block text-slate-500 text-[9px] uppercase mb-1">{t.successRate}</span>
                            <span className="text-xl font-mono text-emerald-400">
                                {(parseFloat(form.gt_total) || 0) > 0 ? (((parseFloat(form.tp) || 0) / (parseFloat(form.gt_total) || 1)) * 100).toFixed(1) + '%' : '0%'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 lg:col-span-1 h-full min-h-[300px]">
                    <PerformanceRadar metrics={metrics} lang={lang} />
                </div>
            </div>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/20 p-8 md:p-12 min-h-[200px] md:min-h-[300px]">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 text-slate-600">
                    <BarChart3 size={32} />
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
