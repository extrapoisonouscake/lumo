"use client";
import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";
import superjson from "superjson";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
    },
    dehydrate: {
      shouldDehydrateQuery: (query) =>
        defaultShouldDehydrateQuery(query) || query.state.status === "pending",
    },
  },
});

import { createTRPCClient, httpBatchLink } from "@trpc/client";

import { clientAuthChecks } from "@/helpers/client-auth-checks";
import type { AppRouter } from "@/lib/trpc";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
let refreshPromise: Promise<void> | null = null;

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      transformer: superjson,
      url: getUrl(),
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
        const tokensExpiry = localStorage.getItem("auth.tokens_expiry");
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
  localStorage.setItem("auth.tokens_expiry", `${Date.now() + 1000 * 60 * 6}`);
}
function getUrl() {
  const base = (() => {
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return "http://localhost:3000";
  })();
  return `${base}/api/trpc`;
}
