export const config = {
    apiBaseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:8080",
} as const;
