import { FernScrollArea, RemoteFontAwesomeIcon } from "@fern-ui/components";
import type { MDXRemoteProps } from "next-mdx-remote";
import { HTMLAttributes, PropsWithChildren, ReactElement } from "react";
import { Breadcrumbs } from "../api-page/Breadcrumbs.js";
import { BottomNavigationButtons } from "../components/BottomNavigationButtons.js";
import { FernErrorBoundaryProps, FernErrorTag } from "../components/FernErrorBoundary.js";
import { Feedback } from "../custom-docs-page/Feedback.js";
import { TableOfContents } from "../custom-docs-page/TableOfContents.js";
import { A, HeadingRenderer, Image, Li, Ol, P, Strong, Ul } from "./base-components.js";
import { AccordionGroup } from "./components/AccordionGroup.js";
import { Availability } from "./components/Availability.js";
import { Badge } from "./components/Badge.js";
import { Bleed } from "./components/Bleed.js";
import { Button, ButtonGroup } from "./components/Button.js";
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
} from "./components/Callout.js";
import { Card } from "./components/Card.js";
import { CardGroup } from "./components/CardGroup.js";
import { CodeBlock } from "./components/CodeBlock.js";
import { CodeGroup } from "./components/CodeGroup.js";
import { Column, ColumnGroup } from "./components/ColumnGroup.js";
import { Frame } from "./components/Frame.js";
import { HTML_TABLE_COMPONENTS } from "./components/HTMLTable.js";
import { IFrame } from "./components/IFrame.js";
import { EndpointRequestSnippet, EndpointResponseSnippet } from "./components/RequestSnippet.js";
import { Steps } from "./components/Steps.js";
import { TabGroup } from "./components/Tabs.js";
import { Tooltip } from "./components/Tooltip.js";

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
    IFrame,
};

export const HTML_COMPONENTS: MDXRemoteProps["components"] = {
    ...HTML_TABLE_COMPONENTS,
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
