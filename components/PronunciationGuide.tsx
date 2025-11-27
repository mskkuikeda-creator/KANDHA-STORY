
import React from 'react';

interface PronunciationGuideProps {
  onDismiss: () => void;
}

export const PronunciationGuide: React.FC<PronunciationGuideProps> = ({ onDismiss }) => {
  return (
    <div className="bg-brand-secondary/50 p-3 rounded-lg flex items-center justify-between gap-4 mb-2 text-sm text-brand-text animate-fade-in">
      <div className="flex items-center gap-3">
        {/* Info Icon */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-accent flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>
            <strong>Tip:</strong> Click on the <span className="border-b-2 border-dotted border-brand-accent">underlined terms</span> to see their meaning and hear pronunciation.
        </p>
      </div>
      <button 
        onClick={onDismiss} 
        className="p-1 rounded-full text-brand-muted hover:bg-brand-secondary"
        aria-label="Dismiss pronunciation tip"
        title="Dismiss tip"
      >
        {/* Close Icon */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};
