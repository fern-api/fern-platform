import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { FernButton, FernScrollArea } from "@fern-docs/components";
import {
  getSlugForSearchRecord,
  type SearchRecord,
} from "@fern-docs/search-utils";
import { useKeyboardPress } from "@fern-ui/react-commons";
import { Minus, Xmark } from "iconoir-react";
import { useRouter } from "next/router";
import React, {
  PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useInfiniteHits, useInstantSearch } from "react-instantsearch";
import { useBasePath, useCloseSearchDialog } from "../atoms";
import { Separator } from "../components/Separator";
import { useToHref } from "../hooks/useHref";
import { SearchHit } from "./SearchHit";

export const EmptyStateView: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="justify hits-center t-muted flex h-24 w-full flex-col py-3">
      {children}
    </div>
  );
};

const SEARCH_HITS_PER_SECTION = 3;

const expandHits = (expanded: boolean, hits: SearchRecord[]) => {
  return expanded ? hits : hits.slice(0, SEARCH_HITS_PER_SECTION);
};

const ExpandButton: React.FC<{
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
}> = ({ expanded, setExpanded }) => (
  <div className="flex justify-end pt-2">
    <FernButton
      className="text-left"
      variant="minimal"
      onClick={() => setExpanded(!expanded)}
      icon={expanded ? <Minus /> : <Xmark className="rotate-45 transition" />}
      size="small"
    >
      Show {expanded ? "Less" : "More"}
    </FernButton>
  </div>
);

const SearchSection: React.FC<{
  title: string;
  hits: SearchRecord[];
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  refs: React.MutableRefObject<Map<string, HTMLAnchorElement>>;
  hoveredSearchHitId: string | null;
  setHoveredSearchHitId: (id: string) => void;
}> = ({
  title,
  hits,
  expanded,
  setExpanded,
  refs,
  hoveredSearchHitId,
  setHoveredSearchHitId,
}) => (
  <div className="pb-2">
    <div className="flex items-center justify-between">
      <div className="text-normal pl-0.5 font-semibold">{title}</div>
    </div>
    <Separator orientation="horizontal" decorative className="bg-accent my-2" />
    {expandHits(expanded, hits).map((hit) => (
      <SearchHit
        setRef={(elem) => {
          if (elem != null) {
            refs.current.set(hit.objectID, elem);
          }
        }}
        key={hit.objectID}
        hit={hit}
        isHovered={hoveredSearchHitId === hit.objectID}
        onMouseEnter={() => setHoveredSearchHitId(hit.objectID)}
      />
    ))}
    {hits.length > SEARCH_HITS_PER_SECTION && (
      <ExpandButton expanded={expanded} setExpanded={setExpanded} />
    )}
  </div>
);

const MobileSearchSection: React.FC<{
  title: string;
  hits: SearchRecord[];
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  refs: React.MutableRefObject<Map<string, HTMLAnchorElement>>;
}> = ({ title, hits, expanded, setExpanded, refs }) => (
  <>
    <h3 className="mt-4 pl-0.5 text-lg font-semibold">{title}</h3>
    <Separator orientation="horizontal" decorative className="bg-accent my-2" />
    {expandHits(expanded, hits).map((hit) => (
      <SearchHit
        setRef={(elem) => {
          if (elem != null) {
            refs.current.set(hit.objectID, elem);
          }
        }}
        key={hit.objectID}
        hit={hit}
      />
    ))}
    <ExpandButton expanded={expanded} setExpanded={setExpanded} />
  </>
);

const isAskAiEnabled = false;

