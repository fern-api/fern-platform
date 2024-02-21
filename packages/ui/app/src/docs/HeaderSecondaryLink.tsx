import { DocsV1Read } from "@fern-api/fdr-sdk";
import { FernLinkButton } from "../components/FernButton";

export declare namespace HeaderSecondaryLink {
    export interface Props {
        navbarLink: DocsV1Read.NavbarLink.Secondary;
    }
}

export const HeaderSecondaryLink: React.FC<HeaderSecondaryLink.Props> = ({ navbarLink }) => {
    return (
        <FernLinkButton href={navbarLink.url} target="_blank" variant="minimal" className="cursor-pointer">
            {navbarLink.text}
        </FernLinkButton>
    );
};
