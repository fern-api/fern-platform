import type { MDXRemoteProps } from "next-mdx-remote";
import { HTMLAttributes, PropsWithChildren, ReactElement } from "react";
import { Breadcrumbs } from "../api-page/Breadcrumbs";
import { RemoteFontAwesomeIcon } from "../commons/FontAwesomeIcon";
import { BottomNavigationButtons } from "../components/BottomNavigationButtons";
import { FernErrorBoundaryProps, FernErrorTag } from "../components/FernErrorBoundary";
import { FernScrollArea } from "../components/FernScrollArea";
import { Feedback } from "../custom-docs-page/Feedback";
import { TableOfContents } from "../custom-docs-page/TableOfContents";
import { A, HeadingRenderer, Image, Li, Ol, P, Strong, Table, Tbody, Td, Th, Thead, Tr, Ul } from "./base-components";
import { AccordionGroup } from "./components/AccordionGroup";
import { Availability } from "./components/Availability";
import { Badge } from "./components/Badge";
import { Bleed } from "./components/Bleed";
import { Button, ButtonGroup } from "./components/Button";
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
import { CardGroup } from "./components/CardGroup";
import { CodeBlock } from "./components/CodeBlock";
import { CodeGroup } from "./components/CodeGroup";
import { Column, ColumnGroup } from "./components/ColumnGroup";
import { Frame } from "./components/Frame";
import { EndpointRequestSnippet, EndpointResponseSnippet } from "./components/RequestSnippet";
import { Steps } from "./components/Steps";
import { TabGroup } from "./components/Tabs";
import { Tooltip } from "./components/Tooltip";

export const JSX_COMPONENTS = {
    // fern components
    AccordionGroup,
    Availability,
    Badge,
    Bleed,
    Button,
    ButtonGroup,
    Breadcrumbs,
    Callout,
    Card,
    CardGroup,
    CodeBlock,
    CodeGroup, // note: alias is handled in rehypeFernCode
    Column,
    ColumnGroup,
    EndpointRequestSnippet,
    EndpointResponseSnippet,
    Frame,
    Feedback,
    Icon: RemoteFontAwesomeIcon,
    ScrollArea: FernScrollArea,
    Steps,
    TabGroup,
    Tooltip,

    // deprecated, aliased for backwards compatibility
    Cards: CardGroup,
    CodeBlocks: CodeGroup,
    Tabs: TabGroup,

    // callout aliases
    Info: InfoCallout,
    Warning: WarningCallout,
    Success: SuccessCallout,
    Error: ErrorCallout,
    Note: NoteCallout,
    Tip: TipCallout,
    Check: CheckCallout,
    LaunchNote: LaunchNoteCallout,

    // layout components (internal use only)
    TableOfContents,
    BottomNavigationButtons,

    // error boundary (internal use only)
    MdxErrorBoundary: (props: PropsWithChildren<Pick<FernErrorBoundaryProps, "error">>): ReactElement => (
        <FernErrorTag component="MdxErrorBoundary" {...props} />
    ),

    Image,
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
    img: Image,
    strong: Strong,
};
