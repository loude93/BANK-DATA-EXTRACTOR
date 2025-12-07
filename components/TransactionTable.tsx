import React, { useState } from 'react';
import { Transaction } from '../types';
import { TrashIcon, AlertIcon } from './Icons';

interface Props {
  transactions: Transaction[];
  onUpdate: (id: string, field: keyof Transaction, value: any) => void;
  onDelete: (id: string) => void;
}

export const TransactionTable: React.FC<Props> = ({ transactions, onUpdate, onDelete }) => {
  const [sortField, setSortField] = useState<keyof Transaction>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: keyof Transaction) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    // Handle date sorting
    if (sortField === 'date') {
       const [dA, mA, yA] = (a.date as string).split('/');
       const [dB, mB, yB] = (b.date as string).split('/');
       aValue = new Date(`${yA}-${mA}-${dA}`).getTime();
       bValue = new Date(`${yB}-${mB}-${dB}`).getTime();
    }

    if (aValue === bValue) return 0;
    if (aValue === null) return 1;
    if (bValue === null) return -1;
    
    // @ts-ignore
    const comparison = aValue > bValue ? 1 : -1;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
      <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-800 dark:text-slate-300">
          <tr>
            <th onClick={() => handleSort('date')} className="px-6 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 w-32">Date</th>
            <th onClick={() => handleSort('label')} className="px-6 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700">Libellé</th>
            <th onClick={() => handleSort('debit')} className="px-6 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 text-right w-32">Débit</th>
            <th onClick={() => handleSort('credit')} className="px-6 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 text-right w-32">Crédit</th>
            <th className="px-6 py-3 w-16"></th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
          {sortedTransactions.map((txn) => (
            <tr key={txn.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <td className="px-4 py-2">
                <div className="relative">
                  <input 
                    type="text" 
                    value={txn.date} 
                    onChange={(e) => onUpdate(txn.id, 'date', e.target.value)}
                    className={`bg-transparent border-none focus:ring-1 focus:ring-primary rounded px-2 py-1 w-full ${!txn.isValid ? 'text-red-600 font-bold' : ''}`}
                  />
                  {!txn.isValid && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 text-red-500" title="Format date invalide (DD/MM/YYYY)">
                      <AlertIcon className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 py-2">
                <input 
                  type="text" 
                  value={txn.label} 
                  onChange={(e) => onUpdate(txn.id, 'label', e.target.value)}
                  className="bg-transparent border-none focus:ring-1 focus:ring-primary rounded px-2 py-1 w-full"
                />
              </td>
              <td className="px-4 py-2 text-right">
                <input 
                  type="number" 
                  step="0.01"
                  value={txn.debit || ''} 
                  onChange={(e) => onUpdate(txn.id, 'debit', e.target.value ? parseFloat(e.target.value) : null)}
                  className="bg-transparent border-none focus:ring-1 focus:ring-primary rounded px-2 py-1 w-full text-right text-red-600 font-medium"
                  placeholder="-"
                />
              </td>
              <td className="px-4 py-2 text-right">
                <input 
                  type="number" 
                  step="0.01"
                  value={txn.credit || ''} 
                  onChange={(e) => onUpdate(txn.id, 'credit', e.target.value ? parseFloat(e.target.value) : null)}
                  className="bg-transparent border-none focus:ring-1 focus:ring-primary rounded px-2 py-1 w-full text-right text-green-600 font-medium"
                  placeholder="-"
                />
              </td>
              <td className="px-4 py-2 text-center">
                <button 
                  onClick={() => onDelete(txn.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors p-1"
                  title="Supprimer la ligne"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
          {sortedTransactions.length === 0 && (
             <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                   Aucune transaction trouvée. Chargez un PDF pour commencer.
                </td>
             </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};