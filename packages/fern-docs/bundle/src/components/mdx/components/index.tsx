import { SearchV2Trigger } from "@/components/search";
import { FaIcon } from "@fern-docs/components";
import type { MDXComponents } from "@fern-docs/mdx";
import dynamic from "next/dynamic";
import React, { ComponentProps, PropsWithChildren, ReactElement } from "react";
import {
  FernErrorBoundary,
  FernErrorBoundaryProps,
  FernErrorTag,
} from "../../components/FernErrorBoundary";
import { AccordionGroup } from "./accordion";
import { Availability } from "./availability";
import { Badge } from "./badge";
import { Bleed } from "./bleed";
import { Button, ButtonGroup } from "./button";
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
} from "./callout";
import { Card, CardGroup } from "./card";
import { ClientLibraries } from "./client-libraries";
import { CodeBlock } from "./code/CodeBlock";
import { CodeGroup } from "./code/CodeGroup";
import { Column, ColumnGroup } from "./columns";
import { Feature } from "./feature";
import { Frame } from "./frame";
import { A, HeadingRenderer, Image, Li, Ol, Strong, Ul } from "./html";
import { Table } from "./html-table";
import { If } from "./if";
import { IFrame } from "./iframe";
import { Mermaid } from "./mermaid";
import { ParamField } from "./mintlify";
import { ReferenceLayoutAside, ReferenceLayoutMain } from "./reference-layout";
import { EndpointRequestSnippet, EndpointResponseSnippet } from "./snippets";
import { Step, StepGroup } from "./steps";
import { TabGroup } from "./tabs";
import { Tooltip } from "./tooltip";

const ElevenLabsWaveform = dynamic(
  () => import("./waveform/WaveformComplex").then((mod) => mod.default),
  { ssr: false, loading: () => <div className="h-[400px]" /> } // prevent layout shift
);

const FERN_COMPONENTS: MDXComponents = {
  AccordionGroup: (props: React.ComponentProps<typeof AccordionGroup>) => (
    <AccordionGroup {...props} />
  ),
  Availability: (props: React.ComponentProps<typeof Availability>) => (
    <Availability {...props} />
  ),
  Badge: (props: React.ComponentProps<typeof Badge>) => <Badge {...props} />,
  Bleed: (props: React.ComponentProps<typeof Bleed>) => <Bleed {...props} />,
  Button: (props: React.ComponentProps<typeof Button>) => <Button {...props} />,
  ButtonGroup: (props: React.ComponentProps<typeof ButtonGroup>) => (
    <ButtonGroup {...props} />
  ),
  Callout: (props: React.ComponentProps<typeof Callout>) => (
    <Callout {...props} />
  ),
  Card: (props: React.ComponentProps<typeof Card>) => <Card {...props} />,
  CardGroup: (props: React.ComponentProps<typeof CardGroup>) => (
    <CardGroup {...props} />
  ),
  ClientLibraries: (props: React.ComponentProps<typeof ClientLibraries>) => (
    <ClientLibraries {...props} />
  ),
  CodeBlock: (props: React.ComponentProps<typeof CodeBlock>) => (
    <CodeBlock {...props} />
  ),
  CodeGroup: (props: React.ComponentProps<typeof CodeGroup>) => (
    <CodeGroup {...props} />
  ), // note: alias is handled in rehypeFernCode
  Column: (props: React.ComponentProps<typeof Column>) => <Column {...props} />,
  ColumnGroup: (props: React.ComponentProps<typeof ColumnGroup>) => (
    <ColumnGroup {...props} />
  ),
  EndpointRequestSnippet: (
    props: React.ComponentProps<typeof EndpointRequestSnippet>
  ) => <EndpointRequestSnippet {...props} />,
  EndpointResponseSnippet: (
    props: React.ComponentProps<typeof EndpointResponseSnippet>
  ) => <EndpointResponseSnippet {...props} />,
  Feature: (props: React.ComponentProps<typeof Feature>) => (
    <Feature {...props} />
  ),
  Frame: (props: React.ComponentProps<typeof Frame>) => <Frame {...props} />,
  Icon: (props: React.ComponentProps<typeof FaIcon>) => <FaIcon {...props} />,
  If: (props: React.ComponentProps<typeof If>) => <If {...props} />,
  Mermaid: (props: React.ComponentProps<typeof Mermaid>) => (
    <Mermaid {...props} />
  ),
  ParamField: (props: React.ComponentProps<typeof ParamField>) => (
    <ParamField {...props} />
  ),
  SearchBar: (props: React.ComponentProps<typeof SearchV2Trigger>) => (
    <SearchV2Trigger {...props} />
  ),
  Step: (props: React.ComponentProps<typeof Step>) => <Step {...props} />,
  StepGroup: (props: React.ComponentProps<typeof StepGroup>) => (
    <StepGroup {...props} />
  ),
  TabGroup: (props: React.ComponentProps<typeof TabGroup>) => (
    <TabGroup {...props} />
  ),
  Tooltip: (props: React.ComponentProps<typeof Tooltip>) => (
    <Tooltip {...props} />
  ),

  // callout aliases
  Info: InfoCallout,
  Warning: WarningCallout,
  Success: SuccessCallout,
  Error: ErrorCallout,
  Note: NoteCallout,
  Tip: TipCallout,
  Check: CheckCallout,
  LaunchNote: LaunchNoteCallout,

  // deprecated, aliased for backwards compatibility
  Cards: (props: React.ComponentProps<typeof CardGroup>) => (
    <CardGroup {...props} />
  ),
  CodeBlocks: (props: React.ComponentProps<typeof CodeGroup>) => (
    <CodeGroup {...props} />
  ),
  Tabs: (props: React.ComponentProps<typeof TabGroup>) => (
    <TabGroup {...props} />
  ),
  ElevenLabsWaveform: (
    props: React.ComponentProps<typeof ElevenLabsWaveform>
  ) => <ElevenLabsWaveform {...props} />,
};

