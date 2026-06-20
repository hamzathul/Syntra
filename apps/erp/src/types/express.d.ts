import type { AuthenticatedUser } from "backend-p";

declare global {
  namespace Express {
    interface Locals {
      authUser?: AuthenticatedUser;
      companyId?: string;
    }
  }
}

export {};
