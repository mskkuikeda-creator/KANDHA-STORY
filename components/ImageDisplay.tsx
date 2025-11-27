
import React, { useState } from 'react';
import { Placeholder } from './Placeholder';
import { ImageEditor } from './ImageEditor';

interface ImageDisplayProps {
  imageUrl: string;
  isLoading: boolean;
  isEditing: boolean;
  onEdit: (prompt: string) => void;
  onImageUpload: (file: File) => void;
  hasStories: boolean;
  onGenerateCustomImage: (prompt: string) => void;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageUrl, isLoading, isEditing, onEdit, onImageUpload, hasStories, onGenerateCustomImage }) => {
  const [customPrompt, setCustomPrompt] = useState('');

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'kandha-story-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCustomGenerate = () => {
    if (customPrompt.trim()) {
        onGenerateCustomImage(customPrompt);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-2xl font-bold font-oriya text-center text-brand-accent">Generated Image</h2>
      <div className="bg-brand-primary p-4 rounded-lg shadow-inner flex flex-col justify-between h-auto">
        <div className="w-full flex items-center justify-center relative min-h-[300px]">
          {isLoading && <Placeholder message="Creating a beautiful image..." withSpinner />}
          {isEditing && imageUrl && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 rounded-lg">
                <Placeholder message="Applying your edit..." withSpinner />
            </div>
          )}
          {!isLoading && !imageUrl && !hasStories && (
            <Placeholder message="Generate a story to see an image, or create a custom one below." />
          )}
          {!isLoading && !imageUrl && hasStories && <Placeholder message="Select a story variation, or upload an image to start editing." />}
          {imageUrl && !isEditing && (
            <img
              src={imageUrl}
              alt="Generated for the story"
              className="rounded-lg object-contain w-full h-full max-h-[600px]"
            />
          )}
        </div>
        
        <div className="mt-4">
            {imageUrl && !isLoading && (
              <button
                onClick={handleDownload}
                className="w-full mb-4 px-8 py-2 bg-brand-secondary hover:bg-brand-secondary/80 text-white font-bold text-lg rounded-lg shadow-md transition-all duration-300 ease-in-out flex items-center justify-center"
                aria-label="Download generated image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.707a1 1 0 011.414 0L9 11.086V3a1 1 0 112 0v8.086l1.293-1.379a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Download Image
              </button>
            )}

            {!isLoading && (
                <div className="mb-6 p-4 border border-brand-secondary rounded-lg bg-brand-secondary/20">
                    <h3 className="text-md font-bold font-oriya text-brand-text mb-2">Generate Custom Image</h3>
                    <div className="flex flex-col gap-2">
                        <textarea 
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            placeholder="Describe image (e.g., A tribal dance festival)..."
                            className="w-full p-2 bg-brand-primary border border-brand-secondary rounded-md text-brand-text focus:border-brand-accent focus:ring-brand-accent resize-none"
                            rows={2}
                            disabled={isLoading || isEditing}
                        />
                        <button 
                            onClick={handleCustomGenerate}
                            disabled={!customPrompt.trim() || isLoading || isEditing}
                            className="w-full py-2 bg-brand-accent hover:bg-orange-600 disabled:bg-gray-500 text-white font-semibold rounded-md transition-colors"
                        >
                            Generate from Prompt
                        </button>
                    </div>
                </div>
            )}

            {hasStories && !isLoading && (
               <ImageEditor onEdit={onEdit} onImageUpload={onImageUpload} isLoading={isEditing} />
            )}
        </div>

      </div>
    </div>
  );
};
