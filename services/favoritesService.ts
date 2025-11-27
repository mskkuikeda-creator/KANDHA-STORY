
const FAVORITES_STORAGE_KEY = 'odia-kandha-story-favorites';

export const getFavorites = (): string[] => {
    try {
        const favoritesJson = localStorage.getItem(FAVORITES_STORAGE_KEY);
        return favoritesJson ? JSON.parse(favoritesJson) : [];
    } catch (error) {
        console.error("Error reading favorites from localStorage", error);
        return [];
    }
};

export const saveFavorites = (favorites: string[]): void => {
    try {
        const favoritesJson = JSON.stringify(favorites);
        localStorage.setItem(FAVORITES_STORAGE_KEY, favoritesJson);
    } catch (error) {
        console.error("Error saving favorites to localStorage", error);
    }
};
