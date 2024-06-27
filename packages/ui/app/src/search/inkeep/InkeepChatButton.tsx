import dynamic from "next/dynamic";
import { ReactElement } from "react";
import useInkeepSettings from "./useInkeepSettings";

const ChatButton = dynamic(() => import("@inkeep/widgets").then((mod) => mod.InkeepChatButton), {
    ssr: false,
});

export function InkeepChatButton(): ReactElement | null {
    const settings = useInkeepSettings();

    if (settings == null) {
        return null;
    }

    return (
        <ChatButton
            {...settings}
            stylesheets={[
                <style key="0">{`
                    .ikp-floating-button {
                        background-color: rgb(var(--accent-aaa));
                        color: rgb(var(--background));
                    }
                `}</style>,
            ]}
        />
    );
}
