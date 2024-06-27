import { DocsV1Read } from "@fern-api/fdr-sdk";
import dynamic from "next/dynamic";
import { ReactElement } from "react";
import { useDocsContext } from "../../contexts/docs-context/useDocsContext";
import { DEFAULT_COLORS } from "../../next-app/utils/getColorVariables";
import useInkeepSettings from "./useInkeepSettings";

const ChatButton = dynamic(() => import("@inkeep/widgets").then((mod) => mod.InkeepChatButton), {
    ssr: false,
});

function toString(rgba: DocsV1Read.RgbaColor): string {
    if (rgba.a == null) {
        return `rgb(${rgba.r}, ${rgba.g}, ${rgba.b})`;
    } else {
        return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
    }
}

export function InkeepChatButton(): ReactElement | null {
    const settings = useInkeepSettings();
    const { colors } = useDocsContext();

    if (settings == null) {
        return null;
    }

    return (
        <ChatButton
            {...settings}
            stylesheets={[
                <style key="0">{`
                    .ikp-floating-button {
                        background-color: ${colors.dark?.background.type === "solid" ? toString(colors.dark.background) : toString(DEFAULT_COLORS.background.dark)};
                        color: white;
                    }

                    [data-theme="dark"] .ikp-floating-button {
                        background-color: ${colors.light?.background.type === "solid" ? toString(colors.light.background) : toString(DEFAULT_COLORS.background.light)};
                        color: black;
                    }
                `}</style>,
            ]}
        />
    );
}
