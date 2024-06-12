import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import { useAuth0 } from "@auth0/auth0-react";
import { FernButton, FernButtonGroup, RemoteFontAwesomeIcon } from "@fern-ui/components";
import { Link } from "@tanstack/react-router";
import { LogOutIcon, Slash } from "lucide-react";
import { FernLogo } from "../FernLogo";
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
    action?: (val: string) => void;
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
    const { logout } = useAuth0();

    return (
        <nav className="flex flex-row contents-center items-center gap-x-4 fixed inset-x-0 top-0 z-50 bg-white shadow-sm translate-y-0 md:translate-y-0/2 dark:bg-gray-950 p-6 h-16 justify-between">
            <div className="flex flex-row gap-x-3 items-center">
                <Link to="/">
                    <FernLogo className={cn("-mt-0.5 h-7 mr-2 transition fill-black")} />
                </Link>
                <Breadcrumb className="w-full">
                    <BreadcrumbList className="justify-center">
                        {entries.length > 0 && <FernBreadcrumbSeparator />}
                        {entries.map((entry, index) => {
                            let item: React.ReactNode;
                            if ("options" in entry) {
                                item = (
                                    <BreadcrumbItem key={index}>
                                        {entry.options.length > 0 ? (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <FernButton
                                                        intent="primary"
                                                        text={entry.name}
                                                        rightIcon={
                                                            <RemoteFontAwesomeIcon
                                                                icon="angles-up-down"
                                                                className="ml-1.5 !bg-black"
                                                                size={3}
                                                            />
                                                        }
                                                        className="w-full text-left gap-x-4 !p-0 !pl-1 !bg-white !focus:ring-0 !focus:ring-offset-0"
                                                        variant="outlined"
                                                        size="large"
                                                    />
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-fit min-w-40">
                                                    <DropdownMenuLabel>Your Organizations</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuGroup>
                                                        {entry.options.map((option, index) => (
                                                            <DropdownMenuItem
                                                                key={index}
                                                                onClick={() => {
                                                                    if (entry.action) {
                                                                        entry.action(option.path);
                                                                    }
                                                                }}
                                                            >
                                                                <span>{option.name}</span>
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuGroup>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        ) : (
                                            <FernButton
                                                intent="primary"
                                                text={entry.name}
                                                rightIcon={
                                                    <RemoteFontAwesomeIcon
                                                        icon="angles-up-down"
                                                        className="ml-1.5 !bg-black"
                                                        size={3}
                                                    />
                                                }
                                                className="w-full text-left gap-x-4 !p-0 !pl-1 !bg-white"
                                                variant="outlined"
                                                size="large"
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
                    <span className="text-intent-warning">Documentation</span>
                </FernButton>
            </FernButtonGroup>
        </nav>
    );
};
