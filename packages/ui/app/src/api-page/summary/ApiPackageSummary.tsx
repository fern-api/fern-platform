import { joinUrlSlugs } from "@fern-ui/fdr-utils";
import cn from "clsx";
import { FC } from "react";
import { FernErrorBoundary } from "../../components/FernErrorBoundary";
import { useFeatureFlags } from "../../contexts/FeatureFlagContext";
import { useShouldHideFromSsg } from "../../contexts/navigation-context/useNavigationContext";
import { CustomDocsPageHeader } from "../../custom-docs-page/CustomDocsPage";
import { MdxContent } from "../../mdx/MdxContent";
import { ResolvedWithApiDefinition, isResolvedRootPackage } from "../../util/resolver";
import { useApiPageCenterElement } from "../useApiPageCenterElement";
import { SummaryEndpointsCard } from "./SummaryEndpointsCard";
import { SummaryEnvironmentCard } from "./SummaryEnvironmentCard";

export declare namespace ApiPackageSummary {
    export interface Props {
        apiDefinition: ResolvedWithApiDefinition;
        breadcrumbs: string[];
        isLastInApi: boolean;
    }
}
export const ApiPackageSummary: FC<ApiPackageSummary.Props> = (props) => {
    const fullSlug = joinUrlSlugs(...props.apiDefinition.slug);

    if (useShouldHideFromSsg(fullSlug)) {
        return null;
    }

    return <ApiPackageSummaryContent {...props} />;
};

const ApiPackageSummaryContent: FC<ApiPackageSummary.Props> = ({ apiDefinition, breadcrumbs, isLastInApi }) => {
    const { isApiScrollingDisabled } = useFeatureFlags();
    const fullSlug = joinUrlSlugs(...apiDefinition.slug);
    const route = `/${fullSlug}`;

    const { setTargetRef } = useApiPageCenterElement({ slug: fullSlug });

    // if (apiDefinition.summaryContent == null) {
    //     return undefined;
    // }

    return (
        <div
            className={"scroll-mt-header-height-padded mx-4 md:mx-6 lg:mx-8"}
            ref={setTargetRef}
            data-route={route.toLowerCase()}
        >
            <article
                className={cn("scroll-mt-header-height max-w-content-width md:max-w-endpoint-width mx-auto", {
                    "border-default border-b mb-px": !isLastInApi && !isApiScrollingDisabled,
                })}
            >
                <CustomDocsPageHeader
                    className="pt-8"
                    title={apiDefinition.title ?? apiDefinition.name}
                    sectionTitleBreadcrumbs={breadcrumbs}
                    excerpt={undefined}
                />
                <div className="md:grid md:grid-cols-2 md:gap-8 lg:gap-12">
                    <section className="max-w-content-width space-y-12 py-8">
                        <main className="space-y-12">
                            {apiDefinition.summaryContent != null && (
                                <FernErrorBoundary>
                                    <MdxContent mdx={apiDefinition.summaryContent} />
                                </FernErrorBoundary>
                            )}
                        </main>
                    </section>
                    <aside className="max-w-content-width">
                        <div className="max-h-vh-minus-header scroll-mt-header-height top-header-height sticky flex flex-col gap-6 py-8">
                            {isResolvedRootPackage(apiDefinition) && (
                                <SummaryEnvironmentCard
                                    defaultEnvironment={apiDefinition.defaultEnvironment}
                                    environments={apiDefinition.environments}
                                />
                            )}
                            <SummaryEndpointsCard items={apiDefinition.items} />
                        </div>
                    </aside>
                </div>
            </article>
        </div>
    );
};
