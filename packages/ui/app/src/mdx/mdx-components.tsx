import { MDXRemoteProps } from "next-mdx-remote";
import { HTMLAttributes, PropsWithChildren, ReactElement } from "react";
import { RemoteFontAwesomeIcon } from "../commons/FontAwesomeIcon";
import { FernErrorBoundary } from "../components/FernErrorBoundary";
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
import { Accordion } from "./components/Accordion";
import { Availability } from "./components/Availability";
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
import { CodeBlock } from "./components/CodeBlock";
import { CodeBlocks } from "./components/CodeBlocks";
import { Tabs } from "./components/Tabs";

export const JSX_COMPONENTS = {
    Availability,
    Card,
    Cards,
    CardGroup: Cards,
    CodeBlock,
    CodeBlocks,
    CodeGroup: CodeBlocks, // alias is handled in rehypeFernCode
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
    MdxErrorBoundary: (props: PropsWithChildren): ReactElement => <FernErrorBoundary type="mdx" {...props} />,
    Tabs,
    AccordionGroup: Accordion,
};

export const HTML_COMPONENTS: MDXRemoteProps["components"] = {
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
};
