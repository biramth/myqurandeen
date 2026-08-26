import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caracteres"),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  displayName: z.string().min(2, "Nom trop court").max(120),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caracteres").max(72),
});
export type RegisterValues = z.infer<typeof registerSchema>;
