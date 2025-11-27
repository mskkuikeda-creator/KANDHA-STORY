
import React from 'react';
import type { AspectRatio, Character, Language, Theme } from '../App';

interface TopicInputProps {
  topic: string;
  setTopic: (topic: string) => void;
  negativePrompt: string;
  setNegativePrompt: (prompt: string) => void;
  characters: Character[];
  setCharacters: (characters: Character[]) => void;
  onGenerate: () => void;
  isLoading: boolean;
  numberOfVariations: number;
  setNumberOfVariations: (num: number) => void;
  storyLength: number;
  setStoryLength: (length: number) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  customThemeStyle?: string;
  setCustomThemeStyle?: (style: string) => void;
}

export const TopicInput: React.FC<TopicInputProps> = ({ 
  topic, 
  setTopic, 
  negativePrompt,
  setNegativePrompt,
  characters,
  setCharacters,
  onGenerate, 
  isLoading, 
  numberOfVariations, 
  setNumberOfVariations,
  storyLength,
  setStoryLength,
  aspectRatio,
  setAspectRatio,
  language,
  setLanguage,
  theme,
  setTheme,
  customThemeStyle,
  setCustomThemeStyle
}) => {
  const handleAddCharacter = () => {
    setCharacters([...characters, { id: `char-${Date.now()}`, name: '', bio: '' }]);
  };

  const handleRemoveCharacter = (id: string) => {
    setCharacters(characters.filter(char => char.id !== id));
  };

  const handleCharacterChange = (id: string, field: 'name' | 'bio', value: string) => {
    const newCharacters = characters.map(char => {
      if (char.id === id) {
        return { ...char, [field]: value };
      }
      return char;
    });
    setCharacters(newCharacters);
  };

  const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const isAnyCharacterNameEmpty = characters.some(char => char.name.trim() === '');

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6">
        <div className="flex items-center p-1 bg-brand-primary rounded-full shadow-inner">
            <button
                onClick={() => setLanguage('odia')}
                className={`px-6 py-2 rounded-full text-lg font-oriya font-bold transition-colors duration-300 ${language === 'odia' ? 'bg-brand-accent text-white' : 'text-brand-muted hover:bg-brand-secondary'}`}
            >
                ଓଡ଼ିଆ
            </button>
            <button
                onClick={() => setLanguage('sambalpuri')}
                className={`px-6 py-2 rounded-full text-lg font-oriya font-bold transition-colors duration-300 ${language === 'sambalpuri' ? 'bg-brand-accent text-white' : 'text-brand-muted hover:bg-brand-secondary'}`}
            >
                ସମ୍ବଲପୁରୀ
            </button>
        </div>
      </div>
      <div className="w-full max-w-2xl">
        <label htmlFor="topic" className="text-lg font-oriya font-semibold mb-2 text-brand-muted">
          {language === 'odia' ? 'କାହାଣୀ ପାଇଁ ଏକ ବିଷୟ ଲେଖନ୍ତୁ' : 'କାହାନୀର୍ ଲାଗି ଗୁଟେ ବିଷୟ ଲେଖୁନ୍'}
        </label>
        <textarea
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onInput={handleTextareaInput}
          placeholder={language === 'odia' ? "ଯେପରିକି: ଜଙ୍ଗଲ ଓ କନ୍ଧ ଝିଅର ବନ୍ଧୁତା..." : "ଯେନ୍ତାକି: ଜଙ୍ଗଲ ଆଉ କନ୍ଧ ଝିଅର୍ ଦୋସ୍ତି..."}
          className="w-full p-4 bg-brand-primary border-2 border-brand-secondary focus:border-brand-accent focus:ring-brand-accent rounded-lg shadow-inner text-brand-text font-oriya text-lg transition-colors duration-300 resize-none overflow-hidden"
          disabled={isLoading}
          rows={3}
        />
      </div>

      <div className="w-full max-w-2xl mt-4">
        <label htmlFor="negative-prompt" className="text-lg font-oriya font-semibold mb-2 text-brand-muted">
          ନକାରାତ୍ମକ ପ୍ରମ୍ପ୍ଟ (ବିକଳ୍ପ)
        </label>
        <textarea
          id="negative-prompt"
          value={negativePrompt}
          onChange={(e) => setNegativePrompt(e.target.value)}
          onInput={handleTextareaInput}
          placeholder={language === 'odia' ? "ଯେପରିକି: ହିଂସା, ଦୁଃଖଦ କାହାଣୀ..." : "ଯେନ୍ତାକି: ହିଂସା, ଦୁଃଖର୍ କାହାନୀ..."}
          className="w-full p-4 bg-brand-primary border-2 border-brand-secondary focus:border-brand-accent focus:ring-brand-accent rounded-lg shadow-inner text-brand-text font-oriya text-lg transition-colors duration-300 resize-none overflow-hidden"
          disabled={isLoading}
          aria-label="Negative prompt for story generation"
          rows={2}
        />
      </div>

      <div className="w-full max-w-2xl mt-4">
        <label className="text-lg font-oriya font-semibold mb-2 text-brand-muted">
          ଚରିତ୍ରଗୁଡ଼ିକୁ ବ୍ୟାଖ୍ୟା କରନ୍ତୁ (ବିକଳ୍ପ)
        </label>
        <div className="space-y-3">
          {characters.map((char) => {
            const isNameInvalid = char.name.trim() === '';
            return (
              <div key={char.id} className="bg-brand-primary p-4 rounded-lg border-2 border-brand-secondary relative group">
                <button
                  type="button"
                  onClick={() => handleRemoveCharacter(char.id)}
                  className="absolute top-2 right-2 text-brand-muted hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                  disabled={isLoading}
                  aria-label="Remove character"
                  title="Remove character"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="w-full sm:w-1/3">
                    <input
                      type="text"
                      placeholder="Character Name"
                      value={char.name}
                      onChange={(e) => handleCharacterChange(char.id, 'name', e.target.value)}
                      className={`w-full p-2 bg-brand-secondary/50 border-2 rounded-md shadow-inner text-brand-text transition-colors duration-300 ${isNameInvalid ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-transparent focus:border-brand-accent focus:ring-brand-accent'}`}
                      disabled={isLoading}
                      aria-required="true"
                      aria-invalid={isNameInvalid}
                    />
                    {isNameInvalid && <p className="text-red-400 text-xs mt-1">Name is required.</p>}
                  </div>
                  <div className="w-full sm:w-2/3">
                    <textarea
                      placeholder="Character Bio (e.g., A brave young woman who loves the forest)"
                      value={char.bio}
                      onChange={(e) => handleCharacterChange(char.id, 'bio', e.target.value)}
                      onInput={handleTextareaInput}
                      className="w-full p-2 bg-brand-secondary/50 border-2 border-transparent focus:border-brand-accent focus:ring-brand-accent rounded-md shadow-inner text-brand-text transition-colors duration-300 resize-none overflow-hidden"
                      disabled={isLoading}
                      rows={2}
                    />
                    <p className="text-xs text-brand-muted mt-1">Tip: Detailed bios lead to more accurate images.</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <button
          type="button"
          onClick={handleAddCharacter}
          disabled={isLoading}
          className="mt-3 px-4 py-2 bg-brand-secondary hover:bg-brand-secondary/80 text-brand-text font-semibold text-sm rounded-lg shadow-md transition-all duration-300 ease-in-out disabled:opacity-50"
        >
          + Add Character
        </button>
      </div>
      
      <div className="mt-6 w-full max-w-3xl flex flex-wrap justify-center items-center gap-x-8 gap-y-4">
        
        <div className="flex items-center gap-3">
          <label htmlFor="theme" className="text-md font-semibold text-brand-muted whitespace-nowrap">
              Theme:
          </label>
          <select 
            id="theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value as Theme)}
            disabled={isLoading}
            className="bg-brand-primary border-2 border-brand-secondary rounded-md p-2 focus:border-brand-accent focus:ring-brand-accent"
          >
              <option value="motivation">Motivation (ପ୍ରେରଣା)</option>
              <option value="love">Love (ପ୍ରେମ)</option>
              <option value="suspense">Suspense (ରହସ୍ୟ)</option>
              <option value="horror">Horror (ଭୟ)</option>
              <option value="adventure">Adventure (ଦୁଃସାହସିକ)</option>
              <option value="comedy">Comedy (ହାସ୍ୟ)</option>
              <option value="mythology">Mythology (ପୌରାଣିକ)</option>
              <option value="historical">Historical (ଐତିହାସିକ)</option>
              <option value="folklore">Folklore (ଲୋକକଥା)</option>
              <option value="educational">Educational (ଶିକ୍ଷଣୀୟ)</option>
              <option value="custom">Own Writing Style (ନିଜସ୍ୱ ଶୈଳୀ)</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="variations" className="text-md font-semibold text-brand-muted whitespace-nowrap">
              Variations:
          </label>
          <select 
            id="variations"
            value={numberOfVariations}
            onChange={(e) => setNumberOfVariations(Number(e.target.value))}
            disabled={isLoading}
            className="bg-brand-primary border-2 border-brand-secondary rounded-md p-2 focus:border-brand-accent focus:ring-brand-accent"
          >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
          </select>
        </div>
        
        <div className="flex items-center gap-3">
          <label htmlFor="aspectRatio" className="text-md font-semibold text-brand-muted whitespace-nowrap">
              Aspect Ratio:
          </label>
          <select 
            id="aspectRatio"
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
            disabled={isLoading}
            className="bg-brand-primary border-2 border-brand-secondary rounded-md p-2 focus:border-brand-accent focus:ring-brand-accent"
          >
              <option value="1:1">1:1 (Square)</option>
              <option value="16:9">16:9 (Landscape)</option>
              <option value="9:16">9:16 (Portrait)</option>
              <option value="4:3">4:3 (Landscape)</option>
              <option value="3:4">3:4 (Portrait)</option>
          </select>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto md:flex-grow max-w-sm">
          <label htmlFor="storyLength" className="text-md font-semibold text-brand-muted whitespace-nowrap">
            Length:
          </label>
          <div className="flex items-center gap-2 w-full">
            <input
              id="storyLength"
              type="range"
              min="500"
              max="1500"
              step="50"
              value={storyLength}
              onChange={(e) => setStoryLength(Number(e.target.value))}
              disabled={isLoading}
              className="w-full h-2 bg-brand-primary rounded-lg appearance-none cursor-pointer"
              aria-label="Story length slider"
            />
            <span className="text-brand-text font-semibold w-24 text-center">{storyLength} words</span>
          </div>
        </div>
      </div>
      
      {theme === 'custom' && setCustomThemeStyle && (
        <div className="w-full max-w-2xl mt-4">
            <label htmlFor="custom-theme" className="text-lg font-oriya font-semibold mb-2 text-brand-muted">
                {language === 'odia' ? 'ଆପଣଙ୍କ ଲେଖା ଶୈଳୀ ବର୍ଣ୍ଣନା କରନ୍ତୁ' : 'ଆପଣଙ୍କର୍ ଲେଖା ଶୈଳୀ ବର୍ଣ୍ଣନା କରୁନ୍'}
            </label>
            <input
                id="custom-theme"
                type="text"
                value={customThemeStyle}
                onChange={(e) => setCustomThemeStyle(e.target.value)}
                placeholder={language === 'odia' ? "ଯେପରିକି: କାବ୍ୟିକ ଏବଂ ଆବେଗପୂର୍ଣ୍ଣ..." : "ଯେନ୍ତାକି: କାବ୍ୟିକ ଆଉ ଆବେଗପୂର୍ଣ୍ଣ..."}
                className="w-full p-4 bg-brand-primary border-2 border-brand-secondary focus:border-brand-accent focus:ring-brand-accent rounded-lg shadow-inner text-brand-text font-oriya text-lg transition-colors duration-300"
                disabled={isLoading}
            />
        </div>
      )}

      <button
        onClick={onGenerate}
        disabled={isLoading || isAnyCharacterNameEmpty}
        className="mt-6 px-12 py-3 bg-brand-accent hover:bg-orange-600 disabled:bg-gray-500 text-white font-bold text-xl rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out flex items-center justify-center disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          'Generate Stories'
        )}
      </button>
    </div>
  );
};
