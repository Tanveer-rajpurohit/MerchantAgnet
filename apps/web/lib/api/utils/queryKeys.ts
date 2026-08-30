export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  profile: {
    root: ["profile"] as const,
    settings: ["profile", "settings"] as const,
  },
  onboarding: {
    root: ["onboarding"] as const,
    expenses: ["onboarding", "expenses"] as const,
    products: ["onboarding", "products"] as const,
  },
  products: {
    all: ["products"] as const,
    detail: (id: string) => ["products", id] as const,
  },
  expenses: {
    all: ["expenses"] as const,
  },
} as const;
