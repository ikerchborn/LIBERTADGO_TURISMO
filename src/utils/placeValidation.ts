import { PlaceCategory, PlaceImage, PlaceVerification } from '../types/catalog.ts';
import { PlaceStatus } from '../types/adminCatalog.ts';
import { Coordinates, LA_LIBERTAD_LOCALITIES } from '../types/geo.ts';
import { isWithinLaLibertad } from './geoBoundary.ts';

export const PLACE_CATEGORIES: readonly PlaceCategory[] = [
  'atractivos',
  'arqueologia',
  'gastronomia',
  'restaurantes',
  'playas',
  'museos',
  'cultura',
  'naturaleza',
  'hoteles',
  'actividades',
] as const;

export const PLACE_STATUSES: readonly PlaceStatus[] = [
  'DRAFT',
  'FLAGGED',
  'PUBLISHED',
  'ARCHIVED',
] as const;

export const PLACE_VERIFICATION_LEVELS: readonly PlaceVerification['verificationLevel'][] = [
  'unverified',
  'community',
  'official_mincetur',
  'partner_verified',
] as const;

export const PLACE_REQUIRED_FIELDS = [
  'name',
  'category',
  'localityId',
  'address',
  'coordinates',
  'shortDescription',
] as const;

export type RequiredPlaceField = (typeof PLACE_REQUIRED_FIELDS)[number];

export const PLACE_FIELD_LIMITS = {
  nameMinLength: 2,
  addressMinLength: 3,
  shortDescriptionMinLength: 5,
  maxTextLength: 5000,
  changeSummaryMaxLength: 500,
  minDurationMinutes: 5,
  minSafetyScore: 0,
  maxSafetyScore: 100,
} as const;

export const PLACE_FIELD_LABELS: Record<string, string> = {
  name: 'Nombre Oficial',
  category: 'Categoría Turística',
  subcategory: 'Subcategoría',
  localityId: 'Localidad (La Libertad)',
  localityName: 'Nombre de localidad',
  address: 'Dirección Física',
  coordinates: 'Coordenadas GPS',
  'coordinates.lat': 'Latitud',
  'coordinates.lng': 'Longitud',
  shortDescription: 'Descripción Corta',
  fullDescription: 'Descripción Completa',
  phone: 'Teléfono',
  email: 'Correo Electrónico',
  website: 'Sitio Web Oficial',
  mapsUrl: 'Enlace de Google Maps',
  priceLevel: 'Nivel de Precios',
  recommendedDurationMinutes: 'Tiempo de Visita Recomendado',
  safetyScore: 'Índice de Seguridad Territorial',
  status: 'Estado en el Catálogo',
  images: 'Imágenes',
  tags: 'Etiquetas',
  verification: 'Verificación',
  'verification.notes': 'Notas de Verificación',
  changeSummary: 'Resumen de Cambio',
};

export const DEFAULT_PLACE_COVER_IMAGE_URL =
  'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80';

const VALID_LOCALITY_ID_SET = new Set(LA_LIBERTAD_LOCALITIES.map((locality) => locality.id));
const VALID_CATEGORY_SET = new Set<string>(PLACE_CATEGORIES);
const VALID_STATUS_SET = new Set<string>(PLACE_STATUSES);

export function isValidLocalityId(localityId: string): boolean {
  return VALID_LOCALITY_ID_SET.has(localityId.trim().toLowerCase());
}

