
import React, { useState, useRef } from 'react';
import { transcribeAudio } from '../services/geminiService';

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export const AudioTranscriber: React.FC = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [transcribedText, setTranscribedText] = useState('');
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const handleStartRecording = async () => {
        setError(null);
        setTranscribedText('');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };
            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                audioChunksRef.current = [];
                setIsTranscribing(true);
                try {
                    const base64Audio = await blobToBase64(audioBlob);
                    const transcription = await transcribeAudio(base64Audio, audioBlob.type);
                    setTranscribedText(transcription);
                } catch (err) {
                    console.error('Transcription error:', err);
                    setError(err instanceof Error ? err.message : 'An unexpected error occurred during transcription.');
                } finally {
                    setIsTranscribing(false);
                }
            };
            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Error accessing microphone:', err);
            setError('Could not access microphone. Please check permissions.');
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            // Stop microphone tracks
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };
    
    const handleCopy = () => {
        navigator.clipboard.writeText(transcribedText).then(() => {
            alert('Transcription copied to clipboard!');
        });
    };

    return (
        <div className="bg-brand-secondary rounded-xl shadow-2xl p-6 md:p-8 mt-8">
            <h2 className="text-2xl font-bold font-oriya text-center text-brand-accent mb-4">Audio Transcription</h2>
            <div className="flex flex-col items-center gap-4">
                <button
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                    disabled={isTranscribing}
                    className={`px-8 py-3 text-white font-bold text-xl rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out flex items-center justify-center disabled:cursor-not-allowed ${
                        isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-accent hover:bg-orange-600'
                    } disabled:bg-gray-500`}
                >
                    {isRecording && (
                        <span className="relative flex h-3 w-3 mr-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                        </span>
                    )}
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                </button>
                {error && <p className="text-red-400 text-center">{error}</p>}
                
                <div className="w-full max-w-2xl mt-4 bg-brand-primary p-4 rounded-lg shadow-inner min-h-[150px] relative">
                    {isTranscribing && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 rounded-lg">
                            <p className="text-lg text-brand-muted">Transcribing audio...</p>
                        </div>
                    )}
                    {!isTranscribing && !transcribedText && <p className="text-brand-muted text-center">Your transcription will appear here.</p>}
                    {transcribedText && (
                        <>
                            <button
                                onClick={handleCopy}
                                className="absolute top-2 right-2 bg-brand-accent text-white px-3 py-1 rounded-md text-sm hover:bg-orange-600 transition-colors"
                            >
                                Copy
                            </button>
                            <p className="text-brand-text whitespace-pre-wrap">{transcribedText}</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
