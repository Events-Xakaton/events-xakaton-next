import { z } from 'zod';

import { toIsoFromLocal } from '@/shared/lib/utils';

export const eventSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Введите название')
      .max(60, 'Не более 60 символов'),
    description: z.string().min(1, 'Введите описание'),
    location: z.string().min(1, 'Укажите локацию'),
    startsAt: z.string().min(1, 'Укажите дату начала'),
    endsAt: z.string().min(1, 'Укажите дату окончания'),
    maxParticipants: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.startsAt || !data.endsAt) return true;
      const start = toIsoFromLocal(data.startsAt);
      const end = toIsoFromLocal(data.endsAt);
      if (!start || !end) return true;
      return new Date(end) > new Date(start);
    },
    {
      message: 'Время окончания должно быть позже времени начала.',
      path: ['endsAt'],
    },
  );

export type EventFormValues = z.infer<typeof eventSchema>;
