import { zodResolver } from "@hookform/resolvers/zod";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { updateRoles } from "@/actions/update-roles";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";

const FormSchema = z.object({
    roles: z.array(z.string()),
});

export function UpdateUserRolesForm({
    userDisplayName,
    email,
    org,
    selectedRoles,
    roles,
    onClose,
}: {
    userDisplayName: string;
    email: string;
    org: string;
    selectedRoles: string[];
    roles: string[];
    onClose: () => void;
}): React.ReactElement {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            roles: selectedRoles,
        },
    });

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        try {
            await updateRoles({ email, org, roles: data.roles });
            toast({
                title: `Roles updated for ${userDisplayName}`,
                description: `${data.roles.join(", ")}`,
            });
            onClose();
        } catch (error) {
            if (error instanceof Error && error.message === "Unauthorized") {
                toast({
                    title: "Unauthorized",
                    description: "You are not authorized to update roles for this user.",
                });
            } else {
                toast({
                    title: "Error",
                    description: "An error occurred while updating roles.",
                });
            }
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="roles"
                    render={() => (
                        <FormItem>
                            <VisuallyHidden.Root>
                                <FormLabel className="text-base">Roles</FormLabel>
                                <FormDescription>Select the roles you want to assign to this user.</FormDescription>
                            </VisuallyHidden.Root>
                            {roles.map((role) => (
                                <FormField
                                    key={role}
                                    control={form.control}
                                    name="roles"
                                    render={({ field }) => (
                                        <FormItem key={role} className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(role)}
                                                    onCheckedChange={(checked) => {
                                                        return checked
                                                            ? field.onChange([...field.value, role])
                                                            : field.onChange(
                                                                  field.value?.filter((value) => value !== role),
                                                              );
                                                    }}
                                                />
                                            </FormControl>
                                            <FormLabel className="text-sm font-normal">{role}</FormLabel>
                                        </FormItem>
                                    )}
                                />
                            ))}
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button
                    type="submit"
                    className="w-full"
                    disabled={form.formState.isSubmitting || form.formState.isLoading}
                >
                    Save
                </Button>
            </form>
        </Form>
    );
}
