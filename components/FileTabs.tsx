import React from 'react';
import { BankStatement } from '../types';
import { TrashIcon } from './Icons';

interface Props {
  statements: BankStatement[];
  activeId: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export const FileTabs: React.FC<Props> = ({ statements, activeId, onSelect, onDelete }) => {
  // Calculate total transactions
  const totalTransactions = statements.reduce((acc, s) => acc + s.transactions.length, 0);

  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-2 mb-4 scrollbar-thin">
      {/* Global View Tab */}
      <button
        onClick={() => onSelect('ALL')}
        className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
          activeId === 'ALL'
            ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-md transform scale-105'
            : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700'
        }`}
      >
        <span className="flex items-center gap-2">
          Vue Globale
          {statements.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeId === 'ALL' 
                ? 'bg-white/20 text-white dark:bg-slate-200 dark:text-slate-900' 
                : 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400'
            }`}>
              {totalTransactions}
            </span>
          )}
        </span>
      </button>

      {/* Separator */}
      {statements.length > 0 && (
        <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-2 flex-shrink-0"></div>
      )}

      {/* Individual File Tabs */}
      {statements.map((stmt) => (
        <div
          key={stmt.id}
          className={`group flex items-center flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border cursor-pointer ${
            activeId === stmt.id
              ? 'border-primary bg-primary/5 text-primary dark:border-primary dark:text-primary shadow-sm'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
          }`}
          onClick={() => onSelect(stmt.id)}
        >
          <div className="flex items-center gap-2">
            {/* Status Indicator */}
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                stmt.status === 'processing' ? 'bg-amber-400 animate-pulse' : 
                stmt.status === 'error' ? 'bg-red-500' : 'bg-green-500'
            }`} />
            
            <span className="max-w-[120px] truncate" title={stmt.fileName}>
              {stmt.fileName}
            </span>

            {/* Count Badge */}
            {stmt.status === 'ready' && (
               <span className="bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded-full text-xs text-slate-500 dark:text-slate-400">
                  {stmt.transactions.length}
               </span>
            )}

            {/* Delete Button */}
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(stmt.id); }}
              className="ml-1 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors opacity-60 group-hover:opacity-100 focus:opacity-100"
              title="Supprimer ce fichier"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};