export const SearchHits: React.FC = () => {
  // const { isAskAiEnabled } = useFeatureFlags();
  const basePath = useBasePath();
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  const { hits } = useInfiniteHits<SearchRecord>();
  const search = useInstantSearch();
  const [hoveredSearchHitId, setHoveredSearchHitId] = useState<string | null>(
    null
  );
  const router = useRouter();
  const closeSearchDialog = useCloseSearchDialog();
  const [orderedHits, setOrderedHits] = useState<SearchRecord[]>([]);
  const [expandEndpoints, setExpandEndpoints] = useState(false);
  const [expandPages, setExpandPages] = useState(false);

  const refs = useRef(new Map<string, HTMLAnchorElement>());

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    const handleMouseMove = () => {
      document.exitPointerLock();
    };
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    setExpandEndpoints(false);
    setExpandPages(false);
  }, [hits]);
  useEffect(() => {
    const { pageHits, endpointHits } = filterHits(hits);
    setOrderedHits([
      ...expandHits(expandPages, pageHits),
      ...expandHits(expandEndpoints, endpointHits),
    ]);
  }, [hits, expandEndpoints, expandPages]);

  const hoveredSearchHit = useMemo(() => {
    return orderedHits
      .map((hit, index) => ({ record: hit, index }))
      .find(({ record }) => record.objectID === hoveredSearchHitId);
  }, [orderedHits, hoveredSearchHitId]);

  useEffect(() => {
    const [firstHit] = hits;
    if (firstHit != null) {
      setHoveredSearchHitId((id) => id ?? firstHit.objectID);
    }
  }, [hits]);

  useKeyboardPress({
    key: "Up",
    onPress: () => {
      if (hoveredSearchHit == null) {
        setHoveredSearchHitId(null);
        return;
      }

      const previousHit = orderedHits[hoveredSearchHit.index - 1];
      if (previousHit != null) {
        setHoveredSearchHitId(previousHit.objectID);
        const ref = refs.current.get(previousHit.objectID);
        void ref?.requestPointerLock();
        ref?.focus();
      }
    },
    capture: true,
  });

  useKeyboardPress({
    key: "Down",
    onPress: () => {
      const nextHit =
        orderedHits[hoveredSearchHit != null ? hoveredSearchHit.index + 1 : 0];
      if (nextHit != null) {
        setHoveredSearchHitId(nextHit.objectID);
        const ref = refs.current.get(nextHit.objectID);
        void ref?.requestPointerLock();
        ref?.focus();
      }
    },
    capture: true,
  });

  const toHref = useToHref();
  const navigateToHoveredHit = async () => {
    if (hoveredSearchHit == null) {
      return;
    }
    const slug = FernNavigation.Slug(
      getSlugForSearchRecord(hoveredSearchHit.record, basePath)
    );
    void router.push(toHref(slug), undefined, {
      // TODO: shallow=true if currently in long scrolling api reference and the hit is on the same page
      shallow: false,
    });
    closeSearchDialog();
  };

  useKeyboardPress({
    key: "Enter",
    onPress: navigateToHoveredHit,
    preventDefault: true,
    capture: true,
  });

  useKeyboardPress({
    key: "Tab",
    onPress: navigateToHoveredHit,
    preventDefault: true,
    capture: true,
  });

  if (
    (hits.length === 0 && !isAskAiEnabled) ||
    search.results.query.length === 0
  ) {
    return null;
  }

  const { endpointHits, pageHits } = filterHits(hits);

  return (
    <FernScrollArea
      rootClassName="border-default min-h-0 flex-1 shrink border-t"
      className="p-2"
      scrollbars="vertical"
    >
      {pageHits.length > 0 && (
        <SearchSection
          title="Pages"
          hits={pageHits}
          expanded={expandPages}
          setExpanded={setExpandPages}
          refs={refs}
          hoveredSearchHitId={hoveredSearchHitId}
          setHoveredSearchHitId={setHoveredSearchHitId}
        />
      )}
      {endpointHits.length > 0 && (
        <SearchSection
          title="Endpoints"
          hits={endpointHits}
          expanded={expandEndpoints}
          setExpanded={setExpandEndpoints}
          refs={refs}
          hoveredSearchHitId={hoveredSearchHitId}
          setHoveredSearchHitId={setHoveredSearchHitId}
        />
      )}
    </FernScrollArea>
  );
};

export const SearchMobileHits: React.FC<PropsWithChildren> = ({ children }) => {
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  const { hits } = useInfiniteHits<SearchRecord>();
  const search = useInstantSearch();
  const [expandEndpoints, setExpandEndpoints] = useState(false);
  const [expandPages, setExpandPages] = useState(false);

  const refs = useRef(new Map<string, HTMLAnchorElement>());

  if (search.results.query.length === 0) {
    // fallback to the default view
    return <>{children}</>;
  }

  if (hits.length === 0) {
    return (
      <div className="justify hits-center t-muted flex w-full flex-col py-3">
        No results found
      </div>
    );
  }

  const { endpointHits, pageHits } = filterHits(hits);

  return (
    <FernScrollArea
      rootClassName="min-h-[80vh]"
      className="mask-grad-top-4 px-2 pt-4"
    >
      {pageHits.length > 0 && (
        <MobileSearchSection
          title="Pages"
          hits={pageHits}
          expanded={expandPages}
          setExpanded={setExpandPages}
          refs={refs}
        />
      )}
      {endpointHits.length > 0 && (
        <MobileSearchSection
          title="Endpoints"
          hits={endpointHits}
          expanded={expandEndpoints}
          setExpanded={setExpandEndpoints}
          refs={refs}
        />
      )}
    </FernScrollArea>
  );
};

function filterHits(hits: SearchRecord[]) {
  const hitTypeMap = {
    endpoints: new Set([
      "endpoint",
      "endpoint-v2",
      "endpoint-v3",
      "webhook-v3",
      "websocket-v3",
      "endpoint-v4",
      "webhook-v4",
      "websocket-v4",
      "endpoint-field-v1",
      "webhook-field-v1",
      "websocket-field-v1",
    ]),
    pages: new Set([
      "page",
      "page-v2",
      "page-v3",
      "page-v4",
      "markdown-section-v1",
    ]),
  };

  const pageHits = hits.filter((hit) => hitTypeMap.pages.has(hit.type));
  const endpointHits = hits.filter((hit) => hitTypeMap.endpoints.has(hit.type));

  return { pageHits, endpointHits };
}
