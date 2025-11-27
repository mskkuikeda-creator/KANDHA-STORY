import React, { useState } from 'react';

interface FavoritesProps {
  favorites: string[];
  onRemove: (story: string) => void;
}

const FavoriteItem: React.FC<{ story: string; onRemove: (story: string) => void; }> = ({ story, onRemove }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const title = story.split('\n')[0] || 'Favorite Story';
    const preview = story.length > 150 ? story.substring(0, 150) + '...' : story;

    return (
        <div className="bg-brand-primary p-4 rounded-lg shadow-inner">
            <div className="flex justify-between items-start">
                <div className="flex-grow pr-4">
                    <h4 className="font-bold font-oriya text-lg text-brand-accent">{title}</h4>
                    <div className="text-brand-text mt-2 font-oriya text-base leading-relaxed">
                        {isExpanded 
                            ? story.split(/\n\s*\n/).filter(p => p.trim()).map((paragraph, i) => <p key={i} className="mb-3 last:mb-0">{paragraph}</p>) 
                            : preview}
                    </div>
                </div>
                <button
                    onClick={() => onRemove(story)}
                    className="ml-4 flex-shrink-0 p-2 rounded-full hover:bg-red-500/20 text-red-400 transition-colors"
                    aria-label="Remove from favorites"
                    title="Remove from favorites"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
             <button onClick={() => setIsExpanded(!isExpanded)} className="text-sm text-brand-accent hover:underline mt-2">
                {isExpanded ? 'Show Less' : 'Show More'}
            </button>
        </div>
    );
};

export const Favorites: React.FC<FavoritesProps> = ({ favorites, onRemove }) => {
  if (favorites.length === 0) {
    return null; // Don't render the section if there are no favorites
  }

  return (
    <div className="bg-brand-secondary rounded-xl shadow-2xl p-6 md:p-8 mt-8">
      <h2 className="text-2xl font-bold font-oriya text-center text-brand-accent mb-4">Saved Stories</h2>
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {favorites.slice().reverse().map((story, index) => (
          <FavoriteItem key={index} story={story} onRemove={onRemove} />
        ))}
      </div>
    </div>
  );
};