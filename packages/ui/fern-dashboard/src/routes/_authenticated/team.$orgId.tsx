import { BreadcrumbHeader } from "@/components/sdks/BreadcrumbHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { getVenusClient, useOrganization, useOrganizations } from "@/services/venus";
import { LightweightUser, Organization, OrganizationId } from "@fern-api/venus-api-sdk/api";
import { FernButton, FernTooltip, RemoteFontAwesomeIcon, toast } from "@fern-ui/components";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useAuth0 } from "@auth0/auth0-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToggle } from "react-use";
import { z } from "zod";

// Just for reference, these underscore path parts do not actually appear in the browser
// this is used to nest these authenticated routes under the /_authenticated route to
// share the "beforeLoad" logic that exists to check if the user is authenticated.
// If they're not they're redirected to the login page.
export const Route = createFileRoute("/_authenticated/team/$orgId")({
    component: () => <TeamPage />,
});

const UserRow: React.FC<{
    user: LightweightUser;
    auth0OrgId: OrganizationId;
    toggleShouldRefetchOrg: (nextValue?: any) => void;
    token?: string;
}> = ({ user, token, auth0OrgId, toggleShouldRefetchOrg }) => {
    const [isDialogOpen, toggleDialogOpen] = useToggle(false);
    const [isDeleteUserLoading, toggleDeleteUserLoading] = useToggle(false);

    async function onDelete() {
        toggleDeleteUserLoading(true);
        try {
            if (token) {
                await getVenusClient({ token }).organization.removeUser({ userId: user.userId, auth0OrgId });
            }
        } catch (e) {
            toast.error("Failed to remove user. Please try again later.");
            toggleDeleteUserLoading(false);
            toggleDialogOpen(false);
            return;
        }
        toast.success(`Successfully removed ${user.displayName} from your team!`);
        toggleDeleteUserLoading(false);
        toggleDialogOpen(false);

        toggleShouldRefetchOrg();
    }

    const deleteUserModal = (
        <Dialog open={isDialogOpen} onOpenChange={toggleDialogOpen}>
            <DialogTrigger asChild>
                <FernButton icon="trash" intent="danger" variant="outlined" disabled={token == null} />
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Remove {user.displayName} from team</DialogTitle>
                    <DialogDescription>
                        Are you sure you'd like to remove {user.displayName} from the team?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <FernButton icon={!isDeleteUserLoading && "trash"} intent="danger" onClick={onDelete}>
                        {isDeleteUserLoading ? (
                            <RemoteFontAwesomeIcon
                                icon="fa-solid fa-spinner-third"
                                className="animate-spin text-white"
                            />
                        ) : (
                            <span className="text-white">Remove {user.displayName}</span>
                        )}
                    </FernButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );

    return (
        <div className="flex flex-row justify-between p-6 border-b last:border-b-0">
            <div className="flex flex-row gap-x-3 items-center">
                <Avatar className="h-9 w-9">
                    <AvatarImage src={user.pictureUrl} />
                    <AvatarFallback>{user.displayName.at(0)?.toUpperCase()}</AvatarFallback>
                </Avatar>

                <span>{user.displayName}</span>
                {user.emailAddress && <span className="text-muted-foreground">{user.emailAddress}</span>}
            </div>
            <FernTooltip content="Remove user from team" className="line-clamp-3">
                {deleteUserModal}
            </FernTooltip>
        </div>
    );
};

const EmailFormSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

