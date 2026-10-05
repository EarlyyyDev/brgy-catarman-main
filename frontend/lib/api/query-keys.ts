/** Centralized query-key factory so resource keys never drift between hooks. */
export const qk = {
  auth: {
    me: ["auth", "me"] as const,
  },
  residents: {
    all: ["residents"] as const,
    list: (params?: unknown) => ["residents", "list", params] as const,
    detail: (id: string) => ["residents", "detail", id] as const,
  },
  households: {
    all: ["households"] as const,
    list: (params?: unknown) => ["households", "list", params] as const,
    detail: (id: string) => ["households", "detail", id] as const,
  },
  geography: {
    all: ["geography"] as const,
  },
  documentTypes: {
    all: ["document-types"] as const,
    public: ["document-types", "public"] as const,
  },
  certificateTemplates: {
    all: ["certificate-templates"] as const,
  },
  certificateRequests: {
    all: ["certificate-requests"] as const,
    list: (params?: unknown) => ["certificate-requests", "list", params] as const,
    detail: (id: string) => ["certificate-requests", "detail", id] as const,
    track: (referenceNumber: string) => ["certificate-requests", "track", referenceNumber] as const,
  },
  complaints: {
    all: ["complaints"] as const,
    list: (params?: unknown) => ["complaints", "list", params] as const,
    detail: (id: string) => ["complaints", "detail", id] as const,
    track: (referenceNumber: string) => ["complaints", "track", referenceNumber] as const,
  },
  blotters: {
    all: ["blotters"] as const,
    list: (params?: unknown) => ["blotters", "list", params] as const,
    detail: (id: string) => ["blotters", "detail", id] as const,
  },
  blotterTemplates: {
    all: ["blotter-templates"] as const,
  },
  announcements: {
    all: ["announcements"] as const,
    list: (params?: unknown) => ["announcements", "list", params] as const,
    detail: (id: string) => ["announcements", "detail", id] as const,
    public: (params?: unknown) => ["announcements", "public", params] as const,
    publicDetail: (id: string) => ["announcements", "public-detail", id] as const,
  },
  staff: {
    all: ["staff"] as const,
    list: (params?: unknown) => ["staff", "list", params] as const,
  },
  settings: {
    admin: ["settings", "admin"] as const,
    public: ["settings", "public"] as const,
  },
  officials: {
    all: ["officials"] as const,
    public: ["officials", "public"] as const,
  },
  emergencyContacts: {
    all: ["emergency-contacts"] as const,
    public: ["emergency-contacts", "public"] as const,
  },
  activities: {
    all: ["activities"] as const,
    public: ["activities", "public"] as const,
  },
  backups: {
    all: ["backups"] as const,
  },
  activityLogs: {
    list: (params?: unknown) => ["activity-logs", "list", params] as const,
  },
  notifications: {
    all: ["notifications"] as const,
  },
  dashboard: {
    stats: ["dashboard", "stats"] as const,
    revenue: ["dashboard", "revenue"] as const,
    monthlyRevenue: (year: string) => ["dashboard", "revenue", "monthly", year] as const,
  },
} as const
