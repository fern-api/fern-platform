type StatusCodeMessages = {
    [method: string]: string;
};

type SuccessMessages = {
    [code: number]: StatusCodeMessages;
};

export const COMMON_SUCCESS_NAMES: SuccessMessages = {
    200: {
        PUT: "Updated",
        DELETE: "Deleted",
        default: "Success",
    },
    201: {
        PUT: "Updated",
        default: "Created",
    },
    202: {
        default: "Accepted",
    },
    203: {
        default: "Non-Authoritative Information",
    },
    204: {
        default: "No Content",
    },
    205: {
        default: "Reset Content",
    },
    206: {
        default: "Partial Content",
    },
    207: {
        default: "Multi-Status",
    },
    208: {
        default: "Already Reported",
    },
    226: {
        default: "IM Used",
    },
};

export function getSuccessMessageForStatus(statusCode: number, method: string): string {
    const messages = COMMON_SUCCESS_NAMES[statusCode];
    if (!messages) {
        return "Success";
    }
    return messages[method] ?? messages.default;
}
