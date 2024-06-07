import { APIV1Read } from "@fern-api/fdr-sdk";
import { ReactElement } from "react";
import { getTypeReferenceShorthand } from "./type-definition/shorthand";

export function Parameter({ parameter }: { parameter: APIV1Read.PathParameter | APIV1Read.QueryParameter }): ReactElement {
    return (
        <li className="flex flex-col gap-2 border-t border-[#DADCE0] py-4">
            <h4 className="inline-flex items-baseline gap-2">
                <span className="font-mono font-bold">{parameter.key}</span>
                <span className="text-sm">{getTypeReferenceShorthand(parameter.type)}</span>
            </h4>

            <div className="text-sm">{parameter.description}</div>
        </li>
    );
}
