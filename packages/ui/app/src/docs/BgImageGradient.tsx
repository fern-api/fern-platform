import classNames from "classnames";
import dynamic from "next/dynamic";
import { createPortal } from "react-dom";

export declare namespace BgImageGradient {
    export interface Props {
        hasSpecifiedBackgroundColor: boolean;
        hasSpecifiedBackgroundImage: boolean;
    }
}

export const Core: React.FC<BgImageGradient.Props> = ({ hasSpecifiedBackgroundColor, hasSpecifiedBackgroundImage }) => {
    return (
        <>
            {createPortal(
                <div
                    className={classNames("fixed inset-0 -z-10 bg-background", {
                        "from-accent-primary/10 dark:from-accent-primary/[0.15] overscroll-y-none bg-gradient-to-b to-transparent":
                            !hasSpecifiedBackgroundColor && !hasSpecifiedBackgroundImage,
                    })}
                    style={
                        hasSpecifiedBackgroundImage
                            ? {
                                  backgroundImage: "var(--docs-background-image)",
                                  backgroundSize: "cover",
                              }
                            : {}
                    }
                />,
                document.body,
                "bg-image-gradient"
            )}
        </>
    );
};

export const BgImageGradient = dynamic(() => Promise.resolve(Core), {
    ssr: false,
});
