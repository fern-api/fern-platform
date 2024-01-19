import { joinUrlSlugs } from "@fern-api/fdr-sdk";
import { ResolvedSubpackage } from "@fern-ui/app-utils";
import { ApiPackageContents } from "../ApiPackageContents";
import { ApiPageMargins } from "../page-margins/ApiPageMargins";
import { useApiPageCenterElement } from "../useApiPageCenterElement";

export declare namespace ApiSubpackage {
    export interface Props {
        subpackage: ResolvedSubpackage;
        isLastInParentPackage: boolean;
        anchorIdParts: string[];
    }
}

export const ApiSubpackage: React.FC<ApiSubpackage.Props> = ({ subpackage, isLastInParentPackage, anchorIdParts }) => {
    const subpackageSlug = joinUrlSlugs(...subpackage.slug);
    const { setTargetRef } = useApiPageCenterElement({ slug: subpackageSlug });
    return (
        <>
            <ApiPageMargins>
                <div ref={setTargetRef} data-route={`/${subpackageSlug}`.toLowerCase()} className="scroll-mt-16" />
            </ApiPageMargins>
            {subpackage != null && (
                <ApiPackageContents
                    package={subpackage}
                    isLastInParentPackage={isLastInParentPackage}
                    anchorIdParts={anchorIdParts}
                />
            )}
        </>
    );
};
