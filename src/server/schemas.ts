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
