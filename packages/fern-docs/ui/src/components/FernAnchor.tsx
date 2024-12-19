import { useCopyToClipboard } from "@fern-ui/react-commons";
import * as Tooltip from "@radix-ui/react-tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Link } from "iconoir-react";
import { PropsWithChildren, ReactElement, useEffect, useState } from "react";
import { FernLink } from "./FernLink";

interface FernAnchorProps {
    href: string;
    sideOffset?: number;
}

export function FernAnchor({
    href,
    sideOffset = 12,
    children,
}: PropsWithChildren<FernAnchorProps>): ReactElement {
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

    return (
        <Tooltip.Provider>
            <Tooltip.Root delayDuration={0}>
                <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
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
                                    <Link />
                                </span>
                            )}
                            <AnimatePresence
                                onExitComplete={handleExitComplete}
                            >
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
