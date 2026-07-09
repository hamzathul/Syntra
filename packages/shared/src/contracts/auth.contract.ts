import { z } from "zod";
import { createApiSuccessResponseSchema } from "../api/schemas";

export const userRoleSchema = z.enum(["USER", "ADMIN"]);

export const authUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  role: userRoleSchema,
});

export const registerRequestSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    email: z.email().trim().toLowerCase(),
    password: z.string().min(8).max(128),
  })
  .strict();

export const loginRequestSchema = z
  .object({
    email: z.email().trim().toLowerCase(),
    password: z.string().min(8).max(128),
  })
  .strict();

export const authTokenSchema = z.object({
  accessToken: z.string(),
  tokenType: z.literal("Bearer"),
  expiresIn: z.number().int().positive(),
});

export const authSessionSchema = z.object({
  user: authUserSchema,
  token: authTokenSchema,
  refreshToken: z.string(),
  refreshExpiresIn: z.number().int().positive(),
});

export const refreshRequestSchema = z
  .object({
    refreshToken: z.string().min(1),
  })
  .strict();

export const logoutRequestSchema = z
  .object({
    refreshToken: z.string().min(1),
  })
  .strict();

export const changePasswordRequestSchema = z
  .object({
    currentPassword: z.string().min(8).max(128),
    newPassword: z.string().min(8).max(128),
  })
  .strict();

export const authSessionResponseSchema =
  createApiSuccessResponseSchema(authSessionSchema);

export const authUserResponseSchema =
  createApiSuccessResponseSchema(authUserSchema);

export type UserRoleDto = z.infer<typeof userRoleSchema>;
export type AuthUserDto = z.infer<typeof authUserSchema>;
export type RegisterRequestDto = z.infer<typeof registerRequestSchema>;
export type LoginRequestDto = z.infer<typeof loginRequestSchema>;
export type AuthTokenDto = z.infer<typeof authTokenSchema>;
export type AuthSessionDto = z.infer<typeof authSessionSchema>;
export type RefreshRequestDto = z.infer<typeof refreshRequestSchema>;
export type LogoutRequestDto = z.infer<typeof logoutRequestSchema>;
export type ChangePasswordRequestDto = z.infer<typeof changePasswordRequestSchema>;
