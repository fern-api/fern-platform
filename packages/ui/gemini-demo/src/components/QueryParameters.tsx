import { APIV1Read } from "@fern-api/fdr-sdk";
import { ReactElement } from "react";
import { Parameter } from "./Parameter";

export function QueryParameters({ parameters }: { parameters: APIV1Read.QueryParameter[] }): ReactElement {
    return (
        <>
            <h3 className="mb-3 mt-12 text-2xl">Query parameters</h3>
            <ul>
                {parameters.map((parameter) => (
                    <Parameter key={parameter.key} parameter={parameter} />
                ))}
            </ul>
        </>
    );
}
