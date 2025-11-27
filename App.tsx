
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { TopicInput } from './components/TopicInput';
import { StoryDisplay } from './components/StoryDisplay';
import { ImageDisplay } from './components/ImageDisplay';
import { Footer } from './components/Footer';
import { AudioTranscriber } from './components/AudioTranscriber';
import { generateStory, generateImageForStory, editImage, generateImageFromPrompt } from './services/geminiService';
import { getFavorites, saveFavorites } from './services/favoritesService';
import { Favorites } from './components/Favorites';

export type FontSize = 'sm' | 'base' | 'lg' | 'xl';
export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
export type Character = { id: string; name: string; bio: string; };
export type Language = 'odia' | 'sambalpuri';
export type Theme = 'motivation' | 'love' | 'suspense' | 'horror' | 'adventure' | 'comedy' | 'mythology' | 'historical' | 'folklore' | 'educational' | 'custom';


const dataUrlToComponents = (dataUrl: string): { base64: string, mimeType: string } => {
    const [header, data] = dataUrl.split(',');
    const mimeType = header.match(/:(.*?);/)[1];
    return { base64: data, mimeType };
};


const App: React.FC = () => {
  const [topic, setTopic] = useState<string>("Bravery of a Kandha youth and his connection with the forest");
  const [negativePrompt, setNegativePrompt] = useState<string>('');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [numberOfVariations, setNumberOfVariations] = useState<number>(3);
  const [storyLength, setStoryLength] = useState<number>(1000);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [theme, setTheme] = useState<Theme>('motivation');
  const [customThemeStyle, setCustomThemeStyle] = useState<string>('');
  const [stories, setStories] = useState<string[]>([]);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoadingStories, setIsLoadingStories] = useState<boolean>(false);
  const [isLoadingImage, setIsLoadingImage] = useState<boolean>(false);
  const [isEditingImage, setIsEditingImage] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [fontSize, setFontSize] = useState<FontSize>('base');
  const [language, setLanguage] = useState<Language>('odia');

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  const handleToggleFavorite = useCallback((story: string) => {
    setFavorites(prevFavorites => {
      const isFavorited = prevFavorites.includes(story);
      const newFavorites = isFavorited
        ? prevFavorites.filter(fav => fav !== story)
        : [...prevFavorites, story];
      
      saveFavorites(newFavorites);
      return newFavorites;
    });
  }, []);

  const handleGenerateStories = useCallback(async () => {
    if (!topic.trim()) {
      setError('Please enter a topic for the story.');
      return;
    }

    if (theme === 'custom' && !customThemeStyle.trim()) {
        setError('Please describe your custom writing style.');
        return;
    }

    setIsLoadingStories(true);
    setError(null);
    setStories([]);
    setImageUrl('');
    setSelectedStoryIndex(null);

    try {
      const storyPromises = Array.from({ length: numberOfVariations }, () => generateStory(topic, storyLength, negativePrompt, characters, language, theme, customThemeStyle));
      const generatedStories = await Promise.all(storyPromises);
      setStories(generatedStories);
      setSelectedStoryIndex(0); // Automatically select the first story to trigger image generation
    } catch (err) {
      console.error('Error during story generation:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred while generating stories. Please try again.');
    } finally {
      setIsLoadingStories(false);
    }
  }, [topic, numberOfVariations, storyLength, negativePrompt, characters, language, theme, customThemeStyle]);
  
  const handleSelectStory = useCallback((index: number) => {
    if (index !== selectedStoryIndex) {
        setSelectedStoryIndex(index);
    }
  }, [selectedStoryIndex]);

  useEffect(() => {
    const generateImage = async () => {
        if (selectedStoryIndex === null || !stories[selectedStoryIndex]) {
            return;
        }

        setImageUrl('');
        setIsLoadingImage(true);
        setError(null);

        try {
            const story = stories[selectedStoryIndex];
            const generatedImageUrl = await generateImageForStory(story, aspectRatio, characters);
            setImageUrl(generatedImageUrl);
        } catch (err) {
            console.error('Error during image generation:', err);
            setError(err instanceof Error ? err.message : 'An unexpected error occurred while generating the image. Please try again.');
        } finally {
            setIsLoadingImage(false);
        }
    };
    
    generateImage();
  }, [selectedStoryIndex, stories, aspectRatio, characters]);
  
  const handleImageUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImageUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleEditImage = useCallback(async (prompt: string) => {
    if (!imageUrl) {
        setError("No image to edit. Please upload an image or select a story variation.");
        return;
    }

    setIsEditingImage(true);
    setError(null);
    try {
        const imageData = dataUrlToComponents(imageUrl);
        const editedImageUrl = await editImage(imageData.base64, imageData.mimeType, prompt);
        setImageUrl(editedImageUrl);

    } catch (err) {
        console.error('Error during image edit:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred while editing the image. Please try again.');
    } finally {
        setIsEditingImage(false);
    }
  }, [imageUrl]);

  const handleGenerateCustomImage = useCallback(async (prompt: string) => {
    setImageUrl('');
    setIsLoadingImage(true);
    setError(null);
    
    try {
        const url = await generateImageFromPrompt(prompt, aspectRatio);
        setImageUrl(url);
    } catch (err) {
        console.error('Error during custom image generation:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred while generating the image.');
    } finally {
        setIsLoadingImage(false);
    }
  }, [aspectRatio]);

  return (
    <div className="min-h-screen flex flex-col bg-brand-primary">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 w-full">
        <div className="bg-brand-secondary rounded-xl shadow-2xl p-6 md:p-8">
          <TopicInput
            topic={topic}
            setTopic={setTopic}
            negativePrompt={negativePrompt}
            setNegativePrompt={setNegativePrompt}
            characters={characters}
            setCharacters={setCharacters}
            onGenerate={handleGenerateStories}
            isLoading={isLoadingStories}
            numberOfVariations={numberOfVariations}
            setNumberOfVariations={setNumberOfVariations}
            storyLength={storyLength}
            setStoryLength={setStoryLength}
            aspectRatio={aspectRatio}
            setAspectRatio={setAspectRatio}
            language={language}
            setLanguage={setLanguage}
            theme={theme}
            setTheme={setTheme}
            customThemeStyle={customThemeStyle}
            setCustomThemeStyle={setCustomThemeStyle}
          />

          {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
          
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <StoryDisplay 
                stories={stories} 
                isLoading={isLoadingStories}
                selectedStoryIndex={selectedStoryIndex}
                onSelectStory={handleSelectStory}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                fontSize={fontSize}
                onFontSizeChange={setFontSize}
            />
            <ImageDisplay 
                imageUrl={imageUrl} 
                isLoading={isLoadingImage}
                isEditing={isEditingImage}
                onEdit={handleEditImage}
                onImageUpload={handleImageUpload}
                hasStories={stories.length > 0}
                onGenerateCustomImage={handleGenerateCustomImage}
            />
          </div>
        </div>
        <Favorites favorites={favorites} onRemove={handleToggleFavorite} />
        <AudioTranscriber />
      </main>
      <Footer />
    </div>
  );
};

export default App;
