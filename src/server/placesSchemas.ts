import { z } from 'zod';
import { LA_LIBERTAD_LOCALITIES } from '../types/geo.ts';
import { isWithinLaLibertad } from '../utils/geoBoundary.ts';
import {
  PLACE_CATEGORIES,
  PLACE_FIELD_LIMITS,
  PLACE_STATUSES,
  PLACE_VERIFICATION_LEVELS,
  isValidLocalityId,
  normalizeOptionalNumber,
  normalizeOptionalString,
} from '../utils/placeValidation.ts';

const validLocalityIds = new Set(LA_LIBERTAD_LOCALITIES.map((locality) => locality.id));

const requiredText = (label: string, minLength: number, requiredMessage: string) =>
  z.preprocess(
    (val) => {
      if (val === undefined || val === null) return '';
      return typeof val === 'string' ? val.trim() : val;
    },
    z
      .string({ message: `${label} debe ser un texto válido` })
      .min(1, requiredMessage)
      .min(minLength, `${label} debe tener al menos ${minLength} caracteres`)
      .max(PLACE_FIELD_LIMITS.maxTextLength, `${label} es demasiado largo`)
  );

const optionalText = (label: string, maxLength: number = PLACE_FIELD_LIMITS.maxTextLength) =>
  z.preprocess(
    normalizeOptionalString,
    z
      .string({ message: `${label} debe ser un texto válido` })
      .max(maxLength, `${label} es demasiado largo`)
      .optional()
  );

export const PlaceCoordinatesSchema = z
  .object(
    {
      lat: z.number({ message: 'La latitud debe ser numérica' }).finite('La latitud debe ser numérica').min(-90).max(90),
      lng: z.number({ message: 'La longitud debe ser numérica' }).finite('La longitud debe ser numérica').min(-180).max(180),
    },
    { message: 'Las coordenadas GPS son obligatorias' }
  )
  .refine(isWithinLaLibertad, {
    message: 'Las coordenadas deben estar dentro del departamento de La Libertad, Perú',
  });
export const PlaceImageSchema = z.object({
  id: optionalText('El identificador de la imagen', 200),
  url: z.string({ message: 'La URL de la imagen es obligatoria' }).trim().url('La URL de la imagen no es válida'),
  caption: optionalText('El pie de foto', 500),
  author: optionalText('El autor de la imagen', 200),
  license: optionalText('La licencia de la imagen', 200),
  isCover: z.boolean().default(false),
});

export const PlaceOpeningHourSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  openTime: z.string().trim(),
  closeTime: z.string().trim(),
  isClosed: z.boolean().default(false),
});

export const PlaceSourceSchema = z.object({
  placeId: optionalText('El ID de lugar en fuente', 200),
  sourceId: requiredText('El identificador de fuente', 1, 'El identificador de fuente es obligatorio'),
  externalId: requiredText('El identificador externo', 1, 'El identificador externo es obligatorio'),
  rawDataRef: optionalText('La referencia de datos crudos', 500),
  lastSyncedAt: optionalText('La fecha de última sincronización', 100),
});

export const PlaceVerificationSchema = z.object({
  isVerified: z.boolean(),
  verificationLevel: z.enum(PLACE_VERIFICATION_LEVELS),
  verifiedBy: optionalText('Verificado por', 200),
  verifiedAt: optionalText('Fecha de verificación', 100),
  notes: optionalText('Notas de verificación', 1000),
});

const statusEnumSchema = z.preprocess(
  (val) => {
    const normalized = normalizeOptionalString(val);
    return typeof normalized === 'string' ? normalized.toUpperCase() : normalized;
  },
  z.enum(PLACE_STATUSES, { message: 'Estado del catálogo inválido' })
);

