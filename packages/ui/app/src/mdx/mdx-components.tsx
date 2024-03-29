import { MDXRemoteProps } from "next-mdx-remote";
import { HTMLAttributes, PropsWithChildren, ReactElement } from "react";
import { RemoteFontAwesomeIcon } from "../commons/FontAwesomeIcon";
import { FernErrorBoundaryProps, FernErrorTag } from "../components/FernErrorBoundary";
import { A, HeadingRenderer, Img, Li, Ol, P, Strong, Table, Tbody, Td, Th, Thead, Tr, Ul } from "./base-components";
import { Accordion } from "./components/Accordion";
import { Availability } from "./components/Availability";
import { Bleed } from "./components/Bleed";
import {
    Callout,
    CheckCallout,
    ErrorCallout,
    InfoCallout,
    LaunchNoteCallout,
    NoteCallout,
    SuccessCallout,
    TipCallout,
    WarningCallout,
} from "./components/Callout";
import { Card } from "./components/Card";
import { Cards } from "./components/Cards";
import { CodeGroup } from "./components/CodeGroup";
import { Frame } from "./components/Frame";
import { EndpointRequestSnippet, EndpointResponseSnippet } from "./components/RequestSnippet";
import { Steps } from "./components/Steps";
import { Tabs } from "./components/Tabs";

export const JSX_COMPONENTS = {
    Availability,
    Card,
    Cards,
    CardGroup: Cards,
    CodeGroup, // aliases [CodeBlock, CodeBlocks] are handled in rehypeFernCode
    Callout,
    Info: InfoCallout,
    Warning: WarningCallout,
    Success: SuccessCallout,
    Error: ErrorCallout,
    Note: NoteCallout,
    Tip: TipCallout,
    Check: CheckCallout,
    LaunchNote: LaunchNoteCallout,
    Icon: RemoteFontAwesomeIcon,
    MdxErrorBoundary: (props: PropsWithChildren<Pick<FernErrorBoundaryProps, "error">>): ReactElement => (
        <FernErrorTag component="MdxErrorBoundary" {...props} />
    ),
    Tabs,
    AccordionGroup: Accordion,
    Steps,
    EndpointRequestSnippet,
    EndpointResponseSnippet,
    Frame,
    Bleed,
};

export const HTML_COMPONENTS: MDXRemoteProps["components"] = {
    // code: ({ className, ...rest }) => {
    //     return <code {...rest} className={cn(className, "not-prose")} />;
    // },
    table: Table,
    thead: Thead,
    tbody: Tbody,
    tr: Tr,
    th: Th,
    td: Td,
    h1: (props) => HeadingRenderer(1, props),
    h2: (props) => HeadingRenderer(2, props),
    h3: (props) => HeadingRenderer(3, props),
    h4: (props) => HeadingRenderer(4, props),
    h5: (props) => HeadingRenderer(5, props),
    h6: (props) => HeadingRenderer(6, props),
    p: (props: HTMLAttributes<HTMLParagraphElement>) => <P variant="markdown" {...props} />,
    P,
    ol: Ol,
    ul: Ul,
    li: Li,
    a: A,
    img: Img,
    strong: Strong,
};
