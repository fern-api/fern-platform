import { forwardRef } from "react";
import { Badge, BadgeProps } from "./badge";
import { UIColor } from "./colors";

export type HttpMethod = "GET" | "DELETE" | "POST" | "PUT" | "PATCH" | "HEAD" | "OPTIONS" | "CONNECT" | "TRACE";
export const HttpMethod: Record<HttpMethod, HttpMethod> = {
    GET: "GET",
    DELETE: "DELETE",
    POST: "POST",
    PUT: "PUT",
    PATCH: "PATCH",
    HEAD: "HEAD",
    OPTIONS: "OPTIONS",
    CONNECT: "CONNECT",
    TRACE: "TRACE",
} as const;

export const HttpMethodOrder = [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "HEAD",
    "OPTIONS",
    "CONNECT",
    "TRACE",
] as const;

export function isHttpMethod(value: string): value is HttpMethod {
    return HttpMethod[value as keyof typeof HttpMethod] != null;
}

const METHOD_COLOR_SCHEMES: Record<HttpMethod, UIColor> = {
    GET: "green",
    DELETE: "red",
    POST: "blue",
    PUT: "amber",
    PATCH: "orange",
    HEAD: "gray",
    OPTIONS: "bronze",
    CONNECT: "sky",
    TRACE: "purple",
};

/**
 * Abbreviated method names for smaller (fixed-width) badges.
 */
const ABBREVIATED_METHODS: Record<HttpMethod, string> = {
    GET: "GET",
    DELETE: "DEL",
    POST: "POST",
    PUT: "PUT",
    PATCH: "PATCH",
    HEAD: "HEAD",
    OPTIONS: "OPT",
    CONNECT: "CON",
    TRACE: "TRACE",
};

export interface HttpMethodBadgeProps extends Omit<BadgeProps, "color"> {
    method: HttpMethod;
}

export const HttpMethodBadge = forwardRef<HTMLSpanElement & HTMLButtonElement, HttpMethodBadgeProps>((props, ref) => {
    const { method, ...rest } = props;
    return (
        <Badge
            ref={ref}
            {...rest}
            data-badge-type="http-method"
            data-http-method={method}
            color={METHOD_COLOR_SCHEMES[method]}
        >
            {props.children ?? (rest.size === "sm" ? ABBREVIATED_METHODS[method] : method)}
        </Badge>
    );
});

HttpMethodBadge.displayName = "HttpMethodBadge";
