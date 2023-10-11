import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { getFullSlugForNavigatable, NavigatableDocsNode } from "@fern-ui/app-utils";
import { assertNever } from "@fern-ui/core-utils";
import Link from "next/link";
import { useCallback, useMemo } from "react";

export declare namespace BottomNavigationButton {
    export interface Props {
        navigatable: NavigatableDocsNode;
        direction: "previous" | "next";
    }
}

export const BottomNavigationButton: React.FC<BottomNavigationButton.Props> = ({ navigatable, direction }) => {
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

    const fullSlug = getFullSlugForNavigatable(navigatable);

    const iconName = visitDirection({
        previous: IconNames.CHEVRON_LEFT,
        next: IconNames.CHEVRON_RIGHT,
    });
    const iconElement = <Icon icon={iconName} />;

    const onClick = useCallback(() => {
        // TODO: Implement
    }, []);

    const text = useMemo(() => {
        switch (navigatable.type) {
            case "page":
                return navigatable.page.title;
            case "top-level-endpoint":
            case "endpoint":
                return navigatable.endpoint.name;
            case "top-level-webhook":
            case "webhook":
                return navigatable.webhook.name;
        }
    }, [navigatable]);

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
