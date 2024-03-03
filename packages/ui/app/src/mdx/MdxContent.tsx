import { MDXRemote, type MDXRemoteProps } from "next-mdx-remote";
import React, { HTMLAttributes } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { capturePosthogEvent } from "../analytics/posthog";
import { RemoteFontAwesomeIcon } from "../commons/FontAwesomeIcon";
import { SerializedMdxContent } from "../util/mdx";
import {
    A,
    H1,
    H2,
    H3,
    H4,
    H5,
    H6,
    Img,
    Li,
    Ol,
    P,
    Strong,
    Table,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    Ul,
} from "./base-components";
import { Availability } from "./components/Availability";
import { Callout } from "./components/Callout";
import { Card } from "./components/Card";
import { Cards } from "./components/Cards";
import { CodeBlocks } from "./components/CodeBlocks";
import { SyntaxHighlighter } from "./components/SyntaxHighlighter";
import { MdxErrorBoundaryContent } from "./MdxErrorBoundaryContent";

export declare namespace MdxContent {
    export interface Props {
        mdx: SerializedMdxContent;
    }
}

const COMPONENTS: MDXRemoteProps["components"] = {
    // code: ({ className, ...rest }) => {
    //     return <code {...rest} className={classNames(className, "not-prose")} />;
    // },
    table: Table,
    thead: Thead,
    tbody: Tbody,
    tr: Tr,
    th: Th,
    td: Td,
    h1: H1,
    h2: H2,
    h3: H3,
    h4: H4,
    h5: H5,
    h6: H6,
    p: (props: HTMLAttributes<HTMLParagraphElement>) => <P variant="markdown" {...props} />,
    P,
    ol: Ol,
    ul: Ul,
    li: Li,
    a: A,
    img: Img,
    strong: Strong,
    Availability,
    Cards,
    Card,
    CodeBlocks,
    Callout,
    Icon: RemoteFontAwesomeIcon,
    SyntaxHighlighter,
};

export const MdxContent = React.memo<MdxContent.Props>(function MdxContent({ mdx }) {
    if (typeof mdx === "string") {
        return <>{mdx}</>;
    }

    return (
        <ErrorBoundary
            FallbackComponent={MdxErrorBoundaryContent}
            onError={(error) => {
                capturePosthogEvent("failed_to_render_mdx", { error });
            }}
        >
            <MDXRemote {...mdx} components={COMPONENTS}></MDXRemote>
        </ErrorBoundary>
    );
});
