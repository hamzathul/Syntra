interface PrismaError {
  code?: string;
}

export const isPrismaUniqueViolation = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  (error as PrismaError).code === "P2002";
