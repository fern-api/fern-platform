import { useEffect } from "react";

import { TooltipPortal } from "@radix-ui/react-tooltip";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { groupBy } from "es-toolkit/array";
import type { Element as HastElement } from "hast";
import { useAtom, useAtomValue } from "jotai";
import { CONTINUE, EXIT, visit } from "unist-util-visit";

import { isNonNullish } from "@fern-api/ui-core-utils";
import { cn } from "@fern-docs/components";
import { Badge } from "@fern-docs/components/badges";

import { AlgoliaRecordHit } from "../../types";
import { PageIcon } from "../icons/page";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useChatbotTurnContext } from "./turn-context";

export function FootnoteSup({ node }: { node?: HastElement }) {
  const { footnotesAtom } = useChatbotTurnContext();
  const footnotes = useAtomValue(footnotesAtom);

  if (node == null) {
    return null;
  }

  const id = selectFootnoteId(node);

  if (!id) {
    return null;
  }

  const fn = footnotes.find((f) => f.ids.includes(id));

  if (!fn) {
    return null;
  }

  const index = footnotes.findIndex((f) => f.ids.includes(id));

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge
            rounded
            interactive
            asChild
            className="not-prose"
            disabled={!fn}
            size="sm"
          >
            <a href={fn?.url} target="_blank" rel="noreferrer" className="ms-1">
              <span className="text-grayscale-a9 text-xs">
                {String(index + 1)}
              </span>
            </a>
          </Badge>
        </TooltipTrigger>

        <TooltipPortal>
          <TooltipContent className="not-prose">
            <h5 className="text-grayscale-12 flex items-center gap-2 font-semibold">
              <PageIcon
                icon={fn.icon}
                type={fn.api_type ?? fn.type}
                isSubPage={fn.url.includes("#")}
                className="size-4"
              />
              <a href={fn.url} target="_blank" rel="noreferrer">
                {fn.title}
              </a>
            </h5>
            <p className="text-grayscale-a9 max-w-xs break-all text-xs leading-snug">
              <a
                href={fn.url}
                target="_blank"
                rel="noreferrer"
                className="hover:text-grayscale-a10 hover:underline"
              >
                {fn.url}
              </a>
            </p>
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  );
}

function selectFootnoteLinks(
  node: HastElement
): { id: string; href: string }[] {
  return (
    node.children
      .find(
        (child): child is HastElement =>
          child.type === "element" && child.tagName === "ol"
      )
      ?.children.filter(
        (child): child is HastElement =>
          child.type === "element" && child.tagName === "li"
      )
      .map((child) => {
        const id = child.properties.id;

        if (typeof id !== "string") {
          return null;
        }

        const href = selectHref(child);

        if (!href) {
          return null;
        }

        return { href, id };
      })
      .filter(isNonNullish) ?? []
  );
}

export function FootnotesSection({
  node,
  searchResults,
  className,
}: {
  node: HastElement;
  searchResults: AlgoliaRecordHit[];
  className?: string;
}) {
  const { footnotesAtom } = useChatbotTurnContext();
  const [footnotes, setFootnotes] = useAtom(footnotesAtom);

  useEffect(() => {
    setFootnotes(
      Object.entries(groupBy(selectFootnoteLinks(node), (n) => n.href)).map(
        ([href, links]) => ({
          ids: links.map((l) => l.id),
          url: href,
          title: searchResults.find((result) => result.url === href)?.title,
          icon: searchResults.find((result) => result.url === href)?.icon,
          type: searchResults.find((result) => result.url === href)?.type,
          api_type: searchResults.find((result) => result.url === href)
            ?.api_type,
        })
      )
    );
  }, [node, searchResults, setFootnotes]);

  if (footnotes.length === 0) {
    return null;
  }

  return (
    <section data-footnotes className={cn("not-prose", className)}>
      <VisuallyHidden asChild>
        <h6>Footnotes</h6>
      </VisuallyHidden>
      <div className="flex flex-wrap gap-1">
        {footnotes.map(({ ids, url, title, icon, type, api_type }, index) => (
          <Badge key={ids[0] ?? index} asChild interactive rounded>
            <a href={url} target="_blank" rel="noreferrer">
              <PageIcon
                icon={icon}
                type={api_type ?? type}
                isSubPage={url.includes("#")}
              />
              {title}
              <span className="text-grayscale-a9 text-xs">
                {String(index + 1)}
              </span>
            </a>
          </Badge>
        ))}
      </div>
    </section>
  );
}

function selectHref(node: HastElement): undefined | string {
  let href: undefined | string;
  visit(node, "element", (innerNode) => {
    if (
      innerNode.tagName === "a" &&
      typeof innerNode.properties.href === "string"
    ) {
      href = innerNode.properties.href;
      return EXIT;
    }
    return CONTINUE;
  });

  return href;
}

function selectFootnoteId(node: HastElement): string | undefined {
  if (node.type !== "element" || node.tagName !== "sup") {
    return undefined;
  }

  const child = node.children[0];

  if (!child || child.type !== "element" || child.tagName !== "a") {
    return undefined;
  }

  const id = child.properties.id;

  if (typeof id !== "string") {
    return undefined;
  }

  return id.replace("fnref", "fn");
}
