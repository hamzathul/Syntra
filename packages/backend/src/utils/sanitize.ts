const sanitizeString = (value: string): string => value.trim();

export const sanitizeUnknown = (value: unknown): unknown => {
  if (typeof value === "string") {
    return sanitizeString(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeUnknown(item));
  }

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, sanitizeUnknown(item)]),
    );
  }

  return value;
};
