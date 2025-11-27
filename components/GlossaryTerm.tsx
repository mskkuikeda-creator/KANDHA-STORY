
import React, { useState, useRef, useEffect } from 'react';
import { PronunciationButton } from './PronunciationButton';

interface GlossaryTermProps {
  term: string;
  definition: string;
}

export const GlossaryTerm: React.FC<GlossaryTermProps> = ({ term, definition }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <span 
        ref={containerRef}
        className="relative inline-block"
    >
      <span 
        className="cursor-pointer border-b-2 border-dotted border-brand-accent hover:bg-brand-secondary/30 transition-colors text-brand-accent/90"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        role="button"
        tabIndex={0}
      >
        {term}
      </span>
      {isOpen && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-brand-secondary border border-brand-primary rounded-lg shadow-xl p-3 animate-fade-in">
           <div className="flex justify-between items-start mb-2">
              <strong className="text-brand-accent font-oriya text-lg mr-2">{term}</strong>
              <PronunciationButton word={term} />
           </div>
           <p className="text-sm text-brand-text font-sans leading-snug">{definition}</p>
           {/* Arrow */}
           <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-8 border-transparent border-t-brand-secondary pointer-events-none"></div>
        </div>
      )}
    </span>
  );
};
