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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { getOrganization } from "@/services/venus";
import { LightweightUser, Organization } from "@fern-api/venus-api-sdk/api";
import { FernButton, FernButtonGroup, FernTooltip } from "@fern-ui/components";
import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { useEffect, useState } from "react";

// Just for reference, these underscore path parts do not actually appear in the browser
// this is used to nest these authenticated routes under the /_authenticated route to
// share the "beforeLoad" logic that exists to check if the user is authenticated.
// If they're not they're redirected to the login page.
export const Route = createFileRoute("/_authenticated/team/$orgId")({
    component: () => <TeamPage />,
    beforeLoad: ({ context }) => {
        return context;
    },
});

const UserRow: React.FC<{ user: LightweightUser }> = ({ user }) => {
    const deleteUserModal = (
        <Dialog>
            <DialogTrigger asChild>
                <FernButton icon="trash" intent="danger" variant="outlined" />
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Remove {user.displayName} from team</DialogTitle>
                    <DialogDescription>
                        Are you sure you'd like to remove {user.displayName} from the team?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <FernButton icon="trash" intent="danger">
                        <span className="text-white">Remove {user.displayName}</span>
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
                <span className="text-muted-foreground">{"user.email"}</span>
            </div>
            <FernTooltip content="Remove user from team" className="line-clamp-3">
                {deleteUserModal}
            </FernTooltip>
        </div>
    );
};

const TeamPage: React.FC = () => {
    const { orgId } = Route.useParams();
    const context = useRouteContext({ from: "/_authenticated/team/$orgId" });
    console.log("found context", context);

    const [maybeCurrentOrg, setMaybeCurrentOrg] = useState<Organization>();
    const [organizations, setOrganizations] = useState<Organization[]>();

    useEffect(() => {
        const getOrgs = async () => {
            setMaybeCurrentOrg(context?.venusClient ? await getOrganization(context?.venusClient, orgId) : undefined);
            setOrganizations(
                (
                    await Promise.all(
                        context?.venusClient
                            ? context.orgIds?.map((id) => {
                                  return getOrganization(context?.venusClient!, id);
                              }) ?? []
                            : [],
                    )
                ).filter((org) => org !== undefined) as Organization[],
            );
        };

        if (!organizations) {
            getOrgs();
        }
    }, [organizations, context]);

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
                            <FernButtonGroup>
                                <FernButton icon="user-plus" intent="success">
                                    <span className="text-white">Add team member</span>
                                </FernButton>
                            </FernButtonGroup>
                        </div>
                        <Separator decorative />
                        <ScrollArea className="flex flex-col flex-grow shrink px-6 gap-y-6" type="auto">
                            <div className="border rounded-md ">
                                {maybeCurrentOrg.users.map((user) => (
                                    <UserRow user={user} />
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </>
        )
    );
};
