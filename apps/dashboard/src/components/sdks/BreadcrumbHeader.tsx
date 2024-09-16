import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useAuth0 } from "@auth0/auth0-react";
import { FernButton, FernButtonGroup, FernLogo, FernLogoFill, RemoteFontAwesomeIcon } from "@fern-ui/components";
import { DividerVerticalIcon } from "@radix-ui/react-icons";
import { Link } from "@tanstack/react-router";
import { LogOutIcon } from "lucide-react";
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
        <BreadcrumbSeparator className="[&>svg]:size-7">
            <DividerVerticalIcon color="gray" />
        </BreadcrumbSeparator>
    );
};

export const BreadcrumbHeader: React.FC<BreadcrumbHeaderProps> = ({ entries }) => {
    const { logout } = useAuth0();

    return (
        <nav className="contents-center bg-background md:translate-y-0/2 fixed inset-x-0 top-0 z-50 flex h-16 translate-y-0 flex-row items-center justify-between gap-x-4 p-6 shadow-sm dark:bg-gray-950">
            <div className="flex flex-row items-center gap-x-3">
                <Link to="/">
                    <FernLogo className="-mt-0.5 h-7 transition" fill={FernLogoFill.Ground} />
                </Link>
                <Breadcrumb className="w-full">
                    <BreadcrumbList className="justify-center">
                        {entries.length > 0 && <FernBreadcrumbSeparator />}
                        {entries.map((entry, index) => {
                            let item: React.ReactNode;
                            if ("options" in entry) {
                                item = (
                                    <BreadcrumbItem>
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
                                                        className="!bg-background w-full gap-x-4 !p-0 text-left font-bold"
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
                                                className="!bg-background w-full gap-x-4 !p-0 !pl-1 text-left"
                                                variant="outlined"
                                                size="large"
                                            />
                                        )}
                                    </BreadcrumbItem>
                                );
                            } else {
                                item = (
                                    <BreadcrumbItem>
                                        <BreadcrumbLink href={entry.path}>{entry.name}</BreadcrumbLink>
                                    </BreadcrumbItem>
                                );
                            }

                            return (
                                <div key={index}>
                                    {item}
                                    {index < entries.length - 1 && <FernBreadcrumbSeparator />}
                                </div>
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
