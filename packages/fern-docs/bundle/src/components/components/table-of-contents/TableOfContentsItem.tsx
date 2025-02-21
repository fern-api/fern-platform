import { ReactElement, memo, useEffect, useRef } from "react";

import { cn } from "@fern-docs/components";

import { FernLink } from "../FernLink";

export interface TableOfContentsItemProps {
  text: string;
  anchorString: string;
  active: boolean;
  setActiveRef: (ref: HTMLLIElement) => void;
  depth?: number;
}

export const TableOfContentsItem = memo<TableOfContentsItemProps>(
  (props): ReactElement<any> => {
    const { text, anchorString, active, setActiveRef, depth = 0 } = props;
    const ref = useRef<HTMLLIElement>(null);

    useEffect(() => {
      if (active && ref.current != null) {
        setActiveRef?.(ref.current);
      }
    }, [active, setActiveRef]);

    return (
      <li className="mb-2 last:mb-0" ref={ref} data-depth={depth}>
        <FernLink
          className={cn(
            "block hyphens-auto break-words text-sm transition-colors hover:transition-none",
            {
              "text-(color:--grayscale-a11) hover:text-(color:--grayscale-a12)":
                !active,
              "text-(color:--accent-a12)": active,
            }
          )}
          href={`#${anchorString}`}
          style={{
            paddingLeft: `${depth * 12}px`,
          }}
        >
          {text}
        </FernLink>
      </li>
    );
  }
);

TableOfContentsItem.displayName = "TableOfContentsItem";
