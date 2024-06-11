import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useAuth0 } from "@auth0/auth0-react";
import { FernButton, FernButtonGroup, FernDropdown, FernLogo, RemoteFontAwesomeIcon } from "@fern-ui/components";
import { useIsHovering } from "@fern-ui/react-commons";
import { Link } from "@tanstack/react-router";
import { LogOutIcon, Slash } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";

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
    const { logout } = useAuth0();

    return (
        <nav className="flex flex-row contents-center items-center gap-x-4 fixed inset-x-0 top-0 z-50 bg-white shadow-sm translate-y-0 md:translate-y-0/2 dark:bg-gray-950 p-6 h-16 justify-between">
            <div className="flex flex-row gap-x-3 items-center">
                <Link to="/">
                    <FernLogo muted={!isHovering} className="-mt-0.5 h-7 transition" />
                </Link>
                <Breadcrumb className="w-full">
                    <BreadcrumbList className="justify-center">
                        {entries.length > 0 && <FernBreadcrumbSeparator />}
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
                                        {entry.options.length > 0 ? (
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
                                        ) : (
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
                                        )}
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
            </div>
            <FernButtonGroup>
                {/* TODO: Make this a dropdown to get support or feedback */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <FernButton
                            variant="outlined"
                            icon={<RemoteFontAwesomeIcon size={4} icon="cog" />}
                            intent="warning"
                        />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-fit min-w-40">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem
                                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                            >
                                <LogOutIcon className="mr-2 h-4 w-4" />
                                <span>Log Out</span>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
                <FernButton
                    variant="outlined"
                    icon={<RemoteFontAwesomeIcon size={4} icon="scroll" />}
                    onClick={() => {
                        window.open("https://buildwithfern.com/learn/home", "_blank");
                    }}
                    intent="warning"
                >
                    Documentation
                </FernButton>
                {/* TODO: Add in the avatar for log out and eventually managing profile */}
            </FernButtonGroup>
        </nav>
    );
};
