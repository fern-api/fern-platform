import { DocsV1Read } from "@fern-api/fdr-sdk";
import { RemoteFontAwesomeIcon } from "../commons/FontAwesomeIcon";
import { FernLinkButton } from "../components/FernButton";

export declare namespace HeaderPrimaryLink {
    export interface Props {
        navbarLink: DocsV1Read.NavbarLink.Primary;
    }
}

export const HeaderPrimaryLink: React.FC<HeaderPrimaryLink.Props> = ({ navbarLink }) => {
    return (
        <FernLinkButton
            className={"group"}
            href={navbarLink.url}
            target="_blank"
            intent="primary"
            rightIcon={
                <RemoteFontAwesomeIcon
                    icon="regular arrow-right"
                    className="transition-transform group-hover:translate-x-0.5"
                />
            }
            buttonStyle="filled"
        >
            {navbarLink.text}
        </FernLinkButton>
    );
};
