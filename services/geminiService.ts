import { Transaction } from "../types";

// Helper to convert File to Base64
const fileToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:application/pdf;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const extractTransactionsFromPDF = async (
  file: File, 
  contextInfo: string
): Promise<Transaction[]> => {
  try {
    const pdfData = await fileToBase64(file);
    
    // Call the Netlify serverless function (API key is kept server-side)
    const functionUrl = '/.netlify/functions/extract-transactions';

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pdfData,
        mimeType: file.type,
        contextInfo,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const transactions: Transaction[] = await response.json();
    return transactions;

  } catch (error: any) {
    console.error("Gemini Extraction Error:", error);
    throw new Error(error.message || "Échec de l'extraction des données. Veuillez réessayer.");
  }
};