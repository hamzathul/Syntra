import { z } from "zod";

export const createCompanySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
});

export type CreateCompanyDto = z.infer<typeof createCompanySchema>;

export type MemberRole = "OWNER" | "ADMIN" | "MEMBER";

export interface CompanyDto {
  readonly id: string;
  readonly name: string;
  readonly role: MemberRole;
  readonly isDefault: boolean;
  readonly createdAt: string;
}
