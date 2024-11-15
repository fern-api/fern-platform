import { HttpMethodTag } from "@fern-ui/fern-http-method-tag";
import { ReactNode } from "react";
import { FACET_DISPLAY_NAME_MAP, FACET_DISPLAY_NAME_TITLE_CASE_MAP } from "./facet";

const FACET_DISPLAY_MAP: Record<string, Record<string, ReactNode>> = {
    method: {
        GET: <HttpMethodTag method="GET" />,
        POST: <HttpMethodTag method="POST" />,
        PUT: <HttpMethodTag method="PUT" />,
        PATCH: <HttpMethodTag method="PATCH" />,
        DELETE: <HttpMethodTag method="DELETE" />,
    },
} as const;

const FACET_SMALL_DISPLAY_MAP: Record<string, Record<string, ReactNode>> = {
    method: {
        GET: <HttpMethodTag method="GET" size="sm" />,
        POST: <HttpMethodTag method="POST" size="sm" />,
        PUT: <HttpMethodTag method="PUT" size="sm" />,
        PATCH: <HttpMethodTag method="PATCH" size="sm" />,
        DELETE: <HttpMethodTag method="DELETE" size="sm" />,
    },
} as const;

export function getFacetDisplay(
    facet: string,
    value: string,
    { small = false, titleCase = false }: { small?: boolean; titleCase?: boolean } = {},
): ReactNode {
    return (
        (small ? FACET_SMALL_DISPLAY_MAP : FACET_DISPLAY_MAP)[facet]?.[value] ??
        (titleCase ? FACET_DISPLAY_NAME_TITLE_CASE_MAP : FACET_DISPLAY_NAME_MAP)[facet]?.[value] ??
        value
    );
}