const basePlaceFields = {
  name: requiredText('El nombre', PLACE_FIELD_LIMITS.nameMinLength, 'El nombre es obligatorio'),
  category: z.preprocess(
    (val) => {
      const normalized = normalizeOptionalString(val);
      return typeof normalized === 'string' ? normalized.toLowerCase() : normalized;
    },
    z.enum(PLACE_CATEGORIES, { message: 'La categoría turística es obligatoria y debe ser válida' })
  ),
  subcategory: optionalText('La subcategoría', 200),
  localityId: z.preprocess(
    (val) => {
      if (val === undefined || val === null) return '';
      return typeof val === 'string' ? val.trim().toLowerCase() : val;
    },
    z
      .string({ message: 'La localidad es obligatoria' })
      .min(1, 'La localidad es obligatoria')
      .refine((id) => isValidLocalityId(id), 'Selecciona una localidad válida de La Libertad')
  ),
  localityName: optionalText('El nombre de localidad', 200),
  address: requiredText('La dirección', PLACE_FIELD_LIMITS.addressMinLength, 'La dirección física es obligatoria'),
  coordinates: PlaceCoordinatesSchema,
  geohash: optionalText('El geohash', 64),
  shortDescription: requiredText(
    'La descripción corta',
    PLACE_FIELD_LIMITS.shortDescriptionMinLength,
    'La descripción corta es obligatoria'
  ),
  fullDescription: optionalText('La descripción completa'),
  phone: optionalText('El teléfono', 100),
  email: z.preprocess(
    normalizeOptionalString,
    z.string({ message: 'El correo electrónico debe ser texto' }).email('El correo electrónico no es válido').optional()
  ),
  website: z.preprocess(
    normalizeOptionalString,
    z.string({ message: 'El sitio web debe ser texto' }).url('La URL del sitio web no es válida').optional()
  ),
  mapsUrl: z.preprocess(
    normalizeOptionalString,
    z.string({ message: 'El enlace de Maps debe ser texto' }).url('El enlace de Google Maps no es válida').optional()
  ),
  googlePlaceId: optionalText('El identificador de Google Place', 200),
  priceLevel: z.preprocess(
    normalizeOptionalNumber,
    z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)], {
      message: 'El nivel de precios debe ser 1, 2, 3 o 4',
    }).optional()
  ),
  rating: z.preprocess(
    normalizeOptionalNumber,
    z.number({ message: 'La calificación debe ser numérica' }).min(0).max(5).optional()
  ),
  reviewsCount: z.preprocess(
    normalizeOptionalNumber,
    z.number({ message: 'El conteo de reseñas debe ser numérico' }).int().nonnegative().optional()
  ),
  images: z.array(PlaceImageSchema).optional(),
  openingHours: z.array(PlaceOpeningHourSchema).optional(),
  verification: PlaceVerificationSchema.optional(),
  sources: z.array(PlaceSourceSchema).optional(),
  tags: z.preprocess(
    (val) => {
      if (val === null) return undefined;
      if (!Array.isArray(val)) return val;
      return val
        .map((item) => (typeof item === 'string' ? item.trim() : item))
        .filter((item) => item !== '');
    },
    z.array(z.string().min(1, 'Las etiquetas no pueden estar vacías')).optional()
  ),
  recommendedDurationMinutes: z.preprocess(
    normalizeOptionalNumber,
    z
      .number({ message: 'El tiempo de visita debe ser numérico' })
      .int('El tiempo de visita debe ser un número entero')
      .min(PLACE_FIELD_LIMITS.minDurationMinutes, 'La duración recomendada debe ser de al menos 5 minutos')
      .optional()
  ),
  safetyScore: z.preprocess(
    normalizeOptionalNumber,
    z
      .number({ message: 'El índice de seguridad debe ser numérico' })
      .min(PLACE_FIELD_LIMITS.minSafetyScore, 'El índice de seguridad debe estar entre 0 y 100')
      .max(PLACE_FIELD_LIMITS.maxSafetyScore, 'El índice de seguridad debe estar entre 0 y 100')
      .optional()
  ),
  changeSummary: optionalText('El resumen de cambio', PLACE_FIELD_LIMITS.changeSummaryMaxLength),
};

export const CreatePlaceSchema = z
  .object({
    ...basePlaceFields,
    status: statusEnumSchema.default('PUBLISHED'),
  })
  .strict();

export const UpdatePlaceSchema = z
  .object({
    ...basePlaceFields,
    status: statusEnumSchema,
  })
  .partial()
  .strict();

