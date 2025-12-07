import { GoogleGenAI, Type } from "@google/genai";
import { Transaction } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert File to Base64
export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:application/pdf;base64,")
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type
        },
      });
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
    const pdfPart = await fileToGenerativePart(file);

    // Using Gemini 2.5 Flash for speed and cost-effectiveness on documents
    const modelId = "gemini-2.5-flash";

    const prompt = `
      You are an expert financial data extraction engine. 
      Analyze the attached PDF bank statement page(s).
      
      Extract ALL financial transactions found in the table.
      
      Rules:
      1. Ignore headers, footers, previous balances, and summary sections. Only extract line items.
      2. Dates must be formatted as DD/MM/YYYY.
      3. Identify if a value is a Debit (negative flow usually) or Credit (positive flow). 
      4. Return numeric values for debit/credit as positive numbers in their respective fields. If a transaction is a debit, 'debit' should be the number and 'credit' null. If credit, 'credit' is the number and 'debit' null.
      5. The 'label' should be the full description text. Clean up extra spaces or newlines.
      
      Additional Context from user: ${contextInfo}
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
            pdfPart,
            { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING, description: "Transaction date in DD/MM/YYYY" },
              label: { type: Type.STRING, description: "Description or Label of the transaction" },
              debit: { type: Type.NUMBER, description: "Debit amount (positive number) or null if credit" },
              credit: { type: Type.NUMBER, description: "Credit amount (positive number) or null if debit" }
            },
            required: ["date", "label"]
          }
        }
      }
    });

    let jsonString = response.text || "[]";

    // Clean Markdown code blocks if present (sometimes model adds them despite MIME type)
    jsonString = jsonString.replace(/^```json/gm, "").replace(/^```/gm, "").trim();

    let rawData;
    try {
      rawData = JSON.parse(jsonString);
    } catch (error) {
      console.warn("JSON Parse Error (likely truncation):", error);
      
      // Attempt to repair truncated JSON array
      // Strategy: Find the last closing object brace "}", cut everything after it, and append "]"
      const lastClosingBraceIndex = jsonString.lastIndexOf('}');
      
      if (lastClosingBraceIndex !== -1) {
        // Take substring up to the last object
        let repairedString = jsonString.substring(0, lastClosingBraceIndex + 1);
        // Close the array
        repairedString += "]";
        
        try {
          rawData = JSON.parse(repairedString);
          console.log("Successfully repaired truncated JSON response.");
        } catch (repairError) {
          console.error("Failed to repair JSON:", repairError);
          throw new Error("La réponse de l'IA a été coupée et n'a pas pu être récupérée. Le fichier est peut-être trop volumineux.");
        }
      } else {
         throw new Error("Structure de données invalide reçue de l'IA.");
      }
    }

    // Post-process to ensure IDs and valid dates
    return rawData.map((item: any) => ({
      id: crypto.randomUUID(),
      date: item.date || "",
      label: item.label || "Inconnu",
      debit: typeof item.debit === 'number' ? item.debit : null,
      credit: typeof item.credit === 'number' ? item.credit : null,
      isValid: isValidDate(item.date)
    }));

  } catch (error: any) {
    console.error("Gemini Extraction Error:", error);
    throw new Error(error.message || "Échec de l'extraction des données. Veuillez réessayer.");
  }
};

const isValidDate = (dateStr: string): boolean => {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!regex.test(dateStr)) return false;
  return true;
};