import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { useApiPageCenterElement } from "../useApiPageCenterElement";
import { EndpointContent } from "./EndpointContent";

export declare namespace Endpoint {
    export interface Props {
        endpoint: FernRegistryApiRead.EndpointDefinition;
        isLastInApi: boolean;
        package: FernRegistryApiRead.ApiDefinitionPackage;
        slug: string;
        anchorIdParts: string[];
    }
}

export const Endpoint: React.FC<Endpoint.Props> = ({
    endpoint,
    slug,
    package: package_,
    isLastInApi,
    anchorIdParts,
}) => {
    const { setTargetRef } = useApiPageCenterElement({ slug });

    return (
        <EndpointContent
            endpoint={endpoint}
            setContainerRef={setTargetRef}
            package={package_}
            hideBottomSeparator={isLastInApi}
            anchorIdParts={[...anchorIdParts, endpoint.id]}
        />
    );
};
