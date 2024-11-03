"use client";

import { inviteMember } from "@/actions/invite-user";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogPortal,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const FormSchema = z.object({
    email: z.string().email(),
});

export function InviteUsersForm({ org, domain }: { org: string; domain: string | undefined }): React.ReactElement {
    const [open, setOpen] = useState(false);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    });

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        try {
            const response = await inviteMember({
                org,
                email: data.email,
            });

            if (response.type === "user-added") {
                toast({
                    title: "User added",
                    description: "User has been added to the organization.",
                });
            } else if (response.type === "invite-sent") {
                toast({
                    title: "Invite sent",
                    description: "Invite has been sent to the user.",
                });
            }
            setOpen(false);
        } catch (error) {
            if (error instanceof Error && error.message === "Unauthorized") {
                toast({
                    title: "Unauthorized",
                    description: "You are not authorized to invite users to this organization.",
                });
            } else {
                toast({
                    title: "Error",
                    description: "An error occurred while inviting the user.",
                });
            }
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Add user</Button>
            </DialogTrigger>
            <DialogPortal>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Invite user</DialogTitle>
                        <DialogDescription>Invite user to your organization.</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem key={field.name} className="grid gap-1 py-8">
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                {...field}
                                                autoComplete="off"
                                                placeholder={`name@${domain ?? "buildwithfern.com"}`}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <SubmitButton>Invite</SubmitButton>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
}
