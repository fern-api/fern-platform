import { ComponentPropsWithoutRef, forwardRef } from "react";
import { Anthropic } from "../icons/anthropic";
import { Cohere } from "../icons/cohere";
import { OpenAI } from "../icons/openai";
import { cn } from "../ui/cn";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export const ChatbotModelSelect = forwardRef<
    HTMLButtonElement,
    ComponentPropsWithoutRef<"button"> & {
        value?: string;
        defaultValue?: string;
        onValueChange?: (value: string) => void;
        open?: boolean;
        defaultOpen?: boolean;
        onOpenChange?: (open: boolean) => void;
        disabled?: boolean;
        required?: boolean;
    }
>(({ value, defaultValue, onValueChange, open, defaultOpen, onOpenChange, disabled, required, ...props }, ref) => {
    return (
        <Select
            name="model"
            defaultValue={defaultValue ?? "claude-3-5-haiku"}
            value={value}
            onValueChange={onValueChange}
            open={open}
            defaultOpen={defaultOpen}
            onOpenChange={onOpenChange}
            disabled={disabled}
            required={required}
        >
            <SelectTrigger ref={ref} {...props} className={cn("rounded-full shadow-none", props.className)}>
                <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectItem value="claude-3-5-haiku">
                        <Anthropic /> Claude 3.5 Haiku
                    </SelectItem>
                    <SelectItem value="claude-3-5-sonnet">
                        <Anthropic /> Claude 3.5 Sonnet
                    </SelectItem>
                    <SelectItem value="gpt-4o-mini">
                        <OpenAI /> GPT-4o Mini
                    </SelectItem>
                    <SelectItem value="gpt-4o">
                        <OpenAI /> GPT-4o
                    </SelectItem>
                    <SelectItem value="command-r-plus">
                        <Cohere /> Cohere Command R+
                    </SelectItem>
                    <SelectItem value="command-r">
                        <Cohere /> Cohere Command R
                    </SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    );
});

ChatbotModelSelect.displayName = "ChatbotModelSelect";
