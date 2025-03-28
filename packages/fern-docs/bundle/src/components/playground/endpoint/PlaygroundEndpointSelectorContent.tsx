"use client";

import { Fragment, forwardRef, useEffect, useRef, useState } from "react";

import { Search, Slash, X } from "lucide-react";

import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { isNonNullish } from "@fern-api/ui-core-utils";
import { cn } from "@fern-docs/components";
import {
  FernButton,
  FernInput,
  FernScrollArea,
  FernTooltipProvider,
} from "@fern-docs/components";
import { removeTrailingSlash } from "@fern-docs/utils";

import { BuiltWithFern } from "@/components/built-with-fern";
import { useCurrentPathname } from "@/hooks/use-current-pathname";

import { conformExplorerRoute } from "../utils/explorer-route";
import { ApiGroup } from "../utils/flatten-apis";
import { PlaygroundEndpointSelectorLeafNode } from "./PlaygroundEndpointSelectorLeafNode";

export interface PlaygroundEndpointSelectorContentProps {
  apiGroups: ApiGroup[];
  className?: string;
  shallow?: boolean;
  replace?: boolean;
}

function matchesEndpoint(
  query: string,
  group: ApiGroup,
  endpoint: FernNavigation.NavigationNodeApiLeaf
): boolean {
  return (
    group.breadcrumb.some((breadcrumb) =>
      breadcrumb.toLowerCase().includes(query.toLowerCase())
    ) ||
    endpoint.title?.toLowerCase().includes(query.toLowerCase()) ||
    (endpoint.type === "endpoint" &&
      endpoint.method.toLowerCase().includes(query.toLowerCase())) ||
    (endpoint.type === "webSocket" && "websocket".includes(query.toLowerCase()))
  );
}

export const PlaygroundEndpointSelectorContent = forwardRef<
  HTMLDivElement,
  PlaygroundEndpointSelectorContentProps
>(({ apiGroups, className, shallow, replace }, forwardedRef) => {
  const pathname = useCurrentPathname();

  const [filterValue, setFilterValue] = useState<string>("");

  const selectedItemRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    selectedItemRef.current?.scrollIntoView({ block: "center" });
  }, []);

  function renderApiDefinitionPackage(apiGroup: ApiGroup) {
    const apiLeafNodes = apiGroup.items
      .filter(
        (
          node
        ): node is FernNavigation.EndpointNode | FernNavigation.WebSocketNode =>
          node.type === "endpoint" || node.type === "webSocket"
      )
      .filter((node) => matchesEndpoint(filterValue, apiGroup, node));
    if (apiLeafNodes.length === 0) {
      return null;
    }
    return (
      <li key={apiGroup.id}>
        {apiGroup.breadcrumb.length > 0 && (
          <div className="flex h-[30px] items-center truncate px-3 py-1">
            {apiGroup.breadcrumb.map((breadcrumb, idx) => (
              <Fragment key={idx}>
                {idx > 0 && (
                  <Slash className="size-icon-sm text-(color:--grayscale-a9) mx-0.5" />
                )}
                <span className="text-(color:--accent-a11) shrink truncate whitespace-nowrap text-xs">
                  {breadcrumb}
                </span>
              </Fragment>
            ))}
          </div>
        )}
        <ul className="relative z-0 list-none">
          {apiLeafNodes.map((node) => {
            const active =
              removeTrailingSlash(pathname) === conformExplorerRoute(node.slug);
            return (
              <PlaygroundEndpointSelectorLeafNode
                key={node.id}
                node={node}
                active={active}
                ref={active ? selectedItemRef : undefined}
                filterValue={filterValue}
                shallow={shallow}
                replace={replace}
              />
            );
          })}
        </ul>
      </li>
    );
  }

  const renderedListItems = apiGroups
    .map((group) => renderApiDefinitionPackage(group))
    .filter(isNonNullish);
  return (
    <FernTooltipProvider>
      <div
        className={cn("relative flex size-full flex-col", className)}
        ref={forwardedRef}
      >
        <div className={cn("relative z-20 px-3 pb-0 pt-3")}>
          <FernInput
            leftIcon={<Search className="size-icon" />}
            data-1p-ignore="true"
            autoFocus={true}
            value={filterValue}
            onValueChange={setFilterValue}
            rightElement={
              filterValue.length > 0 && (
                <FernButton
                  icon={<X />}
                  variant="minimal"
                  onClick={() => setFilterValue("")}
                />
              )
            }
            placeholder="Search for endpoints..."
          />
        </div>
        <FernScrollArea
          rootClassName="min-h-0 flex-1 shrink w-full"
          className="mask-grad-y-6 !flex w-full overscroll-contain"
          scrollbars="vertical"
          asChild
        >
          <ul className="flex h-fit w-full list-none flex-col gap-4 p-3">
            {renderedListItems}
          </ul>
          <div className="!h-6"></div>
        </FernScrollArea>
        <div className="border-border-default bg-background border-t px-6 py-4">
          <BuiltWithFern />
        </div>
      </div>
    </FernTooltipProvider>
  );
});

PlaygroundEndpointSelectorContent.displayName =
  "PlaygroundEndpointSelectorContent";
