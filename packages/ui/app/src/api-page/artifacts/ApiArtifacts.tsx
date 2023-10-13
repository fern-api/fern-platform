import { H2 } from "@blueprintjs/core";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { joinUrlSlugs } from "@fern-ui/app-utils";
import { useApiDefinitionContext } from "../../api-context/useApiDefinitionContext";
import { API_ARTIFACTS_TITLE } from "../../config";
import { HEADER_HEIGHT } from "../../constants";
import { ApiPageMargins } from "../page-margins/ApiPageMargins";
import { useApiPageCenterElement } from "../useApiPageCenterElement";
import { DotNetLogo } from "./sdk-logos/DotNetLogo";
import { GoLogo } from "./sdk-logos/GoLogo";
import { JavaLogo } from "./sdk-logos/JavaLogo";
import { PythonLogo } from "./sdk-logos/PythonLogo";
import { RubyLogo } from "./sdk-logos/RubyLogo";
import { SdkCard } from "./SdkCard";
import { SdkCardLayout } from "./SdkCardLayout";

export declare namespace ApiArtifacts {
    export interface Props {
        apiArtifacts: FernRegistryDocsRead.ApiArtifacts;
    }
}

export const ApiArtifacts: React.FC<ApiArtifacts.Props> = ({ apiArtifacts }) => {
    const { apiSlug } = useApiDefinitionContext();
    const slug = joinUrlSlugs(apiSlug, "client-libraries");

    const { setTargetRef } = useApiPageCenterElement({ slug });

    return (
        <ApiPageMargins>
            <div ref={setTargetRef} data-route={`/${slug}`} style={{ scrollMarginTop: HEADER_HEIGHT }}>
                <H2 className="pt-20">{API_ARTIFACTS_TITLE}</H2>
                <div className="t-muted mt-5 text-lg">
                    Official open-source client libraries for your favorite platforms.
                </div>
                <div className="mt-16 grid grid-cols-3 gap-10">
                    {apiArtifacts.sdks.map((sdk, index) => (
                        <SdkCard key={index} sdk={sdk} />
                    ))}
                    <SdkCardLayout
                        icon={<PythonLogo className="fill-text-muted-light dark:fill-text-muted-dark" />}
                        title={<div className="t-muted">Python</div>}
                        rightElement={
                            <div className="t-muted rounded-full bg-neutral-500/20 px-3 py-1 font-medium uppercase">
                                Coming Soon
                            </div>
                        }
                    />
                    <SdkCardLayout
                        icon={<JavaLogo className="fill-text-muted-light dark:fill-text-muted-dark" />}
                        title={<div className="t-muted">Java</div>}
                        rightElement={
                            <div className="t-muted rounded-full bg-neutral-500/20 px-3 py-1 font-medium uppercase">
                                Coming Soon
                            </div>
                        }
                    />
                    <SdkCardLayout
                        icon={<GoLogo className="fill-text-muted-light dark:fill-text-muted-dark" />}
                        title={<div className="t-muted">Go</div>}
                        rightElement={
                            <div className="t-muted rounded-full bg-neutral-500/20 px-3 py-1 font-medium uppercase">
                                Coming Soon
                            </div>
                        }
                    />
                    <SdkCardLayout
                        icon={<RubyLogo className="fill-text-muted-light dark:fill-text-muted-dark" />}
                        title={<div className="t-muted">Ruby</div>}
                        rightElement={
                            <div className="t-muted rounded-full bg-neutral-500/20 px-3 py-1 font-medium uppercase">
                                Coming Soon
                            </div>
                        }
                    />
                    <SdkCardLayout
                        icon={<DotNetLogo className="fill-text-muted-light dark:fill-text-muted-dark" />}
                        title={<div className="t-muted">.NET</div>}
                        rightElement={
                            <div className="t-muted rounded-full bg-neutral-500/20 px-3 py-1 font-medium uppercase">
                                Coming Soon
                            </div>
                        }
                    />
                </div>
            </div>
        </ApiPageMargins>
    );
};
