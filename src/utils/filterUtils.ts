import { Place, PlaceCategory } from '../types/catalog.ts';

export interface FilterCategoryItem {
  id: string;
  label: string;
  icon: string;
}

export const FILTER_CATEGORIES: FilterCategoryItem[] = [
  { id: 'todas', label: 'Todos', icon: '✨' },
  { id: 'restaurantes', label: 'Restaurantes', icon: '🍴' },
  { id: 'arqueologia', label: 'Arqueología', icon: '🏛️' },
  { id: 'playas', label: 'Playas', icon: '🌊' },
  { id: 'atractivos', label: 'Atractivos', icon: '⭐' },
  { id: 'hoteles', label: 'Hoteles', icon: '🏨' },
  { id: 'museos', label: 'Museos', icon: '🎨' },
];

/**
 * Checks if a place category matches the active filter category.
 * Handles mapping for 'restaurantes' which also includes 'gastronomia'.
 */
export function matchesCategory(placeCategory: PlaceCategory | string, filterCategory: string): boolean {
  if (!filterCategory || filterCategory === 'todas') {
    return true;
  }

  if (filterCategory === 'restaurantes') {
    return placeCategory === 'restaurantes' || placeCategory === 'gastronomia';
  }

  return placeCategory === filterCategory;
}

/**
 * Normalizes text removing accents for reliable search matching in Spanish.
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Checks if a place matches a search query across all legitimate catalog fields:
 * - Name
 * - Category & subcategory
 * - Address & Locality
 * - Description (short & full)
 * - Tags
 */
export function matchesSearchQuery(place: Place, query: string): boolean {
  if (!query || !query.trim()) {
    return true;
  }

  const q = normalizeText(query);

  if (normalizeText(place.name).includes(q)) return true;
  if (normalizeText(place.category).includes(q)) return true;
  if (place.subcategory && normalizeText(place.subcategory).includes(q)) return true;
  if (normalizeText(place.localityName).includes(q)) return true;
  if (normalizeText(place.address).includes(q)) return true;
  if (place.shortDescription && normalizeText(place.shortDescription).includes(q)) return true;
  if (place.fullDescription && normalizeText(place.fullDescription).includes(q)) return true;
  if (place.tags && place.tags.some((tag) => normalizeText(tag).includes(q))) return true;

  return false;
}

/**
 * Filters places by category and search query.
 */
export function filterCatalogPlaces(
  places: Place[],
  category: string,
  searchQuery: string
): Place[] {
  return places.filter((place) => {
    return matchesCategory(place.category, category) && matchesSearchQuery(place, searchQuery);
  });
}
