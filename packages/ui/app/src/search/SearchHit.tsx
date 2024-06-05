import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import cn from "clsx";
import Link from "next/link";
import { useMemo } from "react";
import { useNavigationContext } from "../contexts/navigation-context.js";
import { EndpointRecord } from "./content/EndpointRecord.js";
import { EndpointRecordV2 } from "./content/EndpointRecordV2.js";
import { PageRecord } from "./content/PageRecord.js";
import { PageRecordV2 } from "./content/PageRecordV2.js";
import type { SearchRecord } from "./types.js";
import { getFullPathForSearchRecord } from "./util.js";

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
    const { basePath } = useNavigationContext();

    const fullPath = useMemo(() => {
        return getFullPathForSearchRecord(hit, basePath);
    }, [hit, basePath]);

    const content = useMemo(() => {
        return visitDiscriminatedUnion(hit, "type")._visit({
            endpoint: (hit) => <EndpointRecord hit={hit} isHovered={isHovered} />,
            page: (hit) => <PageRecord hit={hit} isHovered={isHovered} />,
            "endpoint-v2": (hit) => <EndpointRecordV2 hit={hit} isHovered={isHovered} />,
            "page-v2": (hit) => <PageRecordV2 hit={hit} isHovered={isHovered} />,
            _other: () => null,
        });
    }, [hit, isHovered]);

    return (
        <Link
            ref={(elem) => setRef?.(elem)}
            className={cn("flex w-full items-center space-x-4 space-y-1 rounded-md px-3 py-2 !no-underline", {
                "bg-accent t-accent-contrast": isHovered,
            })}
            href={`/${fullPath}`}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {content}
        </Link>
    );
};
