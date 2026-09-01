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
    detail: (id: string) => ["expenses", id] as const,
  },
  shops: {
    all: ["shops"] as const,
    list: (filters?: Record<string, unknown>) => ["shops", "list", filters] as const,
    detail: (id: string) => ["shops", "detail", id] as const,
  },
  customers: {
    all: ["customers"] as const,
    list: (filters?: Record<string, unknown>) => ["customers", "list", filters] as const,
    detail: (id: string) => ["customers", "detail", id] as const,
  },
  messages: {
    list: (connectionId: string, filters?: Record<string, unknown>) =>
      ["messages", "list", connectionId, filters] as const,
  },
  orders: {
    all: ["orders"] as const,
    list: (filters?: Record<string, unknown>) => ["orders", "list", filters] as const,
    detail: (id: string) => ["orders", "detail", id] as const,
    myOrders: (filters?: Record<string, unknown>) => ["orders", "my-orders", filters] as const,
  },
} as const;
