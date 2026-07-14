import { z } from 'zod';

export const teamInfoSchema = z.object({
  team_name: z
    .string()
    .min(3, 'Nama tim minimal 3 karakter')
    .max(30, 'Nama tim maksimal 30 karakter')
    .regex(/^[a-zA-Z0-9\s_-]+$/, 'Nama tim hanya boleh huruf, angka, spasi, _ dan -'),
  captain_name: z
    .string()
    .min(3, 'Nama kapten minimal 3 karakter')
    .max(50, 'Nama kapten terlalu panjang'),
  whatsapp: z
    .string()
    .min(10, 'Nomor WhatsApp minimal 10 digit')
    .max(15, 'Nomor WhatsApp maksimal 15 digit')
    .regex(/^[0-9+]+$/, 'Nomor WhatsApp tidak valid'),
});

export const playerSchema = z.object({
  full_name: z
    .string()
    .min(3, 'Nama lengkap minimal 3 karakter')
    .max(50, 'Nama terlalu panjang'),
  nickname: z
    .string()
    .min(2, 'Nickname minimal 2 karakter')
    .max(20, 'Nickname maksimal 20 karakter'),
  mlbb_id: z
    .string()
    .min(5, 'MLBB ID minimal 5 karakter')
    .max(15, 'MLBB ID maksimal 15 karakter')
    .regex(/^[0-9]+$/, 'MLBB ID hanya berisi angka'),
  server_id: z
    .string()
    .min(3, 'Server ID minimal 3 karakter')
    .max(10, 'Server ID maksimal 10 karakter')
    .regex(/^[0-9]+$/, 'Server ID hanya berisi angka'),
});

export const substituteSchema = playerSchema.optional().or(z.object({
  full_name: z.string(),
  nickname: z.string(),
  mlbb_id: z.string(),
  server_id: z.string(),
}).partial());

export const registrationSchema = z.object({
  team: teamInfoSchema,
  players: z.array(playerSchema).length(5, 'Harus ada tepat 5 pemain inti'),
  substitutes: z.array(
    z.union([
      playerSchema,
      z.object({
        full_name: z.string().optional(),
        nickname: z.string().optional(),
        mlbb_id: z.string().optional(),
        server_id: z.string().optional(),
      }),
    ])
  ).max(2),
  agreed: z.boolean().refine((val) => val === true, {
    message: 'Anda harus menyetujui peraturan turnamen',
  }),
});

export type TeamInfoData = z.infer<typeof teamInfoSchema>;
export type PlayerData = z.infer<typeof playerSchema>;
export type RegistrationData = z.infer<typeof registrationSchema>;
