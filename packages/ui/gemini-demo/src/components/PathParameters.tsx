import { ReactElement } from "react";
import { Parameter } from "./Parameter";
import { APIV1Read } from "@fern-api/fdr-sdk";

export function PathParameters({ parameters }: { parameters: APIV1Read.PathParameter[] }): ReactElement {
    return (
        <>
            <h3 className="mb-3 mt-12 text-2xl">Path parameters</h3>
            <ul>
                {parameters.map((parameter) => (
                    <Parameter key={parameter.key} parameter={parameter} />
                ))}
            </ul>
        </>
    );
}
