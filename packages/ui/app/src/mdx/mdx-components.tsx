import { FernScrollArea, RemoteFontAwesomeIcon } from "@fern-ui/components";
import type { MDXComponents } from "mdx/types";
import { ComponentProps, PropsWithChildren, ReactElement } from "react";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { FernErrorBoundaryProps, FernErrorTag } from "../components/FernErrorBoundary";
import { Feedback } from "../custom-docs-page/Feedback";
import { CustomLayout } from "../layout/CustomLayout";
import { GuideLayout } from "../layout/GuideLayout";
import { OverviewLayout } from "../layout/OverviewLayout";
import { PageLayout } from "../layout/PageLayout";
import { ReferenceLayout } from "../layout/ReferenceLayout";
import { A, HeadingRenderer, Image, Li, Ol, Strong, Ul } from "./base-components";
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
import { Table } from "./components/HTMLTable";
import { IFrame } from "./components/IFrame";
import { InstallSdk } from "./components/InstallSdk";
import { ParamField } from "./components/ParamField";
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
    ParamField,
    ScrollArea: FernScrollArea,
    Steps,
    TabGroup,
    Tooltip,
    InstallSdk,

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
    CustomLayout,
    GuideLayout,
    OverviewLayout,
    PageLayout,
    ReferenceLayout,
    // TableOfContents,
    // BottomNavigationButtons,

    // error boundary (internal use only)
    MdxErrorBoundary: (props: PropsWithChildren<Pick<FernErrorBoundaryProps, "error">>): ReactElement => (
        <FernErrorTag component="MdxErrorBoundary" {...props} />
    ),

    Image,
    IFrame,
    H1: (props: ComponentProps<"h1">): ReactElement => HeadingRenderer(1, props),
    H2: (props: ComponentProps<"h2">): ReactElement => HeadingRenderer(2, props),
    H3: (props: ComponentProps<"h3">): ReactElement => HeadingRenderer(3, props),
    H4: (props: ComponentProps<"h4">): ReactElement => HeadingRenderer(4, props),
    H5: (props: ComponentProps<"h5">): ReactElement => HeadingRenderer(5, props),
    H6: (props: ComponentProps<"h6">): ReactElement => HeadingRenderer(6, props),
    Ol,
    Ul,
    Li,
    A,
    Strong,
    Table,
};

export const HTML_COMPONENTS: MDXComponents = {
    table: Table,
    h1: (props) => HeadingRenderer(1, props),
    h2: (props) => HeadingRenderer(2, props),
    h3: (props) => HeadingRenderer(3, props),
    h4: (props) => HeadingRenderer(4, props),
    h5: (props) => HeadingRenderer(5, props),
    h6: (props) => HeadingRenderer(6, props),
    ol: Ol,
    ul: Ul,
    li: Li,
    a: A,
    img: Image,
    strong: Strong,
};
