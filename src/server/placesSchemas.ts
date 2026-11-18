import { z } from 'zod';
import { LA_LIBERTAD_LOCALITIES } from '../types/geo.ts';
import { isWithinLaLibertad } from '../utils/geoBoundary.ts';

const validLocalityIds = new Set(LA_LIBERTAD_LOCALITIES.map((locality) => locality.id));

const nonBlank = (label: string, minLength: number) => z.string().trim()
  .min(minLength, `${label} debe tener al menos ${minLength} caracteres`)
  .max(5000, `${label} es demasiado largo`);

export const PlaceCoordinatesSchema = z.object({
  lat: z.number().finite('La latitud debe ser numérica').min(-90).max(90),
  lng: z.number().finite('La longitud debe ser numérica').min(-180).max(180),
}).refine(isWithinLaLibertad, {
  message: 'Las coordenadas deben estar dentro del departamento de La Libertad, Perú',
});

export const PlaceImageSchema = z.object({
  id: z.string().trim().min(1).optional(),
  url: z.string().trim().url('La URL de la imagen no es válida'),
  caption: z.string().trim().optional(),
  author: z.string().trim().optional(),
  license: z.string().trim().optional(),
  isCover: z.boolean().default(false),
});

export const PlaceOpeningHourSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  openTime: z.string().trim(),
  closeTime: z.string().trim(),
  isClosed: z.boolean().default(false),
});

export const PlaceSourceSchema = z.object({
  placeId: z.string().trim().optional(),
  sourceId: nonBlank('El identificador de fuente', 1),
  externalId: nonBlank('El identificador externo', 1),
  rawDataRef: z.string().trim().optional(),
  lastSyncedAt: z.string().trim().optional(),
});

export const PlaceVerificationSchema = z.object({
  isVerified: z.boolean(),
  verificationLevel: z.enum(['unverified', 'community', 'official_mincetur', 'partner_verified']),
  verifiedBy: z.string().trim().optional(),
  verifiedAt: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

const placeFields = {
  name: nonBlank('El nombre', 2),
  category: z.enum(['restaurantes', 'gastronomia', 'atractivos', 'arqueologia', 'playas', 'museos', 'cultura', 'naturaleza', 'hoteles', 'actividades']),
  subcategory: z.string().trim().optional(),
  localityId: z.string().trim().min(1, 'La localidad es obligatoria').refine((id) => validLocalityIds.has(id), 'Selecciona una localidad válida de La Libertad'),
  localityName: nonBlank('El nombre de localidad', 2),
  address: nonBlank('La dirección', 3),
  coordinates: PlaceCoordinatesSchema,
  geohash: z.string().trim().optional(),
  shortDescription: nonBlank('La descripción', 5),
  fullDescription: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z.string().trim().email('El correo no es válido').optional().or(z.literal('')),
  website: z.string().trim().url('El sitio web no es válido').optional().or(z.literal('')),
  mapsUrl: z.string().trim().url('El enlace de Maps no es válido').optional().or(z.literal('')),
  googlePlaceId: z.string().trim().optional(),
  priceLevel: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewsCount: z.number().int().nonnegative().optional(),
  images: z.array(PlaceImageSchema).optional(),
  openingHours: z.array(PlaceOpeningHourSchema).optional(),
  verification: PlaceVerificationSchema.optional(),
  sources: z.array(PlaceSourceSchema).optional(),
  tags: z.array(z.string().trim().min(1, 'Las etiquetas no pueden estar vacías')).optional(),
  recommendedDurationMinutes: z.number().int().min(5).optional(),
  safetyScore: z.number().min(0).max(100).optional(),
  status: z.enum(['DRAFT', 'FLAGGED', 'PUBLISHED', 'ARCHIVED']).default('PUBLISHED'),
};

export const CreatePlaceSchema = z.object(placeFields).strict();
export const UpdatePlaceSchema = z.object({ ...placeFields, changeSummary: z.string().trim().max(500).optional() }).partial().strict();
export const UpdatePlaceStatusSchema = z.object({
  status: z.enum(['DRAFT', 'FLAGGED', 'PUBLISHED', 'ARCHIVED']),
  reason: z.string().trim().max(500).optional(),
}).strict();

export const VerifyPlaceSchema = z.object({
  isVerified: z.boolean(),
  verificationLevel: z.enum(['unverified', 'community', 'official_mincetur', 'partner_verified']),
  notes: z.string().trim().optional(),
});

export const MergeDuplicatesSchema = z.object({
  primaryId: z.string().trim().min(1, 'primaryId es obligatorio'),
  duplicateIds: z.array(z.string().trim().min(1)).min(1, 'Debe proporcionar al menos un ID duplicado'),
});
