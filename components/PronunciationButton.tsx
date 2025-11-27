
import React, { useState, useCallback, useRef } from 'react';
import { generatePronunciation } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';

// Initialize audio context lazily to follow best practices
interface PronunciationButtonProps {
    word: string;
}

export const PronunciationButton: React.FC<PronunciationButtonProps> = ({ word }) => {
    const [isLoading, setIsLoading] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);

    const playAudio = useCallback(async () => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            if (audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
            }

            const base64Audio = await generatePronunciation(word);
            const audioBytes = decode(base64Audio);
            const audioBuffer = await decodeAudioData(audioBytes, audioContextRef.current, 24000, 1);
            
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.start();

            source.onended = () => {
                setIsLoading(false);
            };

        } catch (error) {
            console.error('Failed to play pronunciation', error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            alert(`Could not get pronunciation for "${word}":\n${errorMessage}`);
            setIsLoading(false);
        }
    }, [word, isLoading]);

    return (
        <button 
            onClick={playAudio} 
            disabled={isLoading}
            className="inline-block align-middle ml-1 p-1 rounded-full text-brand-accent hover:bg-brand-secondary/50 transition-colors disabled:opacity-50 disabled:cursor-wait"
            aria-label={`Listen to pronunciation of ${word}`}
            title={`Listen to pronunciation of ${word}`}
        >
            {isLoading ? (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.828 2.828a1 1 0 011.414 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.414-1.414A3.986 3.986 0 0013 10a3.986 3.986 0 00-1.172-2.828 1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            )}
        </button>
    );
};
