
import React from 'react';
import { ProcessingStats } from '../types';

interface Props {
  stats: ProcessingStats;
}

export const StatsCards: React.FC<Props> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow border border-slate-200 dark:border-slate-700">
        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase">Transactions</h3>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalTransactions}</p>
      </div>
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow border border-slate-200 dark:border-slate-700">
        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase">Total Débit</h3>
        <p className="text-2xl font-bold text-red-600 mt-1">
          {stats.totalDebit.toLocaleString('fr-FR', { style: 'currency', currency: 'MAD' })}
        </p>
      </div>
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow border border-slate-200 dark:border-slate-700">
        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase">Total Crédit</h3>
        <p className="text-2xl font-bold text-green-600 mt-1">
          {stats.totalCredit.toLocaleString('fr-FR', { style: 'currency', currency: 'MAD' })}
        </p>
      </div>
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow border border-slate-200 dark:border-slate-700">
        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase">Solde Mouvementé</h3>
        <p className={`text-2xl font-bold mt-1 ${stats.balance >= 0 ? 'text-primary' : 'text-orange-500'}`}>
          {(stats.balance > 0 ? '+' : '') + stats.balance.toLocaleString('fr-FR', { style: 'currency', currency: 'MAD' })}
        </p>
      </div>
    </div>
  );
};
