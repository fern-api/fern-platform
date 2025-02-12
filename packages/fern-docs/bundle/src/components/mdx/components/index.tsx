"use client";

import dynamic from "next/dynamic";
import React, { ComponentProps, ReactElement } from "react";

import { FaIcon } from "@fern-docs/components";
import type { MDXComponents } from "@fern-docs/mdx";

import {
  ErrorBoundary,
  ErrorBoundaryFallback,
} from "@/components/error-boundary";
import { SearchV2Trigger } from "@/state/search";

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
import { EndpointRequestSnippet, EndpointResponseSnippet } from "./snippets";
import { Step, StepGroup } from "./steps";
import { TabGroup } from "./tabs";
import { Tooltip } from "./tooltip";

const ElevenLabsWaveform = dynamic(
  () => import("./waveform/WaveformComplex").then((mod) => mod.default),
  { ssr: false, loading: () => <div className="h-[400px]" /> } // prevent layout shift
);

const FERN_COMPONENTS = {
  AccordionGroup,
  Availability,
  Badge,
  Bleed,
  Button,
  ButtonGroup,
  Callout,
  Card,
  CardGroup,
  ClientLibraries,
  CodeBlock,
  CodeGroup, // note: alias is handled in rehypeFernCode
  Column,
  ColumnGroup,
  EndpointRequestSnippet,
  EndpointResponseSnippet,
  Feature,
  Frame,
  Icon: FaIcon,
  If,
  Mermaid,
  ParamField,
  SearchBar: SearchV2Trigger,
  Step,
  StepGroup,
  TabGroup,
  Tooltip,

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
  // ReferenceLayoutMain: (
  //   props: React.ComponentProps<typeof ReferenceLayoutMain>
  // ) => <ReferenceLayoutMain {...props} />,
  // ReferenceLayoutAside: (
  //   props: React.ComponentProps<typeof ReferenceLayoutAside>
  // ) => <ReferenceLayoutAside {...props} />,

  // error boundary
  ErrorBoundary: (props: React.ComponentProps<typeof ErrorBoundary>) => (
    <ErrorBoundary {...props} />
  ),
};

const HTML_COMPONENTS = {
  table: Table,
  h1: (props: ComponentProps<"h1">) => HeadingRenderer(1, props),
  h2: (props: ComponentProps<"h2">) => HeadingRenderer(2, props),
  h3: (props: ComponentProps<"h3">) => HeadingRenderer(3, props),
  h4: (props: ComponentProps<"h4">) => HeadingRenderer(4, props),
  h5: (props: ComponentProps<"h5">) => HeadingRenderer(5, props),
  h6: (props: ComponentProps<"h6">) => HeadingRenderer(6, props),
  ol: Ol,
  ul: Ul,
  li: Li,
  a: A,
  // eslint-disable-next-line jsx-a11y/alt-text
  img: (props: React.ComponentProps<"img">) => <Image {...props} />,
  strong: Strong,
};

const ALIASED_HTML_COMPONENTS = {
  Image,
  IFrame,
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
  Ol,
  Ul,
  Li,
  A,
  Strong,
  Table,
};

export const MDX_COMPONENTS = {
  ...FERN_COMPONENTS,
  ...INTERNAL_COMPONENTS,
  ...HTML_COMPONENTS,
  ...ALIASED_HTML_COMPONENTS,
} as MDXComponents;

export function createMdxComponents(jsxElements: string[]): MDXComponents {
  return {
    // spread in jsx elements that may be unsupported
    ...jsxElements.reduce<Record<string, () => ReactElement<any>>>(
      (acc, jsxElement) => {
        acc[jsxElement] = () => (
          <ErrorBoundaryFallback
            error={new Error(`Unsupported JSX tag: <${jsxElement} />`)}
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
