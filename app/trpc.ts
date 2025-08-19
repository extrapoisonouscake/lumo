import { createTRPCClient, httpLink, retryLink } from "@trpc/client";

import { PrioritizedRequestQueue } from "@/app/requests-queue";
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
const queue = new PrioritizedRequestQueue();

const fetchWithQueue: typeof fetch = async (input, init) => {
  const url =
    typeof input === "string"
      ? new URL(input)
      : input instanceof URL
      ? input
      : new URL(input.url);
  const pathParts = url.pathname.split("/");
  const lastPart = pathParts[pathParts.length - 1]!;
  // skipping the queueing if no call is made to the original API
  if (!lastPart.startsWith("myed")) {
    return fetch(input, init);
  }
  return queue.enqueue(async () => {
    const response = await fetch(input, init);
    if (response.status === 503) {
      // window.location.href = "/maintenance";
    }
    return response;
  });
};

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    retryLink({
      retry: (opts) => {
        const code = opts.error.data?.code;

        if (code === "UNAUTHORIZED") {
          window.location.href = "/login";
        }
        return false; // Never retry
      },
    }),
    httpLink({
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
          return fetchWithQueue(input, init);
        }
        const tokensExpiry = localStorage.getItem(
          TOKEN_EXPIRY_LOCAL_STORAGE_KEY
        );
        if (tokensExpiry) {
          const expiryTime = parseInt(tokensExpiry);
          const now = Date.now();

          if (now < expiryTime) {
            // Session is still valid, proceed with request
            return fetchWithQueue(input, init);
          }
        }

        // Session needs refresh
        if (!refreshPromise) {
          refreshPromise = trpcClient.myed.auth.ensureValidSession
            .mutate()
            .then(() => {
              refreshPromise = null;
              refreshSessionExpiresAt();
            });
        }

        // Wait for refresh to complete
        await refreshPromise;

        // Now proceed with the original request
        return fetchWithQueue(input, init);
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
