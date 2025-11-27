
import React, { useState, useRef } from 'react';

interface ImageEditorProps {
  onEdit: (prompt: string) => void;
  onImageUpload: (file: File) => void;
  isLoading: boolean;
}

const predefinedStyles = [
    { name: 'Vintage', prompt: 'Apply a vintage, faded photograph effect with a slightly yellowed tint.' },
    { name: 'Black and White', prompt: 'Convert the image to a dramatic, high-contrast black and white.' },
    { name: 'Sepia', prompt: 'Give the image a warm, brownish sepia tone for a nostalgic feel.' },
    { name: 'Vibrant', prompt: 'Enhance the colors to make them more vibrant, saturated, and lively.' },
];


export const ImageEditor: React.FC<ImageEditorProps> = ({ onEdit, onImageUpload, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onImageUpload(file);
    } else {
      setFileName('');
    }
  };

  const handleSubmit = () => {
    if (!prompt.trim()) {
      alert('Please enter an edit instruction.');
      return;
    }
    onEdit(prompt);
    setPrompt('');
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  }

  return (
    <div className="mt-4 p-4 border-t-2 border-brand-secondary/50">
      <h3 className="text-lg font-bold font-oriya text-center text-brand-accent mb-3">Edit Image</h3>
      <div className="space-y-4">
        <div>
            <label htmlFor="style-select" className="block text-sm font-medium text-brand-muted mb-1">
                Predefined Styles
            </label>
            <select
                id="style-select"
                onChange={(e) => setPrompt(e.target.value)}
                value={prompt}
                className="w-full p-2 bg-brand-primary border-2 border-brand-secondary focus:border-brand-accent focus:ring-brand-accent rounded-lg shadow-inner text-brand-text transition-colors duration-300"
                disabled={isLoading}
                aria-label="Select a predefined editing style"
            >
                <option value="">Select a style (optional)</option>
                {predefinedStyles.map(style => (
                    <option key={style.name} value={style.prompt}>{style.name}</option>
                ))}
            </select>
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Or type a custom edit, e.g., 'Make the background blurry'"
          className="w-full p-2 bg-brand-primary border-2 border-brand-secondary focus:border-brand-accent focus:ring-brand-accent rounded-lg shadow-inner text-brand-text transition-colors duration-300"
          disabled={isLoading}
          rows={2}
        />
        <div className="flex items-center space-x-2">
            <button
                type="button"
                onClick={triggerFileSelect}
                className="flex-shrink-0 px-4 py-2 bg-brand-secondary hover:bg-brand-secondary/80 text-white font-semibold text-sm rounded-lg shadow-md transition-all duration-300 ease-in-out"
                disabled={isLoading}
            >
                {fileName ? "Change Image" : "Upload Image to Edit"}
            </button>
            <span className="text-brand-muted text-sm truncate flex-grow min-w-0">{fileName || "Uses the currently displayed image."}</span>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                disabled={isLoading}
            />
        </div>
        <button
          onClick={handleSubmit}
          disabled={isLoading || !prompt.trim()}
          className="w-full px-8 py-2 bg-brand-accent hover:bg-orange-600 disabled:bg-gray-500 text-white font-bold text-lg rounded-lg shadow-md transform hover:scale-105 transition-all duration-300 ease-in-out flex items-center justify-center disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Applying Edit...
            </>
          ) : (
            'Apply Edit'
          )}
        </button>
      </div>
    </div>
  );
};
