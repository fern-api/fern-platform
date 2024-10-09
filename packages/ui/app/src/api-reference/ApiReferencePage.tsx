import { useSetAtom } from "jotai";
import { WRITE_API_DEFINITION_ATOM, useIsReady } from "../atoms";
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
    set(content.apiDefinition);

    return (
        <ApiPageContext.Provider value={true}>
            <ApiReferenceContent
                apiDefinition={content.apiDefinition}
                showErrors={content.apiReferenceNode.showErrors ?? false}
                node={content.apiReferenceNode}
                breadcrumb={content.breadcrumb}
                mdxs={content.mdxs}
            />

            {/* anchor links should get additional padding to scroll to on initial load */}
            {!hydrated && <div className="h-full" />}
            <div className="pb-36" />
            <BuiltWithFern className="w-fit mx-auto my-8" />
        </ApiPageContext.Provider>
    );
};
