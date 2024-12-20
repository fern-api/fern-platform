/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as FernRegistry from "../../../../../../../index";
import * as core from "../../../../../../../../core";

export type Error =
    | FernRegistry.docs.v2.write.transferOwnershipOfDomain.Error.DocsNotFoundError
    | FernRegistry.docs.v2.write.transferOwnershipOfDomain.Error.UnauthorizedError
    | FernRegistry.docs.v2.write.transferOwnershipOfDomain.Error._Unknown;

export declare namespace Error {
    interface DocsNotFoundError {
        error: "DocsNotFoundError";
    }

    interface UnauthorizedError {
        error: "UnauthorizedError";
        content: string;
    }

    interface _Unknown {
        error: void;
        content: core.Fetcher.Error;
    }

    interface _Visitor<_Result> {
        docsNotFoundError: () => _Result;
        unauthorizedError: (value: string) => _Result;
        _other: (value: core.Fetcher.Error) => _Result;
    }
}

export const Error = {
    docsNotFoundError: (): FernRegistry.docs.v2.write.transferOwnershipOfDomain.Error.DocsNotFoundError => {
        return {
            error: "DocsNotFoundError",
        };
    },

    unauthorizedError: (
        value: string
    ): FernRegistry.docs.v2.write.transferOwnershipOfDomain.Error.UnauthorizedError => {
        return {
            content: value,
            error: "UnauthorizedError",
        };
    },

    _unknown: (
        fetcherError: core.Fetcher.Error
    ): FernRegistry.docs.v2.write.transferOwnershipOfDomain.Error._Unknown => {
        return {
            error: undefined,
            content: fetcherError,
        };
    },

    _visit: <_Result>(
        value: FernRegistry.docs.v2.write.transferOwnershipOfDomain.Error,
        visitor: FernRegistry.docs.v2.write.transferOwnershipOfDomain.Error._Visitor<_Result>
    ): _Result => {
        switch (value.error) {
            case "DocsNotFoundError":
                return visitor.docsNotFoundError();
            case "UnauthorizedError":
                return visitor.unauthorizedError(value.content);
            default:
                return visitor._other(value as any);
        }
    },
} as const;
