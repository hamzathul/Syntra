export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

export const companyKeys = {
  all: ["companies"] as const,
  list: () => [...companyKeys.all, "list"] as const,
  detail: (id: string) => [...companyKeys.all, "detail", id] as const,
};

export const settingsKeys = {
  all: ["settings"] as const,
  companyProfile: () => [...settingsKeys.all, "company-profile"] as const,
  general: () => [...settingsKeys.all, "general"] as const,
};

export const taxKeys = {
  all: ["taxes"] as const,
  rates: () => [...taxKeys.all, "rates"] as const,
  groups: () => [...taxKeys.all, "groups"] as const,
};

export const itemKeys = {
  all: ["items"] as const,
  list: () => [...itemKeys.all, "list"] as const,
  detail: (id: string) => [...itemKeys.all, "detail", id] as const,
  categories: () => [...itemKeys.all, "categories"] as const,
  units: () => [...itemKeys.all, "units"] as const,
};

export const companyScopedQueryKeys = [
  settingsKeys.all,
  taxKeys.all,
  itemKeys.all,
] as const;
