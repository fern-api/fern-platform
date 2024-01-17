import { APIV1Read } from "@fern-api/fdr-sdk";
import { useApiDefinitionContext } from "../../api-context/useApiDefinitionContext";
import { ApiPackageContents } from "../ApiPackageContents";
import { ApiPageMargins } from "../page-margins/ApiPageMargins";
import { useApiPageCenterElement } from "../useApiPageCenterElement";

export declare namespace ApiSubpackage {
    export interface Props {
        subpackageId: APIV1Read.SubpackageId;
        slug: string;
        isLastInParentPackage: boolean;
        anchorIdParts: string[];
    }
}

export const ApiSubpackage: React.FC<ApiSubpackage.Props> = ({
    subpackageId,
    slug,
    isLastInParentPackage,
    anchorIdParts,
}) => {
    const { resolveSubpackageById } = useApiDefinitionContext();
    const subpackage = resolveSubpackageById(subpackageId);
    const { setTargetRef } = useApiPageCenterElement({ slug });
    if (subpackage == null) {
        return null;
    }
    return (
        <>
            <ApiPageMargins>
                <div ref={setTargetRef} data-route={`/${slug}`.toLowerCase()} className="scroll-mt-16" />
            </ApiPageMargins>
            {subpackage != null && (
                <ApiPackageContents
                    package={subpackage}
                    slug={slug}
                    isLastInParentPackage={isLastInParentPackage}
                    anchorIdParts={anchorIdParts}
                />
            )}
        </>
    );
};