export function normalizeOptionalString(value: unknown): unknown {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function normalizeOptionalNumber(value: unknown): unknown {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'string' && value.trim() === '') return undefined;
  return value;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export interface PlaceValidationIssue {
  field: string;
  message: string;
}

export function getPlaceFieldLabel(field: string): string {
  if (PLACE_FIELD_LABELS[field]) return PLACE_FIELD_LABELS[field];
  const baseField = field.split('.')[0];
  return PLACE_FIELD_LABELS[baseField] || field || 'Formulario';
}

export function formatPlaceValidationIssues(issues: PlaceValidationIssue[]): string {
  if (!issues || issues.length === 0) return 'Revisa los campos indicados.';
  return issues
    .map((issue) => {
      const label = getPlaceFieldLabel(issue.field);
      return issue.field ? `${label}: ${issue.message}` : issue.message;
    })
    .join(' | ');
}

export interface PlaceFormInput {
  name: string;
  category: string;
  subcategory?: string;
  localityId: string;
  address: string;
  coordinates: Coordinates;
  shortDescription: string;
  fullDescription?: string;
  phone?: string;
  email?: string;
  website?: string;
  mapsUrl?: string;
  priceLevel?: number;
  recommendedDurationMinutes?: number;
  status?: string;
  isVerified?: boolean;
  verificationLevel?: PlaceVerification['verificationLevel'];
  verificationNotes?: string;
  safetyScore?: number;
  tagsInput?: string;
  images?: PlaceImage[];
  changeSummary?: string;
  isEdit?: boolean;
}

export function validateAndBuildPlacePayload(input: PlaceFormInput): {
  valid: boolean;
  issues: PlaceValidationIssue[];
  payload?: Record<string, unknown>;
} {
  const issues: PlaceValidationIssue[] = [];

  const trimmedName = (input.name ?? '').trim();
  const trimmedCategory = (input.category ?? '').trim().toLowerCase();
  const trimmedLocalityId = (input.localityId ?? '').trim().toLowerCase();
  const trimmedAddress = (input.address ?? '').trim();
  const trimmedShortDesc = (input.shortDescription ?? '').trim();

  if (!trimmedName) {
    issues.push({ field: 'name', message: 'El nombre es obligatorio.' });
  } else if (trimmedName.length < PLACE_FIELD_LIMITS.nameMinLength) {
    issues.push({
      field: 'name',
      message: `El nombre debe tener al menos ${PLACE_FIELD_LIMITS.nameMinLength} caracteres.`,
    });
  }

  if (!trimmedCategory || !VALID_CATEGORY_SET.has(trimmedCategory)) {
    issues.push({
      field: 'category',
      message: 'La categoría turística es obligatoria y debe ser válida.',
    });
  }

  const locality = LA_LIBERTAD_LOCALITIES.find((item) => item.id === trimmedLocalityId);
  if (!trimmedLocalityId) {
    issues.push({ field: 'localityId', message: 'La localidad es obligatoria.' });
  } else if (!locality) {
    issues.push({
      field: 'localityId',
      message: 'Selecciona una localidad válida de La Libertad.',
    });
  }

  if (!trimmedAddress) {
    issues.push({ field: 'address', message: 'La dirección física es obligatoria.' });
  } else if (trimmedAddress.length < PLACE_FIELD_LIMITS.addressMinLength) {
    issues.push({
      field: 'address',
      message: `La dirección debe tener al menos ${PLACE_FIELD_LIMITS.addressMinLength} caracteres.`,
    });
  }

  if (!trimmedShortDesc) {
    issues.push({ field: 'shortDescription', message: 'La descripción corta es obligatoria.' });
  } else if (trimmedShortDesc.length < PLACE_FIELD_LIMITS.shortDescriptionMinLength) {
    issues.push({
      field: 'shortDescription',
      message: `La descripción debe tener al menos ${PLACE_FIELD_LIMITS.shortDescriptionMinLength} caracteres.`,
    });
  }

  if (!isWithinLaLibertad(input.coordinates)) {
    issues.push({
      field: 'coordinates',
      message: 'Las coordenadas deben estar ubicadas dentro del departamento de La Libertad, Perú.',
    });
  }

  const email = normalizeOptionalString(input.email) as string | undefined;
  if (email && !isValidEmail(email)) {
    issues.push({ field: 'email', message: 'El correo electrónico no es válido.' });
  }

  const website = normalizeOptionalString(input.website) as string | undefined;
  if (website && !isValidHttpUrl(website)) {
    issues.push({ field: 'website', message: 'El sitio web debe iniciar con http:// o https://.' });
  }

  const mapsUrl = normalizeOptionalString(input.mapsUrl) as string | undefined;
  if (mapsUrl && !isValidHttpUrl(mapsUrl)) {
    issues.push({ field: 'mapsUrl', message: 'El enlace de Maps debe iniciar con http:// o https://.' });
  }

  const normalizedStatus = (input.status ?? 'PUBLISHED').trim().toUpperCase();
  if (!VALID_STATUS_SET.has(normalizedStatus)) {
    issues.push({ field: 'status', message: 'El estado seleccionado no es válido.' });
  }

  const duration = input.recommendedDurationMinutes;
  if (
    duration !== undefined &&
    (!Number.isInteger(duration) || duration < PLACE_FIELD_LIMITS.minDurationMinutes)
  ) {
    issues.push({
      field: 'recommendedDurationMinutes',
      message: `El tiempo de visita debe ser un entero de al menos ${PLACE_FIELD_LIMITS.minDurationMinutes} minutos.`,
    });
  }

  const safety = input.safetyScore;
  if (
    safety !== undefined &&
    (!Number.isFinite(safety) ||
      safety < PLACE_FIELD_LIMITS.minSafetyScore ||
      safety > PLACE_FIELD_LIMITS.maxSafetyScore)
  ) {
    issues.push({
      field: 'safetyScore',
      message: 'El índice de seguridad debe estar entre 0 y 100.',
    });
  }

  const sanitizedImages: PlaceImage[] = [];
  if (Array.isArray(input.images)) {
    for (let i = 0; i < input.images.length; i++) {
      const img = input.images[i];
      const imgUrl = typeof img?.url === 'string' ? img.url.trim() : '';
      if (!imgUrl) continue;
      if (!isValidHttpUrl(imgUrl)) {
        issues.push({ field: 'images', message: `La imagen #${i + 1} no tiene una URL válida.` });
      } else {
        sanitizedImages.push({
          id: (normalizeOptionalString(img.id) as string | undefined) || `img_${Date.now()}_${i}`,
          url: imgUrl,
          caption: normalizeOptionalString(img.caption) as string | undefined,
          author: normalizeOptionalString(img.author) as string | undefined,
          license: normalizeOptionalString(img.license) as string | undefined,
          isCover: Boolean(img.isCover),
        });
      }
    }
  }

  if (issues.length > 0) {
    return { valid: false, issues };
  }

  const parsedTags = (input.tagsInput ?? '')
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length > 0);

  const normalizedChangeSummary = normalizeOptionalString(input.changeSummary) as string | undefined;

  const payload: Record<string, unknown> = {
    name: trimmedName,
    category: trimmedCategory as PlaceCategory,
    subcategory: normalizeOptionalString(input.subcategory),
    localityId: trimmedLocalityId,
    localityName: locality!.name,
    address: trimmedAddress,
    coordinates: {
      lat: Number(input.coordinates.lat),
      lng: Number(input.coordinates.lng),
    },
    shortDescription: trimmedShortDesc,
    fullDescription: normalizeOptionalString(input.fullDescription),
    phone: normalizeOptionalString(input.phone),
    email,
    website,
    mapsUrl,
    priceLevel: input.priceLevel,
    recommendedDurationMinutes: duration,
    status: normalizedStatus as PlaceStatus,
    verification: {
      isVerified: Boolean(input.isVerified ?? true),
      verificationLevel: input.verificationLevel || 'partner_verified',
      notes: normalizeOptionalString(input.verificationNotes),
    },
    safetyScore: safety,
    tags: parsedTags.length > 0 ? parsedTags : input.isEdit ? [] : undefined,
    images: sanitizedImages.length > 0 ? sanitizedImages : undefined,
    changeSummary: normalizedChangeSummary ?? (input.isEdit ? 'Actualización de datos' : 'Creación inicial'),
  };

  return { valid: true, issues: [], payload };
}
