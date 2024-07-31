import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import cn from "clsx";
import Link from "next/link";
import { ReactElement, useMemo } from "react";
import { useBasePath, useCloseMobileSidebar, useCloseSearchDialog } from "../atoms";
import { EndpointRecord } from "./content/EndpointRecord";
import { EndpointRecordV2 } from "./content/EndpointRecordV2";
import { EndpointRecordV3 } from "./content/EndpointRecordV3";
import { PageRecord } from "./content/PageRecord";
import { PageRecordV2 } from "./content/PageRecordV2";
import { PageRecordV3 } from "./content/PageRecordV3";
import type { SearchRecord } from "./types";
import { getSlugForSearchRecord } from "./util";

export declare namespace SearchHit {
    export interface Props {
        setRef?: (elem: HTMLAnchorElement | null) => void;
        hit: SearchRecord;
        isHovered?: boolean;
        onMouseEnter?: () => void;
        onMouseLeave?: () => void;
    }
}

export const SearchHit: React.FC<SearchHit.Props> = ({
    setRef,
    hit,
    isHovered = false,
    onMouseEnter,
    onMouseLeave,
}) => {
    const basePath = useBasePath();
    const closeMobileSidebar = useCloseMobileSidebar();
    const closeSearchDialog = useCloseSearchDialog();

    const slug = getSlugForSearchRecord(hit, basePath);

    const content = useMemo(() => {
        return visitDiscriminatedUnion(hit)._visit<ReactElement | null>({
            endpoint: (hit) => <EndpointRecord hit={hit} isHovered={isHovered} />,
            page: (hit) => <PageRecord hit={hit} isHovered={isHovered} />,
            "endpoint-v2": (hit) => <EndpointRecordV2 hit={hit} isHovered={isHovered} />,
            "page-v2": (hit) => <PageRecordV2 hit={hit} isHovered={isHovered} />,

            "endpoint-v3": (hit) => <EndpointRecordV3 hit={hit} isHovered={isHovered} />,
            "websocket-v3": (hit) => <EndpointRecordV3 hit={hit} isHovered={isHovered} />,
            "webhook-v3": (hit) => <EndpointRecordV3 hit={hit} isHovered={isHovered} />,
            "page-v3": (hit) => <PageRecordV3 hit={hit} isHovered={isHovered} />,
            _other: () => null,
        });
    }, [hit, isHovered]);

    return (
        <Link
            ref={(elem) => setRef?.(elem)}
            className={cn("flex w-full items-center space-x-4 space-y-1 rounded-md px-3 py-2 !no-underline", {
                "bg-accent t-accent-contrast": isHovered,
            })}
            href={`/${slug}`}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={() => {
                closeMobileSidebar();
                closeSearchDialog();
            }}
        >
            {content}
        </Link>
    );
};
