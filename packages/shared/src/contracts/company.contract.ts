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

// ── Company Profile ──────────────────────────────────────────────

export interface CompanyProfileDto extends CompanyDto {
  readonly gstin: string | null;
  readonly phone1: string | null;
  readonly phone2: string | null;
  readonly email: string | null;
  readonly address: string | null;
  readonly pincode: string | null;
  readonly description: string | null;
  readonly signature: string | null;
  readonly state: string | null;
  readonly businessType: string | null;
  readonly businessCategory: string | null;
  readonly logo: string | null;
  readonly showOnCard: string[];
}

export const businessTypes = [
  "Retail",
  "Wholesale",
  "Distributor",
  "Manufacturer",
  "Service Provider",
] as const;

export const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
] as const;

const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const pincodeRegex = /^\d{6}$/;

export const updateCompanyProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100).optional(),
  gstin: z.string().regex(gstinRegex, "Invalid GSTIN format").nullable().optional(),
  phone1: z.string().min(10, "Phone must be at least 10 digits").max(15).nullable().optional(),
  phone2: z.string().min(10, "Phone must be at least 10 digits").max(15).nullable().optional(),
  email: z.string().email("Invalid email").nullable().optional(),
  address: z.string().max(500, "Address too long").nullable().optional(),
  pincode: z.string().regex(pincodeRegex, "Pincode must be exactly 6 digits").nullable().optional(),
  description: z.string().max(1000, "Description too long").nullable().optional(),
  signature: z.string().max(500_000, "Signature image too large").nullable().optional(),
  state: z.string().max(100).nullable().optional(),
  businessType: z.string().max(100).nullable().optional(),
  businessCategory: z.string().max(100).nullable().optional(),
  logo: z.string().max(500_000, "Logo image too large").nullable().optional(),
  showOnCard: z.array(z.string()).optional(),
});

export type UpdateCompanyProfileDto = z.infer<typeof updateCompanyProfileSchema>;
