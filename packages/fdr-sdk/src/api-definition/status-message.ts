import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";

type StatusCodeMessagesByMethod = Partial<Record<APIV1Read.HttpMethod, string>>;

type StatusCodeMessages = Record<number, StatusCodeMessagesByMethod>;

type DefaultStatusCodeMessages = Record<number, string>;

export const STATUS_CODE_MESSAGES: DefaultStatusCodeMessages = {
    100: "Continue",
    101: "Switching Protocols",
    102: "Processing",
    103: "Early Hints",
    200: "OK",
    201: "Created",
    202: "Accepted",
    203: "Non-Authoritative Information",
    204: "No Content",
    205: "Reset Content",
    206: "Partial Content",
    207: "Multi-Status",
    208: "Already Reported",
    226: "IM Used",
    300: "Multiple Choices",
    301: "Moved Permanently",
    302: "Found",
    303: "See Other",
    304: "Not Modified",
    305: "Use Proxy",
    306: "Switch Proxy",
    307: "Temporary Redirect",
    308: "Permanent Redirect",
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    411: "Length Required",
    412: "Precondition Failed",
    413: "Payload Too Large",
    414: "URI Too Long",
    415: "Unsupported Media Type",
    416: "Range Not Satisfiable",
    417: "Expectation Failed",
    418: "I'm a teapot",
    421: "Misdirected Request",
    422: "Unprocessable Entity",
    423: "Locked",
    424: "Failed Dependency",
    425: "Too Early",
    426: "Upgrade Required",
    428: "Precondition Required",
    429: "Too Many Requests",
    431: "Request Header Fields Too Large",
    451: "Unavailable For Legal Reasons",
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "HTTP Version Not Supported",
    506: "Variant Also Negotiates",
    507: "Insufficient Storage",
    508: "Loop Detected",
    510: "Not Extended",
    511: "Network Authentication Required",
};

export const STATUS_CODE_MESSAGES_METHOD_OVERRIDES: StatusCodeMessages = {
    200: {
        GET: "Retrieved",
        POST: "Successful", // more accurate than "Created" for POST
        PUT: "Updated",
        PATCH: "Updated",
        DELETE: "Deleted",
    },
};

export function getMessageForStatus(
    statusCode: number,
    method?: APIV1Read.HttpMethod
): string {
    // return the method-specific message if it exists
    if (method != null) {
        const methodOverrides =
            STATUS_CODE_MESSAGES_METHOD_OVERRIDES[statusCode];
        if (methodOverrides != null) {
            const message = methodOverrides[method];
            if (message != null) {
                return message;
            }
        }
    }

    // return the official status message if it exists
    const message = STATUS_CODE_MESSAGES[statusCode];
    if (message != null) {
        return message;
    }

    // return the default message if it exists
    if (statusCode >= 100 && statusCode < 200) {
        return "Informational";
    } else if (statusCode >= 200 && statusCode < 300) {
        return "Success";
    } else if (statusCode >= 300 && statusCode < 400) {
        return "Redirection";
    } else if (statusCode >= 400 && statusCode < 500) {
        return "Client Error";
    } else if (statusCode >= 500 && statusCode < 600) {
        return "Server Error";
    } else {
        return "Unknown Status";
    }
}
