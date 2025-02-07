import { FernLink } from "@/components/link";
import clsx from "clsx";
import { memo, ReactElement, useEffect, useRef } from "react";

export interface TableOfContentsItemProps {
  text: string;
  anchorString: string;
  active: boolean;
  setActiveRef: (ref: HTMLLIElement) => void;
  depth?: number;
}

export const TableOfContentsItem = memo<TableOfContentsItemProps>(
  (props): ReactElement => {
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
          className={clsx(
            "block hyphens-auto break-words text-sm transition-colors hover:transition-none",
            {
              "text-grayscale-a11 hover:text-grayscale-a12": !active,
              "text-accent-aaa": active,
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
