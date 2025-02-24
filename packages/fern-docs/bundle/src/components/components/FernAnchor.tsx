"use client";

import { useEffect, useState } from "react";
import React from "react";

import * as Tooltip from "@radix-ui/react-tooltip";
import { Check, Link2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { useCopyToClipboard } from "@fern-ui/react-commons";

import { FernLink } from "./FernLink";

interface FernAnchorProps {
  href: string;
  sideOffset?: number;
  asChild?: boolean;
}

const DisableFernAnchorCtx = React.createContext<boolean>(false);

export function DisableFernAnchor({ children }: { children: React.ReactNode }) {
  return (
    <DisableFernAnchorCtx.Provider value={true}>
      {children}
    </DisableFernAnchorCtx.Provider>
  );
}

export function useIsFernAnchorDisabled() {
  return React.useContext(DisableFernAnchorCtx);
}

export function FernAnchor({
  href,
  sideOffset = 12,
  children,
  asChild = false,
}: React.PropsWithChildren<FernAnchorProps>) {
  const isDisabled = useIsFernAnchorDisabled();
  const { copyToClipboard, wasJustCopied } = useCopyToClipboard(() =>
    new URL(href, window.location.href).toString()
  );

  const [forceMount, setIsMounted] = useState<true | undefined>(
    wasJustCopied ? true : undefined
  );

  useEffect(() => {
    if (wasJustCopied) {
      setIsMounted(true);
    }
  }, [wasJustCopied]);

  const handleExitComplete = () => {
    setIsMounted(undefined);
  };

  if (isDisabled) {
    return <>{children}</>;
  }

  return (
    <Tooltip.Provider>
      <Tooltip.Root delayDuration={0}>
        <Tooltip.Trigger asChild={asChild}>{children}</Tooltip.Trigger>
        <Tooltip.Portal forceMount={forceMount}>
          <Tooltip.Content
            sideOffset={sideOffset}
            collisionPadding={6}
            side="left"
            asChild
          >
            <FernLink
              className="fern-anchor"
              href={href}
              shallow={true}
              scroll={false}
              replace={true}
              onClick={copyToClipboard}
              tabIndex={-1}
            >
              {!wasJustCopied && !forceMount && (
                <span className="fern-anchor-icon">
                  <Link2 />
                </span>
              )}
              <AnimatePresence onExitComplete={handleExitComplete}>
                {wasJustCopied && (
                  <motion.div
                    className="fern-anchor-icon copied"
                    exit={{ opacity: 0, x: -8 }}
                  >
                    <Check />
                  </motion.div>
                )}
              </AnimatePresence>
            </FernLink>
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
