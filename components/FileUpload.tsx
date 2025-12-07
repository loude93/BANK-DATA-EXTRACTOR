import React, { useCallback, useState } from 'react';
import { UploadIcon, FileIcon } from './Icons';

interface Props {
  onFileSelect: (files: File[]) => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<Props> = ({ onFileSelect, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = Array.from(e.dataTransfer.files).filter((f: File) => f.type === 'application/pdf');
      if (validFiles.length > 0) {
        onFileSelect(validFiles);
      } else {
        alert("Veuillez déposer uniquement des fichiers PDF.");
      }
    }
  }, [onFileSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        // filter pdfs
      const validFiles = Array.from(e.target.files).filter((f: File) => f.type === 'application/pdf');
      if (validFiles.length > 0) {
        onFileSelect(validFiles);
      }
    }
  };

  return (
    <div 
      className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ease-in-out text-center cursor-pointer group
        ${isDragging 
          ? 'border-primary bg-blue-50 dark:bg-blue-900/20' 
          : 'border-slate-300 dark:border-slate-600 hover:border-primary dark:hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-800'
        }
        ${isLoading ? 'opacity-50 pointer-events-none' : ''}
      `}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        multiple 
        accept="application/pdf"
        onChange={handleInputChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
      />
      
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className={`p-4 rounded-full ${isDragging ? 'bg-primary/20' : 'bg-slate-100 dark:bg-slate-700'} group-hover:scale-110 transition-transform`}>
           {isLoading ? (
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
           ) : (
             <UploadIcon className="w-8 h-8 text-primary" />
           )}
        </div>
        
        <div className="space-y-1">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {isLoading ? 'Analyse en cours...' : 'Déposez vos relevés PDF ici'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
                {isLoading ? 'Veuillez patienter pendant l\'extraction par IA' : 'ou cliquez pour parcourir vos fichiers'}
            </p>
        </div>

        {!isLoading && (
            <div className="flex gap-2 text-xs text-slate-400">
                <span className="flex items-center gap-1"><FileIcon className="w-3 h-3"/> PDF supporté</span>
                <span>•</span>
                <span>Max 10MB</span>
            </div>
        )}
      </div>
    </div>
  );
};
