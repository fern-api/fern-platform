import { forwardRef } from "react";
import { Badge, BadgeProps, ConfigurableColorScheme } from "./badge";

export type HttpMethod = "GET" | "DELETE" | "POST" | "PUT" | "PATCH" | "HEAD" | "OPTIONS" | "CONNECT" | "TRACE";
export const HttpMethodOrder = [
    "GET",
    "DELETE",
    "POST",
    "PUT",
    "PATCH",
    "HEAD",
    "OPTIONS",
    "CONNECT",
    "TRACE",
] as const;

const METHOD_COLOR_SCHEMES: Record<HttpMethod, ConfigurableColorScheme> = {
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

export const HttpMethodBadge = forwardRef<HTMLSpanElement, HttpMethodBadgeProps>((props, ref) => {
    const { method, ...rest } = props;
    return (
        <Badge
            ref={ref}
            {...rest}
            data-badge-type="http-method"
            data-http-method={method}
            color={METHOD_COLOR_SCHEMES[method]}
        >
            {props.children ?? ABBREVIATED_METHODS[method]}
        </Badge>
    );
});

HttpMethodBadge.displayName = "HttpMethodBadge";
