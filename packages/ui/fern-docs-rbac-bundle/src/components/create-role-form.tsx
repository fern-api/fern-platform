"use client";

import { createRole } from "@/actions/create-role";
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
import { InlineCode } from "./typography/inline-code";

const FormSchema = z.object({
    role: z.string().regex(/^[a-zA-Z0-9_-]+$/),
});

export function CreateRoleForm({ org }: { org: string }): React.ReactElement {
    const [open, setOpen] = useState(false);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    });

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        try {
            await createRole({ org, role: data.role });

            toast({
                title: "Role created",
                description: `Role "${data.role}" has been created.`,
            });

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
                <Button variant="outline">Create role</Button>
            </DialogTrigger>
            <DialogPortal>
                <DialogContent className="sm:max-w-[425px]">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <DialogHeader>
                                <DialogTitle>Create role</DialogTitle>
                                <DialogDescription>
                                    Create a new role. Please mirror the roles exactly as defined in your{" "}
                                    <InlineCode>docs.yml</InlineCode> file.
                                </DialogDescription>
                            </DialogHeader>
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem key={field.name} className="grid gap-1 py-8">
                                        <FormLabel>Role</FormLabel>
                                        <FormControl>
                                            <Input type="text" {...field} autoComplete="off" placeholder="beta-users" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <SubmitButton>Create</SubmitButton>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
}
