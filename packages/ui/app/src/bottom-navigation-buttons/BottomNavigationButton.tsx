import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { type DocsNode } from "@fern-api/fdr-sdk";
import { getFullSlugForNavigatable } from "@fern-ui/app-utils";
import { assertNever } from "@fern-ui/core-utils";
import Link from "next/link";
import { useMemo } from "react";
import { useDocsContext } from "../docs-context/useDocsContext";

export declare namespace BottomNavigationButton {
    export interface Props {
        docsNode: DocsNode;
        direction: "previous" | "next";
    }
}

export const BottomNavigationButton: React.FC<BottomNavigationButton.Props> = ({ docsNode, direction }) => {
    const { pathResolver, basePath } = useDocsContext();
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

    const navigatable = useMemo(() => pathResolver.resolveNavigatable(docsNode), [pathResolver, docsNode]);

    const iconName = visitDirection({
        previous: IconNames.CHEVRON_LEFT,
        next: IconNames.CHEVRON_RIGHT,
    });

    const iconElement = <Icon icon={iconName} />;

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

    const fullSlug = getFullSlugForNavigatable(navigatable, { omitDefault: true, basePath });

    return (
        <Link
            className="text-accent-primary/80 dark:text-accent-primary-dark/80 hover:text-accent-primary hover:dark:text-accent-primary-dark flex cursor-pointer items-center gap-2 rounded text-sm !no-underline transition"
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
