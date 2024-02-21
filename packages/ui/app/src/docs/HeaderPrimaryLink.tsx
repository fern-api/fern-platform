import { DocsV1Read } from "@fern-api/fdr-sdk";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { FernLinkButton } from "../components/FernButton";

export declare namespace HeaderPrimaryLink {
    export interface Props {
        navbarLink: DocsV1Read.NavbarLink.Primary;
    }
}

export const HeaderPrimaryLink: React.FC<HeaderPrimaryLink.Props> = ({ navbarLink }) => {
    return (
        <FernLinkButton
            className="group cursor-pointer"
            href={navbarLink.url}
            target="_blank"
            intent="primary"
            rightIcon={<ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />}
            variant="outlined"
        >
            {navbarLink.text}
        </FernLinkButton>
    );
};
