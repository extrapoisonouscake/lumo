import { createTRPCClient, httpBatchLink } from "@trpc/client";

import { clientAuthChecks } from "@/helpers/client-auth-checks";
import type { AppRouter } from "@/lib/trpc";
import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import superjson from "superjson";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: false,
    },
    dehydrate: {
      shouldDehydrateQuery: (query) =>
        defaultShouldDehydrateQuery(query) || query.state.status === "pending",
    },
  },
});

let refreshPromise: Promise<void> | null = null;
const TOKEN_EXPIRY_LOCAL_STORAGE_KEY = "auth.tokens_expiry";
const NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL =
  process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL; //no other syntax allowed due to Vercel

const TRPC_URL = `${
  NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000"
}/api/trpc`;
export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      transformer: superjson,
      url: TRPC_URL,
      fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
        const url =
          typeof input === "string"
            ? new URL(input)
            : input instanceof URL
            ? input
            : new URL(input.url);
        if (
          !clientAuthChecks.isLoggedIn() ||
          url.pathname.includes("auth.ensureValidSession")
        ) {
          return fetch(input, init);
        }
        const tokensExpiry = localStorage.getItem(
          TOKEN_EXPIRY_LOCAL_STORAGE_KEY
        );
        if (tokensExpiry) {
          const expiryTime = parseInt(tokensExpiry);
          const now = Date.now();

          if (now < expiryTime) {
            // Session is still valid, proceed with request
            return fetch(input, init);
          }
        }

        // Session needs refresh
        if (!refreshPromise) {
          refreshPromise = trpcClient.auth.ensureValidSession
            .mutate()
            .then(() => {
              refreshPromise = null;
              refreshSessionExpiresAt();
            });
        }

        // Wait for refresh to complete
        await refreshPromise;

        // Now proceed with the original request
        return fetch(input, init);
      },
    }),
  ],
});
export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});
export function refreshSessionExpiresAt() {
  localStorage.setItem(
    TOKEN_EXPIRY_LOCAL_STORAGE_KEY,
    `${Date.now() + 1000 * 60 * 60}`
  );
}
