import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { type DocsNode } from "@fern-api/fdr-sdk";
import { getFullSlugForNavigatable } from "@fern-ui/app-utils";
import { assertNever } from "@fern-ui/core-utils";
import Link from "next/link";
import { useCallback, useMemo } from "react";
import { useNavigationContext } from "../navigation-context";

export declare namespace BottomNavigationButton {
    export interface Props {
        docsNode: DocsNode;
        direction: "previous" | "next";
    }
}

export const BottomNavigationButton: React.FC<BottomNavigationButton.Props> = ({ docsNode, direction }) => {
    const { navigateToPath, resolver } = useNavigationContext();
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
    const visitDirection = <T extends unknown>({ previous, next }: { previous: T; next: T }): T => {
        switch (direction) {
            case "previous":
                return previous;
            case "next":
                return next;
            default:
                assertNever(direction);
        }
    };

    const navigatable = useMemo(() => resolver.resolveNavigatable(docsNode), [resolver, docsNode]);

    const iconName = visitDirection({
        previous: IconNames.CHEVRON_LEFT,
        next: IconNames.CHEVRON_RIGHT,
    });

    const iconElement = <Icon icon={iconName} />;

    const onClick = useCallback(() => {
        if (navigatable != null) {
            const fullSlug = getFullSlugForNavigatable(navigatable, { omitDefault: true });
            navigateToPath(fullSlug);
        }
    }, [navigateToPath, navigatable]);

    const text = useMemo(() => {
        switch (docsNode.type) {
            case "docs-section":
            case "api-section":
            case "api-subpackage":
                return docsNode.section.title;
            case "page":
                return docsNode.page.title;
            case "top-level-endpoint":
            case "endpoint":
                return docsNode.endpoint.name;
            case "top-level-webhook":
            case "webhook":
                return docsNode.webhook.name;
            default:
                return undefined;
        }
    }, [docsNode]);

    if (navigatable == null) {
        return null;
    }

    const fullSlug = getFullSlugForNavigatable(navigatable, { omitDefault: true });

    return (
        <Link
            className="!text-accent-primary/80 hover:!text-accent-primary flex cursor-pointer items-center gap-2 rounded !no-underline transition"
            onClick={onClick}
            href={`/${fullSlug}`}
        >
            {visitDirection({
                previous: iconElement,
                next: null,
            })}
            <div className="font-medium">{text ?? "Unknown"}</div>
            {visitDirection({
                previous: null,
                next: iconElement,
            })}
        </Link>
    );
};
