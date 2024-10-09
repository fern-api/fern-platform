import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { WRITE_API_DEFINITION_ATOM, useIsReady, useNavigationNodes } from "../atoms";
import { ApiPageContext } from "../contexts/api-page";
import { DocsContent } from "../resolver/DocsContent";
import { BuiltWithFern } from "../sidebar/BuiltWithFern";
import { ApiReferenceContent } from "./ApiReferenceContent";

export declare namespace ApiReferencePage {
    export interface Props {
        content: DocsContent.ApiReferencePage;
    }
}

export const ApiReferencePage: React.FC<ApiReferencePage.Props> = ({ content }) => {
    const hydrated = useIsReady();

    const set = useSetAtom(WRITE_API_DEFINITION_ATOM);
    useEffect(() => set(content.apiDefinition), [content.apiDefinition, set]);

    const node = useNavigationNodes().get(content.apiReferenceNodeId);

    if (node?.type !== "apiReference") {
        // TODO: sentry
        // eslint-disable-next-line no-console
        console.error("Expected node to be an api reference node");
        return null;
    }

    return (
        <ApiPageContext.Provider value={true}>
            <ApiReferenceContent
                apiDefinition={content.apiDefinition}
                showErrors={node.showErrors ?? false}
                node={node}
                breadcrumb={content.breadcrumb}
                mdxs={content.mdxs}
                slug={content.slug}
            />

            {/* anchor links should get additional padding to scroll to on initial load */}
            {!hydrated && <div className="h-full" />}
            <div className="pb-36" />
            <BuiltWithFern className="w-fit mx-auto my-8" />
        </ApiPageContext.Provider>
    );
};
