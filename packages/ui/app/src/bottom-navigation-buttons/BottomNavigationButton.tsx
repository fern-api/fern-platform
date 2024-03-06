import { ChevronRightIcon } from "@radix-ui/react-icons";
import { FernLinkCard } from "../components/FernCard";
import { ResolvedPath } from "../util/ResolvedPath";

export declare namespace BottomNavigationButton {
    export interface Props {
        neighbor: ResolvedPath.Neighbor;
    }
}

export const BottomNavigationButton: React.FC<BottomNavigationButton.Props> = ({ neighbor }) => {
    return (
        <FernLinkCard className="my-12 flex items-center rounded-xl p-6" href={`/${neighbor.fullSlug}`}>
            <div className="flex-1">
                <div className="text-base font-semibold">{neighbor.title}</div>

                {neighbor.excerpt && <div className="t-muted mt-1 text-sm">{neighbor.excerpt}</div>}
            </div>
            <span className="sm:border-default t-muted sm-4 inline-flex items-center gap-2 py-2.5 text-sm sm:ml-6 sm:border-l sm:pl-6">
                <span className="hidden leading-none sm:inline">Up Next</span>
                <ChevronRightIcon />
            </span>
        </FernLinkCard>
    );
};