// internal-use only
const INTERNAL_COMPONENTS: MDXComponents = {
  ReferenceLayoutMain: (
    props: React.ComponentProps<typeof ReferenceLayoutMain>
  ) => <ReferenceLayoutMain {...props} />,
  ReferenceLayoutAside: (
    props: React.ComponentProps<typeof ReferenceLayoutAside>
  ) => <ReferenceLayoutAside {...props} />,

  // error boundary
  FernErrorBoundary: (
    props: PropsWithChildren<Pick<FernErrorBoundaryProps, "error" | "fallback">>
  ) => <FernErrorBoundary {...props} />,
};

const HTML_COMPONENTS: MDXComponents = {
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
  // eslint-disable-next-line jsx-a11y/alt-text
  img: (props: React.ComponentProps<"img">) => <Image {...props} />,
  strong: Strong,
};

const ALIASED_HTML_COMPONENTS: MDXComponents = {
  // eslint-disable-next-line jsx-a11y/alt-text
  Image: (props: React.ComponentProps<typeof Image>) => <Image {...props} />,
  IFrame: (props: React.ComponentProps<typeof IFrame>) => <IFrame {...props} />,
  H1: (props: ComponentProps<"h1">): ReactElement<any> =>
    HeadingRenderer(1, props),
  H2: (props: ComponentProps<"h2">): ReactElement<any> =>
    HeadingRenderer(2, props),
  H3: (props: ComponentProps<"h3">): ReactElement<any> =>
    HeadingRenderer(3, props),
  H4: (props: ComponentProps<"h4">): ReactElement<any> =>
    HeadingRenderer(4, props),
  H5: (props: ComponentProps<"h5">): ReactElement<any> =>
    HeadingRenderer(5, props),
  H6: (props: ComponentProps<"h6">): ReactElement<any> =>
    HeadingRenderer(6, props),
  Ol: (props: React.ComponentProps<typeof Ol>) => <Ol {...props} />,
  Ul: (props: React.ComponentProps<typeof Ul>) => <Ul {...props} />,
  Li: (props: React.ComponentProps<typeof Li>) => <Li {...props} />,
  A: (props: React.ComponentProps<typeof A>) => <A {...props} />,
  Strong: (props: React.ComponentProps<typeof Strong>) => <Strong {...props} />,
  Table: (props: React.ComponentProps<typeof Table>) => <Table {...props} />,
};

export const MDX_COMPONENTS: MDXComponents = {
  ...FERN_COMPONENTS,
  ...INTERNAL_COMPONENTS,
  ...HTML_COMPONENTS,
  ...ALIASED_HTML_COMPONENTS,
};

export function createMdxComponents(jsxElements: string[]): MDXComponents {
  return {
    // spread in jsx elements that may be unsupported
    ...jsxElements.reduce<Record<string, () => ReactElement<any>>>(
      (acc, jsxElement) => {
        acc[jsxElement] = () => (
          <FernErrorTag
            component={jsxElement}
            error={`Unsupported JSX tag: <${jsxElement} />`}
          />
        );
        return acc;
      },
      {}
    ),
    // then, spread in the supported components
    ...MDX_COMPONENTS,
  };
}
