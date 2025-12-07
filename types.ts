
// Global types

export interface Transaction {
  id: string;
  date: string;
  label: string;
  debit: number | null;
  credit: number | null;
  isValid: boolean;
}

export interface ProcessingStats {
  totalTransactions: number;
  totalDebit: number;
  totalCredit: number;
  balance: number;
}

export interface BankStatement {
  id: string;
  fileName: string;
  transactions: Transaction[];
  status: 'processing' | 'ready' | 'error';
  error?: string;
  uploadDate: string;
}

export enum AppState {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING', // Kept for backward compatibility/global loader
  REVIEW = 'REVIEW',
  ERROR = 'ERROR'
}

// SheetJS Global Definition
declare global {
  interface Window {
    XLSX: any;
  }
}

export interface BankTemplate {
  id: string;
  name: string;
  description: string;
}

export const BANK_TEMPLATES: BankTemplate[] = [
  { id: 'bnp', name: 'BNP Paribas', description: 'Format spécifique BNP' },
  { id: 'sg', name: 'Société Générale', description: 'Format spécifique SG' },
  { id: 'ca', name: 'Crédit Agricole', description: 'Format spécifique CA' },
  { id: 'cic', name: 'CIC / Crédit Mutuel', description: 'Format spécifique CIC/CM' },
];
