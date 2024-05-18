import { FernLinkCard } from "@fern-ui/components";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { MdxContent } from "../mdx/MdxContent";
import { ResolvedPath } from "../resolver/ResolvedPath";

export declare namespace BottomNavigationButton {
    export interface Props {
        neighbor: ResolvedPath.Neighbor;
        dir: "prev" | "next";
    }
}

export const BottomNavigationButton: React.FC<BottomNavigationButton.Props> = ({ neighbor, dir }) => {
    return (
        <FernLinkCard className="my-12 flex flex-1 items-center rounded-xl p-6" href={`/${neighbor.fullSlug}`}>
            {dir === "prev" && (
                <span className="sm-4 t-muted inline-flex items-center gap-2 py-2.5 text-sm sm:border-default sm:mr-6 sm:border-r sm:pr-6">
                    <ChevronLeftIcon />
                    <span className="hidden leading-none sm:inline">Go Back</span>
                </span>
            )}
            <div className="flex-1">
                <div className="text-base font-semibold">{neighbor.title}</div>

                {neighbor.excerpt && (
                    <div className="prose prose-sm mt-1 font-normal prose-p:t-muted dark:prose-invert prose-p:m-0 prose-p:leading-snug">
                        <MdxContent mdx={neighbor.excerpt} />
                    </div>
                )}
            </div>
            {dir === "next" && (
                <span className="sm-4 t-muted inline-flex items-center gap-2 py-2.5 text-sm sm:border-default sm:ml-6 sm:border-l sm:pl-6">
                    <span className="hidden leading-none sm:inline">Up Next</span>
                    <ChevronRightIcon />
                </span>
            )}
        </FernLinkCard>
    );
};
