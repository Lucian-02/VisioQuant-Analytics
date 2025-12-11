import React, { useEffect, useState, useRef } from 'react';
import { dbService } from './services/dbService';
import { authService } from './services/authService';
import { EvaluationRecord, InputState, CalculatedMetrics, User } from './types';
import InputSection from './components/InputSection';
import HistoryTable from './components/HistoryTable';
import TrendChart from './components/TrendChart';
import ConfirmationModal from './components/ConfirmationModal';
import AuthScreen from './components/AuthScreen';
import { BrainCircuit, LayoutDashboard, Database, Download, Trash, LogOut, Upload, Archive } from 'lucide-react';
import { Language, translations } from './utils/translations';

type ViewMode = 'dashboard' | 'assets';
type ModalConfig = {
  isOpen: boolean;
  type: 'delete' | 'clear';
  targetId?: number;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [records, setRecords] = useState<EvaluationRecord[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [lang, setLang] = useState<Language>('en');
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Modal State
  const [modalConfig, setModalConfig] = useState<ModalConfig>({ isOpen: false, type: 'delete' });

  const t = translations[lang];

  // Initialize: Check session
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  // Load history when user changes
  useEffect(() => {
    if (user) {
      refreshHistory();
    } else {
      setRecords([]);
    }
  }, [user]);

  const refreshHistory = () => {
    if (!user) return;
    const data = dbService.getAll(user.id);
    setRecords(data);
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setCurrentView('dashboard');
  };

  const handleSave = (input: InputState, metrics: CalculatedMetrics) => {
    if (!user) return;

    const gt = parseInt(input.gt_total);
    const tp = parseInt(input.tp);
    const fp = parseInt(input.fp);
    const confidence = parseFloat(input.confidence) || 0;

    // Business Logic: Insert into Persistence Layer with User ID
    dbService.insert({
      userId: user.id,
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

    // Interaction Flow: Toast + Refresh
    showToast(t.toastSaved);
    refreshHistory();
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

  const handleConfirmAction = () => {
    if (!user) return;

    if (modalConfig.type === 'delete' && modalConfig.targetId !== undefined) {
      const success = dbService.delete(modalConfig.targetId);
      if (success) {
        showToast(t.toastDeleted);
        refreshHistory();
      }
    } else if (modalConfig.type === 'clear') {
      const success = dbService.clearAll(user.id);
      if (success) {
        showToast(t.toastCleared);
        refreshHistory();
      }
    }
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  // --- Modal Logic End ---

  // --- Export / Import Logic ---
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
    link.setAttribute('download', `visioquant_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBackup = () => {
    const jsonStr = dbService.exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `visioquant_backup_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(t.toastBackup);
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
            const success = dbService.importBackup(content);
            if (success) {
                showToast(t.toastRestored);
                // Force logout to reload state cleanly
                handleLogout();
            } else {
                showToast(t.toastRestoreFailed);
            }
        }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };
  // -----------------------------

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // If not authenticated, show Auth Screen
  if (!user) {
    return (
      <>
        <AuthScreen onLogin={handleLogin} lang={lang} setLang={setLang} showToast={showToast} />
        {toast && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl shadow-emerald-900/50 flex items-center gap-3 animate-fade-in-up z-50 border border-emerald-400/20">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium text-sm">{toast}</span>
        </div>
      )}
      </>
    );
  }

  // --- Layout Constants ---
  const containerClass = "w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8";

  return (
    <div className="min-h-screen bg-slate-950 pb-28 md:pb-20 font-sans text-slate-200">
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
                    <span className="text-sm font-medium text-indigo-400">{user.username}</span>
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

                 <button
                   onClick={handleLogout}
                   className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                   title={t.logout}
                 >
                    <LogOut size={18} />
                 </button>
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
                <InputSection onSave={handleSave} lang={lang} />

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Left: Summary Table (Last 5 records) */}
                    <div className="xl:col-span-2 flex flex-col h-full min-h-[400px]">
                        <HistoryTable 
                            records={records.slice(0, 5)} 
                            onDelete={initiateDelete} 
                            lang={lang} 
                            title={t.recentHistoryTitle}
                            compact
                        />
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
                                <p className="text-slate-400 text-xs md:text-sm mt-1">Manage, analyze, and export your evaluation history.</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <button 
                                    onClick={handleExportCSV}
                                    disabled={records.length === 0}
                                    className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm rounded-lg border border-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Download size={14} /> <span className="hidden sm:inline">{t.btnExportCsv}</span><span className="sm:hidden">CSV</span>
                                </button>
                                <button 
                                    onClick={initiateClearAll}
                                    disabled={records.length === 0}
                                    className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 text-sm rounded-lg border border-rose-900/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Trash size={14} /> <span className="hidden sm:inline">{t.btnClearAll}</span><span className="sm:hidden">Clear</span>
                                </button>
                            </div>
                        </div>

                        {/* Backup & Restore Section */}
                        <div className="border-t border-slate-800 pt-4 mt-2">
                             <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Database Tools:</span>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <button
                                        onClick={handleBackup}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-md border border-indigo-500/20 transition-all text-xs font-medium"
                                    >
                                        <Archive size={14} /> {t.btnBackup}
                                    </button>
                                    <button
                                        onClick={handleRestoreClick}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-md border border-emerald-500/20 transition-all text-xs font-medium"
                                    >
                                        <Upload size={14} /> {t.btnRestore}
                                    </button>
                                </div>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept=".json" 
                                    onChange={handleFileChange}
                                />
                             </div>
                        </div>
                    </div>
                    
                    <HistoryTable records={records} onDelete={initiateDelete} lang={lang} />
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
        <div className="fixed top-20 right-6 md:top-auto md:bottom-6 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl shadow-emerald-900/50 flex items-center gap-3 animate-fade-in-up z-50 border border-emerald-400/20">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium text-sm">{toast}</span>
        </div>
      )}
    </div>
  );
};

export default App;