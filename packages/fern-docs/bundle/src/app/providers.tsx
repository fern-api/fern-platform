"use client";

import { ProgressProvider } from "@bprogress/next/app";
import { TooltipProvider } from "@radix-ui/react-tooltip";

import { Toaster } from "@fern-docs/components";

import { JotaiProvider } from "@/state/jotai-provider";

import StyledJsxRegistry from "./registry";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StyledJsxRegistry>
      <JotaiProvider>
        <TooltipProvider>
          <Toaster />
          <ProgressProvider
            height="3px"
            color="var(--bprogress-color)"
            options={{ showSpinner: false }}
            disableSameURL
            delay={300}
            memo
            shouldCompareComplexProps
          >
            {children}
          </ProgressProvider>
        </TooltipProvider>
      </JotaiProvider>
    </StyledJsxRegistry>
  );
}
