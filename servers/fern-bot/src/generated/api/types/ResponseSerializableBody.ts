/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as FernProxy from "../index";

export interface ResponseSerializableBody {
    headers: Record<string, string>;
    ok: boolean;
    redirected: boolean;
    status: number;
    statusText: string;
    type: FernProxy.ResponseType;
    url: string;
}
