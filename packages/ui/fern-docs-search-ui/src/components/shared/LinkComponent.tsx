import { ComponentType, PropsWithChildren } from "react";

export type LinkComponentType = ComponentType<
    PropsWithChildren<{ hit: { pathname: string; hash: string }; className?: string }>
>;

export const createDefaultLinkComponent = (domain: string): LinkComponentType =>
    function DefaultLinkComponent({ hit, children, className }) {
        return (
            <a
                href={`https://${domain}${hit.pathname ?? ""}${hit.hash ?? ""}`}
                target="_blank"
                rel="noreferrer noopener"
                tabIndex={-1}
                className={className}
            >
                {children}
            </a>
        );
    };
