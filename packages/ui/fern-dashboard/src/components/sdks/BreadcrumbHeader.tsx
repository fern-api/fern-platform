import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { FernButton, FernButtonGroup, FernDropdown, FernLogo, RemoteFontAwesomeIcon } from "@fern-ui/components";
import { useIsHovering } from "@fern-ui/react-commons";
import { Slash } from "lucide-react";

interface BreadcrumbDropdownProps {
    name: string;
    options: BreadcrumbLinkProps[];
    action?: {
        name: string;
        onClick: () => void;
    };
}

// Note these are meant to be internal links to navigate to, at least to start
interface BreadcrumbLinkProps {
    path: string;
    name: string;
}

export interface BreadcrumbHeaderProps {
    entries: (BreadcrumbLinkProps | BreadcrumbDropdownProps)[];
}

const FernBreadcrumbSeparator = () => {
    return (
        <BreadcrumbSeparator>
            <Slash />
        </BreadcrumbSeparator>
    );
};

export const BreadcrumbHeader: React.FC<BreadcrumbHeaderProps> = ({ entries }) => {
    const { isHovering } = useIsHovering();

    return (
        <nav className="flex flex-row contents-center items-center gap-x-4 fixed inset-x-0 top-0 z-50 bg-white shadow-sm translate-y-0 md:translate-y-0/2 dark:bg-gray-950 p-6 h-16 justify-between">
            <FernLogo muted={!isHovering} className="-mt-0.5 h-6 transition" />
            <Breadcrumb className="absolute w-full align-center">
                <BreadcrumbList className="justify-center">
                    {/* TODO: implement breadcrumbs such that it's home/<API name dropdown with + button>, should really take in some API that allows this config easily */}
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <FernBreadcrumbSeparator />
                    {entries.map((entry, index) => {
                        let item: React.ReactNode;
                        if ("options" in entry) {
                            const dropdownOptions = entry.options.map(
                                (option): FernDropdown.Option => ({
                                    type: "value",
                                    label: option.name,
                                    value: option.path,
                                }),
                            );
                            item = (
                                <BreadcrumbItem key={index}>
                                    <FernDropdown options={dropdownOptions}>
                                        <FernButton
                                            disabled
                                            text={entry.name}
                                            rightIcon={
                                                <RemoteFontAwesomeIcon
                                                    icon="angles-up-down"
                                                    className="ml-1.5"
                                                    size={3}
                                                />
                                            }
                                            className="w-full text-left p-0 gap-x-4 text-bold !bg-white"
                                            variant="outlined"
                                        />
                                    </FernDropdown>
                                </BreadcrumbItem>
                            );
                        } else {
                            item = (
                                <BreadcrumbItem key={index}>
                                    <BreadcrumbLink href={entry.path}>{entry.name}</BreadcrumbLink>
                                </BreadcrumbItem>
                            );
                        }

                        return (
                            <>
                                {item}
                                {index < entries.length - 1 && <FernBreadcrumbSeparator />}
                            </>
                        );
                    })}
                </BreadcrumbList>
            </Breadcrumb>
            <FernButtonGroup>
                <FernButton
                    variant="outlined"
                    icon={<RemoteFontAwesomeIcon size={5} icon="fa-brands fa-github" />}
                    onClick={() => {
                        return () => {
                            window.open("#TODO: Link Fern config repo", "_blank", "noopener");
                        };
                    }}
                    disabled
                />
                {/* TODO: Make this a dropdown to get support or feedback */}
                <FernButton
                    variant="outlined"
                    icon={<RemoteFontAwesomeIcon size={4} icon="cog" />}
                    onClick={() => {
                        return () => {
                            window.open("#", "_blank", "noopener");
                        };
                    }}
                    disabled
                />
                <FernButton
                    variant="outlined"
                    icon={<RemoteFontAwesomeIcon size={4} icon="scroll" />}
                    onClick={() => {
                        return () => {
                            window.open("https://buildwithfern.com/learn/home", "_blank", "noopener");
                        };
                    }}
                    disabled
                >
                    Documentation
                </FernButton>
                {/* TODO: Add in the avatar for log out and eventually managing profile */}
            </FernButtonGroup>
        </nav>
    );
};
