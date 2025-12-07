
import React, { useState, useEffect, useMemo } from 'react';
import { extractTransactionsFromPDF } from './services/geminiService';
import { exportToExcel } from './services/exportService';
import { Transaction, ProcessingStats, BankStatement } from './types';
import { FileUpload } from './components/FileUpload';
import { TransactionTable } from './components/TransactionTable';
import { StatsCards } from './components/StatsCards';
import { FileTabs } from './components/FileTabs';
import { DownloadIcon, MoonIcon, SunIcon } from './components/Icons';

function App() {
  // Main State
  const [statements, setStatements] = useState<BankStatement[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('ALL');
  
  // UI State
  const [darkMode, setDarkMode] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Initialize Theme
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Handle File Uploads
  const handleFiles = async (files: File[]) => {
    setGlobalError(null);
    
    // Create placeholders for UI immediate feedback
    const newStatements: BankStatement[] = files.map(f => ({
      id: crypto.randomUUID(),
      fileName: f.name,
      transactions: [],
      status: 'processing',
      uploadDate: new Date().toISOString()
    }));

    // Add to state
    setStatements(prev => [...prev, ...newStatements]);
    
    // If we were on ALL or empty, switch to ALL, otherwise stay. 
    if (files.length === 1) {
      setActiveTabId(newStatements[0].id);
    }

    // Process each file
    files.forEach(async (file, index) => {
      const statementId = newStatements[index].id;
      
      try {
        // Using a generic context since user selection is removed
        const txns = await extractTransactionsFromPDF(file, "Relevé Bancaire Standard");
        
        setStatements(prev => prev.map(s => 
          s.id === statementId 
            ? { ...s, transactions: txns, status: 'ready' } 
            : s
        ));
      } catch (err: any) {
        setStatements(prev => prev.map(s => 
          s.id === statementId 
            ? { ...s, status: 'error', error: err.message || "Erreur d'extraction" } 
            : s
        ));
      }
    });
  };

  // Derive Displayed Transactions based on Active Tab
  const displayedTransactions = useMemo(() => {
    if (activeTabId === 'ALL') {
      // Merge all 'ready' transactions
      return statements
        .filter(s => s.status === 'ready')
        .flatMap(s => s.transactions);
    } else {
      const stmt = statements.find(s => s.id === activeTabId);
      return stmt && stmt.status === 'ready' ? stmt.transactions : [];
    }
  }, [statements, activeTabId]);

  // Derive Stats
  const stats: ProcessingStats = useMemo(() => {
    const totalDebit = displayedTransactions.reduce((sum, t) => sum + (t.debit || 0), 0);
    const totalCredit = displayedTransactions.reduce((sum, t) => sum + (t.credit || 0), 0);
    return {
      totalTransactions: displayedTransactions.length,
      totalDebit,
      totalCredit,
      balance: totalCredit - totalDebit
    };
  }, [displayedTransactions]);

  const updateTransaction = (id: string, field: keyof Transaction, value: any) => {
    setStatements(prevStatements => prevStatements.map(stmt => {
      // Optimization: Only try to update if the statement likely contains this transaction 
      // (checking if we are in ALL mode or specific mode)
      
      const hasTransaction = stmt.transactions.some(t => t.id === id);
      if (!hasTransaction) return stmt;

      const updatedTransactions = stmt.transactions.map(t => {
        if (t.id === id) {
          const updated = { ...t, [field]: value };
          
          if (field === 'date') {
            const regex = /^\d{2}\/\d{2}\/\d{4}$/;
            updated.isValid = regex.test(value);
          }
          
          // Mutual exclusion logic
          if (field === 'debit' && value && value > 0) updated.credit = null;
          if (field === 'credit' && value && value > 0) updated.debit = null;
          
          return updated;
        }
        return t;
      });

      return { ...stmt, transactions: updatedTransactions };
    }));
  };

  const deleteTransaction = (id: string) => {
    setStatements(prev => prev.map(stmt => ({
      ...stmt,
      transactions: stmt.transactions.filter(t => t.id !== id)
    })));
  };

  const deleteStatement = (id: string) => {
    if (confirm("Supprimer ce fichier et ses données ?")) {
      setStatements(prev => prev.filter(s => s.id !== id));
      if (activeTabId === id) {
        setActiveTabId('ALL');
      }
    }
  };

  const handleExport = () => {
    if (displayedTransactions.length === 0) return;
    
    let filename = "Export_Bancaire";
    if (activeTabId !== 'ALL') {
      const stmt = statements.find(s => s.id === activeTabId);
      if (stmt) {
        // Strip extension
        filename = stmt.fileName.replace(/\.[^/.]+$/, "");
      }
    } else {
      filename = `Consolidé_${new Date().toISOString().slice(0, 10)}`;
    }

    exportToExcel(displayedTransactions, filename);
  };

  // Determine current view status for UI feedback
  const currentStatement = statements.find(s => s.id === activeTabId);
  const isCurrentProcessing = currentStatement?.status === 'processing';
  const isAnyProcessing = statements.some(s => s.status === 'processing');
  const currentError = currentStatement?.error;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200 font-sans pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">
              G
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
              GROUPE RASMAL MADE BY MAISSINE
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors"
            >
              {darkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Global Error Banner */}
        {globalError && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>{globalError}</span>
            <button onClick={() => setGlobalError(null)} className="text-sm underline">Fermer</button>
          </div>
        )}

        {/* Upload Section */}
        <div className="mb-8">
            <div className={`transition-all duration-300 ${statements.length > 0 ? 'bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm' : ''}`}>
                 {statements.length > 0 && <h2 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Ajouter des fichiers</h2>}
                 <FileUpload 
                    onFileSelect={handleFiles} 
                    isLoading={isAnyProcessing} 
                 />
            </div>
        </div>

        {/* Main Content Area */}
        {statements.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Tabs */}
            <FileTabs 
              statements={statements} 
              activeId={activeTabId} 
              onSelect={setActiveTabId}
              onDelete={deleteStatement}
            />

            {/* Toolbar & Title */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {activeTabId === 'ALL' ? 'Données Consolidées' : (currentStatement?.fileName || 'Fichier')}
                </h2>
                <p className="text-sm text-slate-500">
                    {activeTabId === 'ALL' 
                        ? 'Affichage de toutes les transactions fusionnées.' 
                        : `Importé le ${new Date(currentStatement?.uploadDate || '').toLocaleString()}`
                    }
                </p>
              </div>

              {displayedTransactions.length > 0 && (
                  <button
                    onClick={handleExport}
                    className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <DownloadIcon className="w-5 h-5 mr-2" />
                    Exporter {activeTabId === 'ALL' ? 'Tout' : 'Fichier'}
                  </button>
              )}
            </div>

            {/* Error in specific tab */}
            {currentError && (
                 <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-6 py-8 rounded-lg text-center">
                    <p className="font-semibold mb-2">Erreur lors de l'analyse du fichier.</p>
                    <p className="text-sm">{currentError}</p>
                 </div>
            )}

            {/* Loading State for specific tab */}
            {isCurrentProcessing ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                    <p className="text-slate-500 animate-pulse">Extraction des données en cours...</p>
                </div>
            ) : (
                /* Data View */
                displayedTransactions.length > 0 ? (
                    <>
                        <StatsCards stats={stats} />
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                            <TransactionTable 
                                transactions={displayedTransactions} 
                                onUpdate={updateTransaction} 
                                onDelete={deleteTransaction} 
                            />
                        </div>
                    </>
                ) : (
                    !currentError && (
                        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500">
                            Aucune transaction à afficher pour le moment.
                        </div>
                    )
                )
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
