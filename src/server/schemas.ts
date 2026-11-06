import { z } from 'zod';
import { validateLocalityId } from '../utils/geoBoundary.ts';
import { calculateTripDuration } from '../utils/dateUtils.ts';

export const CreateTripSchema = z.object({
  destinationId: z.string().refine(
    (id) => validateLocalityId(id),
    { message: 'El destino debe ser una localidad válida dentro de la región La Libertad, Perú' }
  ),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha de llegada debe tener formato AAAA-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha de salida debe tener formato AAAA-MM-DD'),
  title: z.string().optional(),
}).refine((data) => {
  const duration = calculateTripDuration(data.startDate, data.endDate);
  return duration.isValid;
}, {
  message: 'La fecha de salida no puede ser anterior a la de llegada',
  path: ['endDate'],
});

export type CreateTripInput = z.infer<typeof CreateTripSchema>;
