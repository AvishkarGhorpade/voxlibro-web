import { z } from "zod";

export const updateUserSchema = z.object({
  role: z.enum(["SUPER_ADMIN", "ADMIN", "EDITOR", "AUTHOR"]).optional(),
  isActive: z.boolean().optional(),
});

export const inviteUserSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  role: z.enum(["ADMIN", "EDITOR", "AUTHOR"]).default("AUTHOR"),
  password: z.string().min(8).max(72),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
