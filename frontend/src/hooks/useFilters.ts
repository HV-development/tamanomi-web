import { useState } from 'react';

export function useFilters() {
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
    const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
    const [isNearbyFilter, setIsNearbyFilter] = useState(false);
    const [isFavoritesFilter, setIsFavoritesFilter] = useState(false);

    const toggleNearbyFilter = () => {
        setIsNearbyFilter(!isNearbyFilter);
    };

    const toggleFavoritesFilter = () => {
        setIsFavoritesFilter(!isFavoritesFilter);
    };

    const resetFilters = () => {
        setSelectedGenres([]);
        setSelectedEvents([]);
        setSelectedAreas([]);
        setIsNearbyFilter(false);
        setIsFavoritesFilter(false);
    };

    return {
        selectedGenres,
        selectedEvents,
        selectedAreas,
        isNearbyFilter,
        isFavoritesFilter,
        setSelectedGenres,
        setSelectedEvents,
        setSelectedAreas,
        setIsNearbyFilter,
        setIsFavoritesFilter,
        toggleNearbyFilter,
        toggleFavoritesFilter,
        resetFilters,
    };
}
