import { useRouter } from "next/router";
import { useCallback, useEffect, useRef } from "react";
import { useNavigationContext } from "../navigation-context";
import { CollapsableSidebarItem } from "./CollapsableSidebarItem";

export declare namespace SidebarSubpackageItem {
    export interface Props {
        title: JSX.Element | string;
        collapsed: boolean;
        className?: string;
        fullSlug: string;
        registerScrolledToPathListener: (slug: string, listener: () => void) => () => void;
    }
}

export const SidebarSubpackageItem: React.FC<SidebarSubpackageItem.Props> = ({
    title,
    collapsed,
    className,
    fullSlug,
    registerScrolledToPathListener,
}) => {
    const router = useRouter();
    const { navigateToPath } = useNavigationContext();

    const handleClick = useCallback(async () => {
        navigateToPath(fullSlug);
        void router.replace(`/${fullSlug}`, undefined, { shallow: true });
    }, [fullSlug, navigateToPath, router]);

    const ref = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        return registerScrolledToPathListener(fullSlug, () => {
            ref.current?.scrollIntoView({ block: "nearest" });
        });
    }, [fullSlug, registerScrolledToPathListener]);

    return <CollapsableSidebarItem title={title} collapsed={collapsed} className={className} onClick={handleClick} />;
};
