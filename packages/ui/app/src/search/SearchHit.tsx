import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import classNames from "classnames";
import Link from "next/link";
import { useCallback, useMemo } from "react";
import { useDocsContext } from "../docs-context/useDocsContext";
import { useSearchContext } from "../search-context/useSearchContext";
import { EndpointRecord } from "./content/EndpointRecord";
import { PageRecord } from "./content/PageRecord";
import type { SearchRecord } from "./types";

export declare namespace SearchHit {
    export interface Props {
        setRef?: (elem: HTMLAnchorElement | null) => void;
        hit: SearchRecord;
        isHovered: boolean;
        onMouseEnter?: () => void;
        onMouseLeave?: () => void;
    }
}

export const SearchHit: React.FC<SearchHit.Props> = ({ setRef, hit, isHovered, onMouseEnter, onMouseLeave }) => {
    const { navigateToPath } = useDocsContext();
    const { closeSearchDialog } = useSearchContext();

    const path = useMemo(() => {
        switch (hit.type) {
            case "page":
            case "endpoint":
                return hit.path;
            case "page-v2":
            case "endpoint-v2":
                return hit.path.parts
                    .filter((p) => p.skipUrlSlug !== true)
                    .map((p) => p.urlSlug)
                    .join("/");
        }
    }, [hit.type, hit.path]);

    const href = useMemo(() => {
        if (hit.type === "endpoint" || hit.type === "page") {
            if (hit.versionSlug == null) {
                return `/${path}`;
            } else {
                return `/${hit.versionSlug}/${path}`;
            }
        } else {
            if (hit.version == null) {
                return `/${path}`;
            } else {
                return `/${hit.version.urlSlug}/${path}`;
            }
        }
    }, [hit, path]);

    const handleClick = useCallback(() => {
        closeSearchDialog();
        navigateToPath(path);
    }, [closeSearchDialog, navigateToPath, path]);

    const content = useMemo(() => {
        return visitDiscriminatedUnion(hit, "type")._visit({
            endpoint: () => <EndpointRecord hit={hit} isHovered={isHovered} />,
            page: () => <PageRecord hit={hit} isHovered={isHovered} />,
            "endpoint-v2": () => null, // TODO: Implement
            "page-v2": () => null, // TODO: Implement
            _other: () => null,
        });
    }, [hit, isHovered]);

    return (
        <Link
            ref={(elem) => setRef?.(elem)}
            className={classNames("flex w-full items-center space-x-4 space-y-1 rounded-md px-3 py-2 !no-underline", {
                "bg-background-secondary-light dark:bg-background-secondary-dark": isHovered,
            })}
            onClick={handleClick}
            href={href}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {content}
        </Link>
    );
};
