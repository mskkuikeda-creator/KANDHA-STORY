
import React from 'react';
import type { FontSize } from '../App';

interface FontSizeControlProps {
  fontSize: FontSize;
  onFontSizeChange: (size: FontSize) => void;
}

const FONT_SIZES: FontSize[] = ['sm', 'base', 'lg', 'xl'];

export const FontSizeControl: React.FC<FontSizeControlProps> = ({ fontSize, onFontSizeChange }) => {
  const currentIndex = FONT_SIZES.indexOf(fontSize);
  const canDecrease = currentIndex > 0;
  const canIncrease = currentIndex < FONT_SIZES.length - 1;

  const handleDecrease = () => {
    if (canDecrease) {
      onFontSizeChange(FONT_SIZES[currentIndex - 1]);
    }
  };

  const handleIncrease = () => {
    if (canIncrease) {
      onFontSizeChange(FONT_SIZES[currentIndex + 1]);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-brand-muted">Font:</span>
      <button
        onClick={handleDecrease}
        disabled={!canDecrease}
        className="p-1 rounded-full text-brand-muted hover:bg-brand-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Decrease font size"
        title="Decrease font size"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      </button>
      <button
        onClick={handleIncrease}
        disabled={!canIncrease}
        className="p-1 rounded-full text-brand-muted hover:bg-brand-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Increase font size"
        title="Increase font size"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};
