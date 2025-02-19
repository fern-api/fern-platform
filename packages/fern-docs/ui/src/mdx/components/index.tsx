import { RemoteFontAwesomeIcon } from "@fern-docs/components";
import type { MDXComponents } from "@fern-docs/mdx";
import dynamic from "next/dynamic";
import { ComponentProps, PropsWithChildren, ReactElement } from "react";
import {
  FernErrorBoundary,
  FernErrorBoundaryProps,
  FernErrorTag,
} from "../../components/FernErrorBoundary";
import { SidebarSearchBar } from "../../sidebar/SidebarSearchBar";
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
import { Json } from "./json";
import { Mermaid } from "./mermaid";
import { ParamField } from "./mintlify";
import { ReferenceLayoutAside, ReferenceLayoutMain } from "./reference-layout";
import {
  EndpointRequestSnippet,
  EndpointResponseSnippet,
  EndpointSchemaSnippet,
} from "./snippets";
import { Step, StepGroup } from "./steps";
import { TabGroup } from "./tabs";
import { Tooltip } from "./tooltip";

const ElevenLabsWaveform = dynamic(() =>
  import("./waveform/WaveformComplex").then((mod) => mod.default)
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
  EndpointSchemaSnippet,
  Feature,
  Frame,
  Icon: RemoteFontAwesomeIcon,
  If,
  Mermaid,
  ParamField,
  SearchBar: SidebarSearchBar,
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
  Cards: CardGroup,
  CodeBlocks: CodeGroup,
  Tabs: TabGroup,
  ElevenLabsWaveform,
  Json,
};

// internal-use only
const INTERNAL_COMPONENTS = {
  ReferenceLayoutMain,
  ReferenceLayoutAside,

  // error boundary
  FernErrorBoundary: (
    props: PropsWithChildren<Pick<FernErrorBoundaryProps, "error" | "fallback">>
  ): ReactElement => <FernErrorBoundary {...props} />,
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
  img: Image,
  strong: Strong,
};

const ALIASED_HTML_COMPONENTS = {
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

export const MDX_COMPONENTS: MDXComponents = {
  ...FERN_COMPONENTS,
  ...INTERNAL_COMPONENTS,
  ...HTML_COMPONENTS,
  ...ALIASED_HTML_COMPONENTS,
};

export function createMdxComponents(jsxElements: string[]): MDXComponents {
  return {
    // spread in jsx elements that may be unsupported
    ...jsxElements.reduce<Record<string, () => ReactElement>>(
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
