export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

export const companyKeys = {
  all: ["companies"] as const,
  list: () => [...companyKeys.all, "list"] as const,
  detail: (id: string) => [...companyKeys.all, "detail", id] as const,
};
