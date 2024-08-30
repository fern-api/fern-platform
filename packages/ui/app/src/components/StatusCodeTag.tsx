import { FernTag, FernTagProps, Intent } from "@fern-ui/components";
import { ReactElement } from "react";

export declare namespace StatusCodeTag {
    export interface Props extends Omit<FernTagProps, "colorScheme" | "children"> {
        statusCode: number;
    }
}

export function StatusCodeTag({ statusCode, className, ...rest }: StatusCodeTag.Props): ReactElement {
    return (
        <FernTag colorScheme={statusCodeToColorScheme(statusCode)} {...rest} className={className}>
            {statusCode}
        </FernTag>
    );
}

function statusCodeToColorScheme(statusCode: number): FernTagProps["colorScheme"] {
    if (statusCode >= 200 && statusCode < 300) {
        return "green";
    } else if (statusCode >= 300 && statusCode < 400) {
        return "amber";
    } else if (statusCode >= 400) {
        return "red";
    } else {
        return "gray";
    }
}

export function statusCodeToIntent(statusCode: number): Intent {
    if (statusCode >= 200 && statusCode < 300) {
        return "success";
    } else if (statusCode >= 300 && statusCode < 400) {
        return "warning";
    } else if (statusCode >= 400) {
        return "danger";
    } else {
        return "none";
    }
}
