import type { FernNavigation } from "@fern-api/fdr-sdk";
import { FernButton } from "@fern-ui/components";
import { useCopyToClipboard } from "@fern-ui/react-commons";
import { ShareIos } from "iconoir-react";
import { useAtom } from "jotai";
import { useSearchParams } from "next/navigation";
import { useEffect, type ReactElement } from "react";
import { usePlaygroundFormStateAtom, usePlaygroundNode } from "../atoms";
import { useToHref } from "../hooks/useHref";

interface PlaygroundShareButtonProps {
    node: FernNavigation.NavigationNodeApiLeaf;
}

export const PlaygroundShareButtonInternal = ({ node }: PlaygroundShareButtonProps): ReactElement => {
    const searchParams = useSearchParams();
    const initialState = searchParams.get("initialState");
    const initialPlaygroundHref = searchParams.get("playground");
    const toHref = useToHref();

    const [formState, setFormState] = useAtom(usePlaygroundFormStateAtom(node.id));
    const { copyToClipboard } = useCopyToClipboard(() => {
        const url = new URL(window.location.href);

        url.searchParams.set("playground", toHref(node.slug));
        url.searchParams.set("initialState", btoa(JSON.stringify(formState)));

        return url.toString();
    });

    useEffect(() => {
        if (formState == null && initialState != null && initialPlaygroundHref === toHref(node.slug)) {
            try {
                setFormState(JSON.parse(atob(initialState)));
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error("Failed to parse initial state", e);
            }
        }
    }, [formState, initialPlaygroundHref, initialState, node.slug, setFormState, toHref]);

    return <FernButton icon={<ShareIos />} onClick={copyToClipboard} rounded variant="outlined" size="large" />;
};

export const PlaygroundShareButton = (): ReactElement | null => {
    const node = usePlaygroundNode();

    if (node == null) {
        return null;
    }

    return <PlaygroundShareButtonInternal node={node} />;
};
