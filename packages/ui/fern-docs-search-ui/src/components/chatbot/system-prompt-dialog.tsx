import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ReactElement } from "react";
import { Button } from "../ui/button";
import { TextArea } from "../ui/textarea";

export const SystemPromptDialog = ({
    open,
    onOpenChange,
    children,
    value,
    onValueChange,
}: {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
    value?: string;
    onValueChange?: (value: string) => void;
}): ReactElement => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {children}
            <DialogContent className=" max-w-screen-lg">
                <DialogHeader>
                    <DialogTitle>Update System Prompt</DialogTitle>
                    <DialogDescription>Update the system prompt to change how the AI behaves.</DialogDescription>
                </DialogHeader>
                <TextArea
                    value={value}
                    onValueChange={onValueChange}
                    minLines={10}
                    className="focus:outline-none p-4 bg-[var(--grayscale-a2)] rounded-md font-mono max-h-[500px]"
                />
                <DialogFooter>
                    <DialogClose asChild>
                        <Button>Save</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
