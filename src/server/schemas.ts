import { z } from 'zod';
import { validateLocalityId } from '../utils/geoBoundary.ts';
import { calculateOptionalTripDates } from '../utils/dateUtils.ts';

const optionalDateField = z
  .string()
  .trim()
  .refine(
    (val) => val === '' || /^\d{4}-\d{2}-\d{2}$/.test(val),
    { message: 'La fecha debe tener formato AAAA-MM-DD' }
  )
  .optional()
  .default('');

export const CreateTripSchema = z.object({
  destinationId: z.string().refine(
    (id) => validateLocalityId(id),
    { message: 'El destino debe ser una localidad válida dentro de la región La Libertad, Perú' }
  ),
  startDate: optionalDateField,
  endDate: optionalDateField,
  title: z.string().optional(),
}).superRefine((data, ctx) => {
  const result = calculateOptionalTripDates(data.startDate, data.endDate);
  if (!result.isValid) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: result.error || 'Fechas de viaje inválidas',
      path: ['endDate'],
    });
  }
});

export type CreateTripInput = z.infer<typeof CreateTripSchema>;

export const AddActivitySchema = z.object({
  placeId: z.string().trim().min(1, 'placeId es obligatorio').max(120),
  dayNumber: z.number().int().min(1).max(30),
  timeSlot: z.string().trim().max(60).optional(),
  notes: z.string().trim().max(500).optional(),
});

const ALLOWED_VIDEO_HOSTS = [
  'tiktok.com',
  'www.tiktok.com',
  'vm.tiktok.com',
  'vt.tiktok.com',
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'instagram.com',
  'www.instagram.com',
];

const allowedVideoUrlSchema = z
  .string()
  .trim()
  .url('El enlace del video debe ser una URL válida')
  .max(500)
  .refine(
    (val) => {
      try {
        const parsed = new URL(val);
        if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
        const host = parsed.hostname.toLowerCase();
        return ALLOWED_VIDEO_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
      } catch {
        return false;
      }
    },
    { message: 'El video debe pertenecer a TikTok, YouTube o Instagram' }
  );

const safeHttpsUrlSchema = z
  .string()
  .trim()
  .url('URL inválida')
  .max(500)
  .refine((val) => {
    try {
      const parsed = new URL(val);
      return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch {
      return false;
    }
  }, { message: 'La URL debe usar protocolo HTTP o HTTPS' });

export const CreateCampaignSchema = z.object({
  title: z.string().trim().min(3, 'El título debe tener al menos 3 caracteres').max(120),
  businessName: z.string().trim().min(2, 'El nombre del local es obligatorio').max(100),
  placeId: z.string().trim().max(120).optional(),
  localityId: z.string().trim().max(60).optional(),
  startDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate debe tener formato AAAA-MM-DD'),
  endDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'endDate debe tener formato AAAA-MM-DD'),
  description: z.string().trim().max(1000).optional(),
  videoBrief: z.string().trim().max(1000).optional(),
  requirements: z.array(z.string().trim().max(200)).max(10).optional(),
  hashtags: z.array(z.string().trim().max(50)).max(10).optional(),
  prizes: z.unknown().optional(),
});

export const CreateSubmissionSchema = z.object({
  creatorName: z.string().trim().min(2, 'Nombre del creador obligatorio').max(80),
  creatorHandle: z.string().trim().max(60).optional(),
  platform: z.enum(['tiktok', 'instagram', 'youtube']).optional(),
  videoUrl: allowedVideoUrlSchema,
  title: z.string().trim().min(2, 'Título obligatorio').max(150),
  caption: z.string().trim().max(500).optional(),
  thumbnailUrl: safeHttpsUrlSchema.optional().or(z.literal('')),
});

export const AiChatSchema = z.object({
  message: z.string().trim().min(1, 'Mensaje requerido').max(2000, 'El mensaje no puede exceder 2000 caracteres'),
  context: z
    .object({
      destination: z.string().max(120).optional(),
      startDate: z.string().max(30).optional(),
      endDate: z.string().max(30).optional(),
      places: z.array(z.string().max(120)).max(30).optional(),
      campaignTheme: z.string().max(200).optional(),
      businessName: z.string().max(120).optional(),
      localityName: z.string().max(120).optional(),
    })
    .strict()
    .optional(),
});
