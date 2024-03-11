import { FC, PropsWithChildren } from "react";
import { useNavigationContext } from "../../contexts/navigation-context";
import "./Steps.scss";

export declare namespace RequestSnippet {
    export interface Props {
        endpoint: string;
    }
}

export const RequestSnippet: FC<PropsWithChildren<RequestSnippet.Props>> = () => {
    const { resolvedPath } = useNavigationContext();

    if (resolvedPath.type !== "custom-markdown-page") {
        return null;
    } else {
        return (
            <div>
                {resolvedPath.test?.api}
                {/* <EndpointContent
                    api={"test"}
                    showErrors={false}
                    endpoint={"teadsf"}
                    breadcrumbs={}
                    setContainerRef={}
                    hideBottomSeparator={}
                    isInViewport={true}
                    types={}
                /> */}
            </div>
        );
    }
};
