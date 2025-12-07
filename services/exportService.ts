import { Transaction } from "../types";

export const exportToExcel = (transactions: Transaction[], filename: string) => {
  if (!window.XLSX) {
    alert("Erreur: Librairie Excel non chargée.");
    return;
  }

  // Format data for Excel
  const dataToExport = transactions.map(t => ({
    "Date": t.date,
    "Libellé": t.label,
    "Débit": t.debit,
    "Crédit": t.credit
  }));

  const worksheet = window.XLSX.utils.json_to_sheet(dataToExport);
  const workbook = window.XLSX.utils.book_new();
  
  window.XLSX.utils.book_append_sheet(workbook, worksheet, "Relevé Bancaire");
  
  // Generate file
  window.XLSX.writeFile(workbook, `${filename}.xlsx`);
};