import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { useMemo } from "react";
import { EndpointParameter } from "./EndpointParameter";
import { EndpointParametersSection } from "./EndpointParametersSection";

export declare namespace QueryParametersSection {
    export interface Props {
        queryParameters: FernRegistryApiRead.QueryParameter[];
        anchorIdParts: string[];
    }
}

export const QueryParametersSection: React.FC<QueryParametersSection.Props> = ({ queryParameters, anchorIdParts }) => {
    const convertedParameters = useMemo((): EndpointParameter.Props[] => {
        return queryParameters.map(
            (queryParameter): EndpointParameter.Props => ({
                name: queryParameter.key,
                type: queryParameter.type,
                description: queryParameter.description ?? undefined,
                descriptionContainsMarkdown: queryParameter.descriptionContainsMarkdown ?? false,
                anchorIdParts: [...anchorIdParts, queryParameter.key],
            })
        );
    }, [queryParameters, anchorIdParts]);

    return (
        <EndpointParametersSection
            title="Query parameters"
            parameters={convertedParameters}
            anchorIdParts={anchorIdParts}
        />
    );
};
