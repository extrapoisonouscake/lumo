import { CapacitorHttp } from "@capacitor/core";
import { createTRPCClient, httpLink, retryLink } from "@trpc/client";

import { WEBSITE_ROOT } from "@/constants/website";
import { clientAuthChecks } from "@/helpers/client-auth-checks";
import type { AppRouter } from "@/lib/trpc";
import { PrioritizedRequestQueue } from "@/views/requests-queue";
import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";
import { DefaultErrorShape } from "@trpc/server/unstable-core-do-not-import";
import {
  createTRPCOptionsProxy,
  DecorateQueryProcedure,
} from "@trpc/tanstack-react-query";
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

const TRPC_URL = `${WEBSITE_ROOT}/api/trpc`;
const SECONDARY_ROUTES = [
  "user.getStudentDetails",
  "subjects.getSubjects",
  "subjects.getSubjectAttendance",
];
const queue = new PrioritizedRequestQueue();

type RequestInitWithDefinedHeaders = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};
const fetchWithQueue: (
  input: RequestInfo | URL,
  init?: RequestInitWithDefinedHeaders
) => Promise<Response> = async (input, init) => {
  const url =
    typeof input === "string"
      ? new URL(input)
      : input instanceof URL
        ? input
        : new URL(input.url);

  const pathParts = url.pathname.split("/");
  const lastPart = pathParts[pathParts.length - 1]!;
  const [routeGroup, ...restRoute] = lastPart.split(".");

  // skipping the queueing if no call is made to the original API
  const restRouteString = restRoute.join(".");
  const request = async () => {
    const result = await CapacitorHttp.request({
      method: init?.method ?? "GET",
      url: input.toString(),
      headers: init?.headers,
      data: init?.body,
    });

    const response = new Response(
      typeof result.data === "object"
        ? JSON.stringify(result.data)
        : result.data,
      {
        status: result.status,
        headers: result.headers,
      }
    );
    return response;
  };
  if (routeGroup !== "myed" || restRouteString === "auth.logOut") {
    return request();
  }
  const isSecondary = SECONDARY_ROUTES.includes(restRouteString);

  return queue.enqueue(
    async () => {
      const response = await request();
      if (response.status === 503) {
        window.location.href = "/maintenance";
      }

      return response;
    },

    isSecondary
  );
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
        let headers = init?.headers;
        if ((headers && headers instanceof Headers) || Array.isArray(headers)) {
          headers = Object.fromEntries(headers.entries());
        }
        const preparedInit: RequestInitWithDefinedHeaders = {
          ...init,
          headers: headers as Record<string, string>,
        };
        if (
          !clientAuthChecks.isLoggedIn() ||
          url.pathname.includes("auth.ensureValidSession")
        ) {
          return fetchWithQueue(input, preparedInit);
        }
        const tokensExpiry = localStorage.getItem(
          TOKEN_EXPIRY_LOCAL_STORAGE_KEY
        );
        if (tokensExpiry) {
          const expiryTime = parseInt(tokensExpiry);
          const now = Date.now();

          if (now < expiryTime) {
            // Session is still valid, proceed with request
            return fetchWithQueue(input, preparedInit);
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
        return fetchWithQueue(input, preparedInit);
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
export function getTRPCQueryOptions<
  Input,
  Output,
  ErrorShape = DefaultErrorShape,
>(
  procedure: DecorateQueryProcedure<{
    input: Input;
    output: Output;
    transformer: true;
    errorShape: ErrorShape;
  }>
) {
  return (input: Input) =>
    procedure.queryOptions(input, {
      trpc: { abortOnUnmount: true },
    });
}
