import { FernCard } from "@fern-ui/components";
import clsx from "clsx";
import { NavArrowLeft, NavArrowRight } from "iconoir-react";
import { Markdown } from "../mdx/Markdown";
import { BundledMDX } from "../mdx/types";
import { FernLinkCard } from "./FernLinkCard";

export declare namespace BottomNavigationButton {
    export interface Props {
        title: string;
        hint?: string;
        href?: string;
        excerpt?: BundledMDX;
        onClick?: () => void;
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
    onClick,
    className,
}) => {
    const content = (
        <>
            {dir === "prev" && (
                <span className="sm-4 t-muted inline-flex items-center gap-2 py-2.5 text-sm sm:border-default sm:mr-6 sm:border-r sm:pr-6">
                    <NavArrowLeft className="size-icon" />
                    <span className="hidden leading-none sm:inline">{hint ?? "Go Back"}</span>
                </span>
            )}
            <div className="flex-1">
                <div className="text-base font-semibold">{title}</div>

                <Markdown
                    mdx={excerpt}
                    size="sm"
                    className="mt-1 font-normal prose-p:t-muted prose-p:m-0 prose-p:leading-snug"
                />
            </div>
            {dir === "next" && (
                <span className="sm-4 t-muted inline-flex items-center gap-2 py-2.5 text-sm sm:border-default sm:ml-6 sm:border-l sm:pl-6">
                    <span className="hidden leading-none sm:inline">{hint ?? "Up Next"}</span>
                    <NavArrowRight className="size-icon" />
                </span>
            )}
        </>
    );

    const cardClassName = clsx("my-12 flex flex-1 items-center rounded-xl p-6", className);

    if (href == null) {
        return (
            <FernCard className={cardClassName} onClick={onClick}>
                {content}
            </FernCard>
        );
    }

    return (
        <FernLinkCard className={cardClassName} href={href} onClick={onClick}>
            {content}
        </FernLinkCard>
    );
};
