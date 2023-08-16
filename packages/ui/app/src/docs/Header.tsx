import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import classNames from "classnames";
import { useDocsContext } from "../docs-context/useDocsContext";
import { HeaderLogoSection } from "./HeaderLogoSection";
import { HeaderPrimaryLink } from "./HeaderPrimaryLink";
import { HeaderSecondaryLink } from "./HeaderSecondaryLink";
import { ThemeButton } from "./ThemeButton";

export const Header: React.FC = () => {
    const { docsDefinition } = useDocsContext();
    const { navbarLinks } = docsDefinition.config;

    const navbarLinksSection = (
        <div className="flex items-center space-x-5 md:space-x-8">
            {navbarLinks.map((navbarLink, idx) =>
                visitDiscriminatedUnion(navbarLink, "type")._visit({
                    primary: (navbarLink) => <HeaderPrimaryLink key={idx} navbarLink={navbarLink} />,
                    secondary: (navbarLink) => <HeaderSecondaryLink key={idx} navbarLink={navbarLink} />,
                    _other: () => null,
                })
            )}
        </div>
    );

    return (
        <div
            className={classNames(
                "flex justify-between items-center shrink-0 pl-4 pr-4",
                // this matches with the calc() in the EndpointContent examples section
                "h-16"
            )}
        >
            <HeaderLogoSection />
            <div className="flex items-center space-x-4">
                {navbarLinksSection}

                <div className="dark:bg-border-default-dark bg-border-default-light w-px self-stretch" />

                <ThemeButton />
            </div>
        </div>
    );
};
