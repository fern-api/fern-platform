import { ComponentType, PropsWithChildren } from "react";

export type LinkComponentType = ComponentType<PropsWithChildren<{ path: string; className?: string }>>;

export const createDefaultLinkComponent = (domain: string): LinkComponentType =>
    function DefaultLinkComponent({ path, children, className }) {
        return (
            <a
                href={`https://${domain}${path}`}
                target="_blank"
                rel="noreferrer noopener"
                tabIndex={-1}
                className={className}
            >
                {children}
            </a>
        );
    };
