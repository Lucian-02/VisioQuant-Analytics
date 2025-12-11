
import React, { useEffect, useState, useRef } from 'react';
import { dbService } from './services/dbService';
import { EvaluationRecord, InputState, CalculatedMetrics, User } from './types';
import InputSection from './components/InputSection';
import HistoryTable from './components/HistoryTable';
import TrendChart from './components/TrendChart';
import ConfirmationModal from './components/ConfirmationModal';
import { BrainCircuit, LayoutDashboard, Database, Download, Trash, HardDrive, Loader2, CheckCircle2, Upload, FileJson } from 'lucide-react';
import { Language, translations } from './utils/translations';

type ViewMode = 'dashboard' | 'assets';
type ModalConfig = {
  isOpen: boolean;
  type: 'delete' | 'clear';
  targetId?: number;
};

// Static Local User
const LOCAL_USER: User = {
    id: 'local_admin',
    username: 'Local Admin'
};

const App: React.FC = () => {
  const [records, setRecords] = useState<EvaluationRecord[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [lang, setLang] = useState<Language>('en');
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  // File Input Ref for Restore
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State to hold data loaded from history
  const [loadedInputData, setLoadedInputData] = useState<InputState | null>(null);
  
  // Modal State
  const [modalConfig, setModalConfig] = useState<ModalConfig>({ isOpen: false, type: 'delete' });

  const t = translations[lang];

  // Initialize: Load Data on Mount
  useEffect(() => {
    refreshHistory();
  }, []);

  const refreshHistory = async () => {
    setIsLoadingData(true);
    const data = await dbService.getAll();
    setRecords(data);
    setIsLoadingData(false);
  };

  const handleSave = async (input: InputState, metrics: CalculatedMetrics) => {
    const gt = parseInt(input.gt_total);
    const tp = parseInt(input.tp);
    const fp = parseInt(input.fp);
    const confidence = parseFloat(input.confidence) || 0;

    const { data: newRecord, error } = await dbService.insert({
      model_name: input.model_name,
      confidence: confidence,
      scenario: input.scenario,
      gt_total: gt,
      tp: tp,
      fp: fp,
      fn: metrics.fn,
      precision: metrics.precision,
      recall: metrics.recall,
      f1_score: metrics.f1_score,
      far: metrics.far
    });

    if (newRecord) {
        showToast(t.toastSaved);
        refreshHistory();
        setLoadedInputData(null); // Clear loaded state on save
    } else {
        showToast(`Error: ${error}`);
    }
  };

  const handleLoadRecord = (record: EvaluationRecord) => {
      setLoadedInputData({
          model_name: record.model_name,
          confidence: record.confidence?.toString() || '',
          scenario: record.scenario,
          gt_total: record.gt_total.toString(),
          tp: record.tp.toString(),
          fp: record.fp.toString()
      });
      setCurrentView('dashboard'); // Switch to dashboard if not already
      showToast(t.toastLoaded);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Modal Logic Start ---

  const initiateDelete = (id: number) => {
    setModalConfig({
      isOpen: true,
      type: 'delete',
      targetId: id
    });
  };

  const initiateClearAll = () => {
    setModalConfig({
      isOpen: true,
      type: 'clear'
    });
  };

  const handleCancelModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const handleConfirmAction = async () => {
    if (modalConfig.type === 'delete' && modalConfig.targetId !== undefined) {
      const success = await dbService.delete(modalConfig.targetId);
      if (success) {
        showToast(t.toastDeleted);
        refreshHistory();
      }
    } else if (modalConfig.type === 'clear') {
      const success = await dbService.clearAll();
      if (success) {
        showToast(t.toastCleared);
        refreshHistory();
      }
    }
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  // --- Modal Logic End ---

  // --- Export / Backup Logic ---
  
  // 1. Export CSV (Readable)
  const handleExportCSV = () => {
    if (records.length === 0) return;
    const headers = ['ID', 'Timestamp', 'Model', 'Confidence', 'Scenario', 'GT', 'TP', 'FP', 'FN', 'Precision', 'Recall', 'F1', 'FAR'];
    const rows = records.map(r => [
        r.id, r.timestamp, r.model_name, r.confidence !== undefined ? r.confidence : 0,
        r.scenario, r.gt_total, r.tp, r.fp, r.fn, 
        r.precision.toFixed(4), r.recall.toFixed(4), r.f1_score.toFixed(4), r.far.toFixed(4)
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `visioquant_local_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. Backup JSON (Full DB Dump)
  const handleBackupJSON = async () => {
    const data = await dbService.getAll();
    if (data.length === 0) {
        showToast("No data to backup.");
        return;
    }
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `visioquant_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(t.toastBackup);
  };

  // 3. Restore JSON (Import)
  const handleRestoreJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const content = event.target?.result as string;
            const parsedData = JSON.parse(content);
            
            // Basic validation: must be an array
            if (Array.isArray(parsedData)) {
                await dbService.replaceData(parsedData);
                refreshHistory();
                showToast(t.toastRestored);
            } else {
                showToast(t.toastRestoreFailed); // Uses 'warning' style if logic implemented, or error text
            }
        } catch (error) {
            console.error(error);
            showToast(t.toastRestoreFailed);
        }
    };
    reader.readAsText(file);
    // Reset input so same file can be selected again if needed
    e.target.value = '';
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // --- Layout Constants ---
  const containerClass = "w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8";

  return (
    <div className="min-h-screen bg-slate-950 pb-28 md:pb-20 font-sans text-slate-200">
      {/* Hidden File Input for Restore */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleRestoreJSON} 
        accept=".json" 
        className="hidden" 
      />

      {/* Navbar (Desktop + Logo) */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className={containerClass}>
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('dashboard')}>
              <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
                <BrainCircuit className="text-white h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight leading-none">{t.appTitle}</h1>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5 hidden sm:block">{t.appSubtitle}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
               {/* Desktop Navigation */}
               <div className="hidden md:flex items-center gap-1 bg-slate-900/50 p-1 rounded-xl border border-slate-800">
                  <button 
                    onClick={() => setCurrentView('dashboard')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        currentView === 'dashboard' 
                        ? 'bg-slate-800 text-white shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <LayoutDashboard size={16}/> {t.navDashboard}
                  </button>
                  <button 
                    onClick={() => setCurrentView('assets')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        currentView === 'assets' 
                        ? 'bg-slate-800 text-white shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <Database size={16}/> {t.navDataAssets}
                  </button>
               </div>
               
               <div className="flex items-center gap-2 sm:gap-4">
                 <div className="hidden sm:flex flex-col items-end mr-2">
                    <span className="text-xs text-slate-400">{t.welcome}</span>
                    <span className="text-sm font-medium text-indigo-400 flex items-center gap-1">
                        {LOCAL_USER.username} 
                        <span title="Offline Mode">
                            <HardDrive size={12} className="text-emerald-400" />
                        </span>
                    </span>
                 </div>

                 {/* Language Switcher */}
                 <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
                    <button 
                      onClick={() => setLang('zh')} 
                      className={`px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-medium rounded-md transition-all ${lang === 'zh' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      中
                    </button>
                    <button 
                      onClick={() => setLang('en')} 
                      className={`px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-medium rounded-md transition-all ${lang === 'en' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      EN
                    </button>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className={`${containerClass} pt-6 md:pt-8 animate-fade-in`}>
        
        {currentView === 'dashboard' ? (
            <>
                {/* Dashboard View */}
                <InputSection onSave={handleSave} lang={lang} initialData={loadedInputData} />

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Left: Summary Table (Last 5 records) */}
                    <div className="xl:col-span-2 flex flex-col h-full min-h-[400px]">
                        {isLoadingData ? (
                             <div className="flex-1 flex items-center justify-center bg-slate-900 rounded-2xl border border-slate-800">
                                <Loader2 className="animate-spin text-indigo-500" size={32} />
                             </div>
                        ) : (
                            <HistoryTable 
                                records={records.slice(0, 5)} 
                                onDelete={initiateDelete} 
                                onLoad={handleLoadRecord}
                                lang={lang} 
                                title={t.recentHistoryTitle}
                                compact
                            />
                        )}
                        {records.length > 5 && (
                            <div className="mt-4 text-center">
                                <button 
                                    onClick={() => setCurrentView('assets')}
                                    className="text-indigo-400 hover:text-indigo-300 text-sm font-medium hover:underline transition-all"
                                >
                                    {t.viewAll}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right: Trend Chart */}
                    <div className="xl:col-span-1 h-full">
                        <TrendChart records={records} lang={lang} />
                    </div>
                </div>
            </>
        ) : (
            <>
                {/* Data Assets View */}
                <div className="flex flex-col space-y-6">
                    <div className="flex flex-col gap-4 bg-slate-900/50 p-4 md:p-6 rounded-2xl border border-slate-800">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">{t.assetsTitle}</h2>
                                <p className="text-slate-400 text-xs md:text-sm mt-1">
                                    {lang === 'zh' ? '数据仅存储在您的浏览器本地。' : 'Data is stored locally in your browser.'}
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                {/* Backup (JSON) */}
                                <button 
                                    onClick={handleBackupJSON}
                                    disabled={records.length === 0}
                                    className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg border border-indigo-500/50 shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={t.btnBackup}
                                >
                                    <FileJson size={14} /> <span className="hidden sm:inline">{t.btnBackup}</span><span className="sm:hidden">Backup</span>
                                </button>
                                
                                {/* Restore (JSON) */}
                                <button 
                                    onClick={triggerFileUpload}
                                    className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg border border-slate-600 transition-all"
                                    title={t.btnRestore}
                                >
                                    <Upload size={14} /> <span className="hidden sm:inline">{t.btnRestore}</span><span className="sm:hidden">Restore</span>
                                </button>

                                {/* Export (CSV) */}
                                <button 
                                    onClick={handleExportCSV}
                                    disabled={records.length === 0}
                                    className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm rounded-lg border border-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Download size={14} /> <span className="hidden sm:inline">{t.btnExportCsv}</span><span className="sm:hidden">CSV</span>
                                </button>

                                <div className="w-px h-6 bg-slate-800 mx-1 hidden md:block"></div>

                                {/* Clear All */}
                                <button 
                                    onClick={initiateClearAll}
                                    disabled={records.length === 0}
                                    className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 text-sm rounded-lg border border-rose-900/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Trash size={14} /> <span className="hidden sm:inline">{t.btnClearAll}</span><span className="sm:hidden">Clear</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {isLoadingData ? (
                        <div className="h-64 flex items-center justify-center">
                            <Loader2 className="animate-spin text-indigo-500" size={32} />
                        </div>
                    ) : (
                        <HistoryTable records={records} onDelete={initiateDelete} onLoad={handleLoadRecord} lang={lang} />
                    )}
                </div>
            </>
        )}

      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 px-6 py-3 z-40 pb-safe">
        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all ${
                currentView === 'dashboard' 
                ? 'text-indigo-400 bg-indigo-500/10' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <LayoutDashboard size={22} className={currentView === 'dashboard' ? 'stroke-[2.5px]' : ''} />
            <span className="text-[10px] font-medium">{t.navDashboard}</span>
          </button>
          
          <button 
            onClick={() => setCurrentView('assets')}
            className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all ${
                currentView === 'assets' 
                ? 'text-indigo-400 bg-indigo-500/10' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Database size={22} className={currentView === 'assets' ? 'stroke-[2.5px]' : ''} />
            <span className="text-[10px] font-medium">{t.navDataAssets}</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.type === 'delete' ? t.modalDeleteTitle : t.modalClearTitle}
        message={modalConfig.type === 'delete' ? t.confirmDelete : t.confirmClearAll}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelModal}
        confirmLabel={t.modalConfirm}
        cancelLabel={t.modalCancel}
        isDangerous={true}
      />

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-20 right-6 md:top-auto md:bottom-6 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in-up z-50 border ${toast.includes('Error') || toast.includes('Failed') ? 'bg-rose-600 border-rose-400/20' : 'bg-emerald-600 border-emerald-400/20'} text-white`}>
           {toast.includes('Error') || toast.includes('Failed') ? null : <CheckCircle2 size={18} />}
          <span className="font-medium text-sm">{toast}</span>
        </div>
      )}
    </div>
  );
};

export default App;