const TeamPage: React.FC = () => {
    const { orgId } = Route.useParams();
    const auth = useAuth0();
    const [token, setToken] = useState<string>();
    useEffect(() => {
        const getToken = async () => {
            setToken(await auth.getAccessTokenSilently());
        };
        if (!token) {
            getToken();
        }
    }, [auth.isAuthenticated, auth.isLoading]);

    const [maybeCurrentOrg, setMaybeCurrentOrg] = useState<Organization>();
    const [organizations, setOrganizations] = useState<Organization[]>();

    const form = useForm<z.infer<typeof EmailFormSchema>>({
        resolver: zodResolver(EmailFormSchema),
        defaultValues: {
            email: "",
        },
    });

    const [isEmailPopoverOpen, toggleEmailPopover] = useToggle(false);
    const [isInviteUserLoading, toggleInviteUserLoading] = useToggle(false);
    async function onSubmitEmail(data: z.infer<typeof EmailFormSchema>) {
        toggleInviteUserLoading(true);
        try {
            if (token && maybeCurrentOrg) {
                await getVenusClient({ token }).organization.inviteUser({
                    emailAddress: data.email,
                    auth0OrgId: OrganizationId(maybeCurrentOrg.auth0Id),
                });
            }
        } catch (e) {
            toast.error("Failed to send an invite. Please try again later.");
            toggleInviteUserLoading(false);
            toggleEmailPopover(false);
            return;
        }
        toast.success("Successfully invited team member!");
        toggleInviteUserLoading(false);
        toggleEmailPopover(false);
    }

    const [shouldRefetchOrg, toggleShouldRefetchOrg] = useToggle(false);
    const { isLoading: isOrgLoading, data: currentOrgQuery } = useOrganization(token, orgId);
    const { isLoading: areOrgsLoading, data: organizationsQuery } = useOrganizations(token);
    useEffect(() => {
        if (!isOrgLoading) {
            setMaybeCurrentOrg(currentOrgQuery);
        }
        if (!areOrgsLoading) {
            setOrganizations(organizationsQuery.filter((org): org is Organization => org != null));
        }
    }, [isOrgLoading, areOrgsLoading]);

    const navigate = useNavigate();

    return (
        maybeCurrentOrg && (
            <>
                <BreadcrumbHeader
                    entries={
                        organizations && organizations.length > 1
                            ? [
                                  {
                                      name: maybeCurrentOrg.displayName,
                                      options: organizations
                                          .filter((org) => org.organizationId !== maybeCurrentOrg.organizationId)
                                          .map((org) => ({
                                              name: org.displayName,
                                              path: `/team/${org.organizationId}`,
                                          })),
                                      action: (path) => navigate({ to: path }),
                                  },
                              ]
                            : []
                    }
                />
                <div className="h-[calc(100vh-4rem)] relative top-16">
                    <div className="flex flex-col gap-y-6 overflow-hidden h-[calc(100vh-4rem)] p-10">
                        <div className="flex flex-row justify-between items-center">
                            <div className="flex flex-row gap-x-2 items-center">
                                <h2>Your Team</h2>
                                <span className="text-muted-foreground">@ {maybeCurrentOrg.displayName}</span>
                            </div>
                            <Popover open={isEmailPopoverOpen} onOpenChange={toggleEmailPopover}>
                                <PopoverTrigger asChild>
                                    <FernButton icon="user-plus" intent="success" onClick={toggleEmailPopover}>
                                        <span className="text-white">Add team member</span>
                                    </FernButton>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 mr-10">
                                    <div className="flex flex-col gap-4">
                                        <div className="space-y-2">
                                            <h4 className="font-medium leading-none">Send Invite</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Enter the email of the team member you'd like to invite
                                            </p>
                                        </div>
                                        <Form {...form}>
                                            <form onSubmit={form.handleSubmit(onSubmitEmail)} className="space-y-2">
                                                <FormField
                                                    control={form.control}
                                                    name="email"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input
                                                                    id="email"
                                                                    type="email"
                                                                    placeholder="jane@doe.com"
                                                                    className="h-8"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FernButton intent="success" full type="submit">
                                                    {isInviteUserLoading ? (
                                                        <RemoteFontAwesomeIcon
                                                            icon="fa-solid fa-spinner-third"
                                                            className="animate-spin text-white"
                                                        />
                                                    ) : (
                                                        <span className="text-white">Submit</span>
                                                    )}
                                                </FernButton>
                                            </form>
                                        </Form>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <Separator decorative />
                        <ScrollArea className="flex flex-col flex-grow shrink px-6 gap-y-6" type="auto">
                            <div className="border rounded-md max-w-[80rem] self-center align-center mx-auto">
                                {maybeCurrentOrg.users.map((user, index) => (
                                    <UserRow
                                        key={index}
                                        user={user}
                                        token={token}
                                        auth0OrgId={OrganizationId(maybeCurrentOrg.auth0Id)}
                                        toggleShouldRefetchOrg={toggleShouldRefetchOrg}
                                    />
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </>
        )
    );
};
