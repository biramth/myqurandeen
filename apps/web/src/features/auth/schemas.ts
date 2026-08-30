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

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email invalide"),
});
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caracteres").max(72),
  confirmPassword: z.string(),
}).refine((v) => v.password === v.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