export const UpdatePlaceStatusSchema = z.object({
  status: z.enum(PLACE_STATUSES),
  reason: optionalText('El motivo', PLACE_FIELD_LIMITS.changeSummaryMaxLength),
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

const VALID_CATEGORIES = [
  'restaurantes',
  'gastronomia',
  'atractivos',
  'arqueologia',
  'playas',
  'museos',
  'cultura',
  'naturaleza',
  'hoteles',
  'actividades',
] as const;

const VALID_STATUSES = ['ALL', 'DRAFT', 'FLAGGED', 'PUBLISHED', 'ARCHIVED'] as const;
const VALID_SORT_FIELDS = ['name', 'updatedAt', 'createdAt', 'rating', 'reviewsCount'] as const;

const normalizeOptionalQueryValue = (val: unknown): string | undefined => {
  const single = Array.isArray(val) ? val[0] : val;
  if (single === undefined || single === null) return undefined;
  if (typeof single !== 'string') return String(single);
  const trimmed = single.trim();
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null') return undefined;
  return trimmed;
};

const parseStrictPositiveInt = (fieldLabel: string, defaultValue: number, maxValue: number) =>
  z.preprocess(normalizeOptionalQueryValue, z.string().optional()).transform((val, ctx) => {
    if (val === undefined) return defaultValue;
    if (!/^-?\d+$/.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${fieldLabel} debe ser un número entero válido`,
      });
      return z.NEVER;
    }
    const num = Number(val);
    if (!Number.isInteger(num) || num < 1 || num > maxValue) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${fieldLabel} debe estar entre 1 y ${maxValue}`,
      });
      return z.NEVER;
    }
    return num;
  });

export const ListPlacesQuerySchema = z.object({
  search: z.preprocess(
    normalizeOptionalQueryValue,
    z.string().max(200, 'El término de búsqueda es demasiado largo').optional()
  ),
  status: z.preprocess(
    (val) => {
      const normalized = normalizeOptionalQueryValue(val);
      return normalized ? normalized.toUpperCase() : undefined;
    },
    z.enum(VALID_STATUSES, { message: 'Estado de filtro inválido' }).default('ALL')
  ),
  category: z.preprocess(
    (val) => {
      const normalized = normalizeOptionalQueryValue(val);
      if (!normalized) return undefined;
      const lower = normalized.toLowerCase();
      return lower === 'all' ? 'todas' : lower;
    },
    z.enum(['todas', ...VALID_CATEGORIES], { message: 'Categoría de filtro inválida' }).default('todas')
  ),
  localityId: z.preprocess(
    (val) => {
      const normalized = normalizeOptionalQueryValue(val);
      if (!normalized) return undefined;
      const lower = normalized.toLowerCase();
      return lower === 'all' ? 'todas' : lower;
    },
    z
      .string()
      .refine((id) => id === 'todas' || validLocalityIds.has(id), 'Localidad de filtro inválida')
      .default('todas')
  ),
  isVerified: z.preprocess(
    (val) => {
      const normalized = normalizeOptionalQueryValue(val);
      if (!normalized) return undefined;
      const lower = normalized.toLowerCase();
      if (lower === 'all') return 'ALL';
      return lower;
    },
    z.enum(['ALL', 'true', 'false'], { message: 'El filtro de verificación debe ser ALL, true o false' }).default('ALL')
  ).transform((val): boolean | 'ALL' => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return 'ALL';
  }),
  page: parseStrictPositiveInt('page', 1, 10000),
  limit: parseStrictPositiveInt('limit', 20, 100),
  sortBy: z.preprocess(
    normalizeOptionalQueryValue,
    z.enum(VALID_SORT_FIELDS, { message: 'Campo de ordenamiento inválido' }).default('updatedAt')
  ),
  sortOrder: z.preprocess(
    (val) => {
      const normalized = normalizeOptionalQueryValue(val);
      return normalized ? normalized.toLowerCase() : undefined;
    },
    z.enum(['asc', 'desc'], { message: 'Orden inválido (asc o desc)' }).default('desc')
  ),
});
