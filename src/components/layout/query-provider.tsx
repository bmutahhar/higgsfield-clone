"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export interface QueryProviderProps {
  children: ReactNode;
}

/**
 * React Query for the generation surfaces.
 *
 * The client is created in state rather than at module scope: a module-level
 * client is shared by every request on the server, which would leak one
 * visitor's cache into the next.
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Generation results are immutable once they land, and a refetch
            // on tab focus would only re-ask a question already answered.
            staleTime: Infinity,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
