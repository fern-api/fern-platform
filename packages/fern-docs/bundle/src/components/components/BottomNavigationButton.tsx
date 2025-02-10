import clsx from "clsx";
import { NavArrowLeft, NavArrowRight } from "iconoir-react";

import { Markdown } from "../mdx/Markdown";
import { FernLinkCard } from "./FernLinkCard";

export declare namespace BottomNavigationButton {
  export interface Props {
    title: string;
    hint?: string;
    href: string;
    excerpt?: string;
    dir: "prev" | "next";
    className?: string;
  }
}

export const BottomNavigationButton: React.FC<BottomNavigationButton.Props> = ({
  dir,
  title,
  hint,
  excerpt,
  href,
  className,
}) => {
  return (
    <FernLinkCard
      className={clsx(
        "my-12 flex flex-1 items-center rounded-xl p-6",
        className
      )}
      href={href}
    >
      {dir === "prev" && (
        <span className="sm-4 t-muted sm:border-default inline-flex items-center gap-2 py-2.5 text-sm sm:mr-6 sm:border-r sm:pr-6">
          <NavArrowLeft className="size-icon" />
          <span className="hidden leading-none sm:inline">
            {hint ?? "Go Back"}
          </span>
        </span>
      )}
      <div className="flex-1">
        <div className="text-base font-semibold">{title}</div>

        <Markdown
          mdx={excerpt}
          size="sm"
          className="prose-p:t-muted prose-p:m-0 prose-p:leading-snug mt-1 font-normal"
        />
      </div>
      {dir === "next" && (
        <span className="sm-4 t-muted sm:border-default inline-flex items-center gap-2 py-2.5 text-sm sm:ml-6 sm:border-l sm:pl-6">
          <span className="hidden leading-none sm:inline">
            {hint ?? "Up Next"}
          </span>
          <NavArrowRight className="size-icon" />
        </span>
      )}
    </FernLinkCard>
  );
};
