
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Placeholder } from './Placeholder';
import { extractGlossaryTerms, generateStoryNarration, GlossaryItem } from '../services/geminiService';
import { FontSizeControl } from './FontSizeControl';
import { PronunciationGuide } from './PronunciationGuide';
import { GlossaryTerm } from './GlossaryTerm';
import { decode, decodeAudioData } from '../utils/audioUtils';
import type { FontSize } from '../App';

interface StoryDisplayProps {
  stories: string[];
  isLoading: boolean;
  selectedStoryIndex: number | null;
  onSelectStory: (index: number) => void;
  favorites: string[];
  onToggleFavorite: (story: string) => void;
  fontSize: FontSize;
  onFontSizeChange: (size: FontSize) => void;
}

export const StoryDisplay: React.FC<StoryDisplayProps> = ({ stories, isLoading, selectedStoryIndex, onSelectStory, favorites, onToggleFavorite, fontSize, onFontSizeChange }) => {
  const [glossaryTerms, setGlossaryTerms] = useState<GlossaryItem[]>([]);
  const [isFetchingTerms, setIsFetchingTerms] = useState<boolean>(false);
  const [showPronunciationGuide, setShowPronunciationGuide] = useState<boolean>(() => {
    try {
        return !localStorage.getItem('pronunciationGuideDismissed');
    } catch (e) {
        return true; // Default to true if localStorage is unavailable
    }
  });

  // Audio state
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const activeStory = selectedStoryIndex !== null ? stories[selectedStoryIndex] : '';
  const isFavorited = useMemo(() => activeStory ? favorites.includes(activeStory) : false, [favorites, activeStory]);

  useEffect(() => {
    // Stop any playing audio when the story changes
    stopAudio();
    
    if (activeStory) {
      setIsFetchingTerms(true);
      setGlossaryTerms([]); // Reset terms for new story
      extractGlossaryTerms(activeStory)
        .then(terms => {
          // Sort by length desc to prioritize longer matches and avoid partial word matches
          const sortedTerms = terms
            .filter(item => item.term.length > 2)
            .sort((a, b) => b.term.length - a.term.length);
          setGlossaryTerms(sortedTerms);
        })
        .catch(err => console.error("Could not fetch glossary terms", err))
        .finally(() => setIsFetchingTerms(false));
    } else {
      setGlossaryTerms([]);
    }
  }, [activeStory]);

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
        stopAudio();
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
    };
  }, []);
  
  const handleDismissGuide = () => {
    try {
        localStorage.setItem('pronunciationGuideDismissed', 'true');
    } catch (e) {
        console.error("Could not save to localStorage", e);
    }
    setShowPronunciationGuide(false);
  };

  const stopAudio = () => {
      if (sourceNodeRef.current) {
          sourceNodeRef.current.stop();
          sourceNodeRef.current.disconnect();
          sourceNodeRef.current = null;
      }
      setIsPlayingAudio(false);
      setIsGeneratingAudio(false);
  };

  const handleNarrate = async () => {
      if (isPlayingAudio) {
          stopAudio();
          return;
      }

      if (!activeStory) return;

      setIsGeneratingAudio(true);

      try {
          // Initialize AudioContext if needed
          if (!audioContextRef.current) {
              audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
          }

          // Ensure context is running (needed for some browsers after user interaction)
          if (audioContextRef.current.state === 'suspended') {
              await audioContextRef.current.resume();
          }

          const base64Audio = await generateStoryNarration(activeStory);
          const audioBytes = decode(base64Audio);
          const audioBuffer = await decodeAudioData(audioBytes, audioContextRef.current, 24000, 1);

          const source = audioContextRef.current.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioContextRef.current.destination);
          
          source.onended = () => {
              setIsPlayingAudio(false);
              sourceNodeRef.current = null;
          };

          sourceNodeRef.current = source;
          source.start();
          setIsPlayingAudio(true);

      } catch (error) {
          console.error("Error narrating story:", error);
          alert("Failed to narrate the story. Please try again.");
      } finally {
          setIsGeneratingAudio(false);
      }
  };

  const storyWithGlossary = useMemo(() => {
    if (!activeStory) return null;

    // Split the story into paragraphs based on one or more newlines.
    const paragraphs = activeStory.split(/\n\s*\n/).filter(p => p.trim());

    if (glossaryTerms.length === 0) {
      // If no glossary terms, just render paragraphs.
      return paragraphs.map((paragraph, index) => (
        <p key={index} className="mb-4">
          {paragraph}
        </p>
      ));
    }

    // Escape regex characters for safety
    const phrasesRegex = new RegExp(`(${glossaryTerms.map(t => t.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');
    
    return paragraphs.map((paragraph, pIndex) => {
      // Split paragraph by the regex to find glossary terms.
      const parts = paragraph.split(phrasesRegex).filter(part => part);
      
      return (
        <p key={pIndex} className="mb-4">
          {parts.map((part, partIndex) => {
            const termObj = glossaryTerms.find(t => t.term === part);
            if (termObj) {
              return (
                <GlossaryTerm 
                    key={partIndex} 
                    term={termObj.term} 
                    definition={termObj.definition} 
                />
              );
            }
            return <span key={partIndex}>{part}</span>;
          })}
        </p>
      );
    });
  }, [activeStory, glossaryTerms]);

  const handleCopy = () => {
    if (activeStory) {
      navigator.clipboard.writeText(activeStory).then(() => {
        alert('Story copied to clipboard!');
      }, (err) => {
        console.error('Could not copy text: ', err);
      });
    }
  };

  const handleDownload = () => {
    if (!activeStory) return;

    const title = activeStory.split('\n')[0] || 'Kandha Story';
    const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').slice(0, 50);
    const fileName = `${sanitizedTitle}.txt`;

    const blob = new Blob([activeStory], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const handleToggleFavoriteClick = () => {
    if (activeStory) {
      onToggleFavorite(activeStory);
    }
  };
  
  const fontSizeClassMap: Record<FontSize, string> = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const fontSizeClass = fontSizeClassMap[fontSize] || 'text-base';


  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-2xl font-bold font-oriya text-center text-brand-accent">Generated Stories</h2>
      <div className="bg-brand-primary p-4 rounded-lg shadow-inner h-96 lg:h-[600px] flex flex-col prose prose-invert max-w-none prose-p:text-brand-text prose-headings:text-brand-accent prose-headings:font-oriya">
        {isLoading && stories.length === 0 && <Placeholder message="Generating captivating stories for you..." />}
        {!isLoading && stories.length === 0 && <Placeholder message="Your generated stories will appear here." />}
        
        {stories.length > 0 && (
          <>
            <div className="flex justify-between items-center border-b border-brand-secondary mb-4 flex-shrink-0">
              <div className="flex">
                  {stories.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => onSelectStory(index)}
                      className={`px-4 py-2 font-semibold text-sm transition-colors duration-200 ${
                        selectedStoryIndex === index
                          ? 'border-b-2 border-brand-accent text-brand-accent'
                          : 'text-brand-muted hover:text-brand-text'
                      }`}
                    >
                      Variation {index + 1}
                    </button>
                  ))}
              </div>
              <FontSizeControl fontSize={fontSize} onFontSizeChange={onFontSizeChange} />
            </div>

            {showPronunciationGuide && glossaryTerms.length > 0 && !isFetchingTerms && (
                <PronunciationGuide onDismiss={handleDismissGuide} />
            )}

            <div className="relative flex-grow">
              {activeStory && (
                <>
                  <div className="absolute top-0 right-2 z-10 flex items-center gap-1">
                    <button
                        onClick={handleNarrate}
                        className={`p-2 rounded-full transition-colors ${
                            isPlayingAudio || isGeneratingAudio
                                ? 'text-brand-accent bg-brand-secondary hover:bg-brand-secondary/80'
                                : 'text-brand-muted hover:bg-brand-secondary'
                        }`}
                        aria-label={isPlayingAudio ? "Stop narration" : "Listen to story"}
                        title={isPlayingAudio ? "Stop narration" : "Listen to story"}
                        disabled={isGeneratingAudio}
                    >
                        {isGeneratingAudio ? (
                             <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : isPlayingAudio ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.828 2.828a1 1 0 011.414 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.414-1.414A3.986 3.986 0 0013 10a3.986 3.986 0 00-1.172-2.828 1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        )}
                    </button>
                    <button
                        onClick={handleToggleFavoriteClick}
                        className={`p-2 rounded-full transition-colors ${
                            isFavorited 
                                ? 'text-yellow-400 bg-yellow-400/20 hover:bg-yellow-400/30'
                                : 'text-brand-muted hover:bg-brand-secondary'
                        }`}
                        aria-label={isFavorited ? "Remove from favorites" : "Save to favorites"}
                        title={isFavorited ? "Remove from favorites" : "Save to favorites"}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                           <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </button>
                    <button
                      onClick={handleCopy}
                      className="bg-brand-secondary hover:bg-brand-secondary/80 text-white px-3 py-1 rounded-md text-sm transition-colors"
                      aria-label="Copy story to clipboard"
                    >
                      Copy
                    </button>
                     <button
                        onClick={handleDownload}
                        className="bg-brand-secondary hover:bg-brand-secondary/80 text-white px-3 py-1 rounded-md text-sm transition-colors flex items-center"
                        aria-label="Download story as a text file"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.707a1 1 0 011.414 0L9 11.086V3a1 1 0 112 0v8.086l1.293-1.379a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Download
                    </button>
                  </div>
                  <div className={`overflow-y-auto h-full pr-2 pt-10 font-oriya leading-relaxed ${fontSizeClass}`}>
                    {isFetchingTerms && activeStory && <Placeholder message="Finding cultural terms..." />}
                    {!isFetchingTerms && storyWithGlossary}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
