import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ComponentPropsWithoutRef, forwardRef } from "react";
import { cn } from "../ui/cn";

export const ChatbotTurn = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<"div"> & { role: "user" | "assistant" }>(
    ({ children, role, ...props }, ref) => {
        return (
            <article
                ref={ref}
                {...props}
                className={cn(
                    "w-full scroll-mb-[var(--thread-trailing-height,150px)] text-token-text-primary focus-visible:outline-2 focus-visible:outline-offset-[-4px]",
                    props.className,
                )}
            >
                <VisuallyHidden asChild>{role === "user" ? <h5>You said:</h5> : <h5>AI said:</h5>}</VisuallyHidden>
                <div className="m-auto text-base py-[18px] px-3 w-full md:px-5 lg:px-4 xl:px-5">
                    <div className="mx-auto flex flex-1 gap-4 text-base md:gap-5 lg:gap-6 md:max-w-3xl">
                        <div className="group/conversation-turn relative flex w-full min-w-0 flex-col">
                            <div className="flex-col gap-1 md:gap-3">
                                <div className="flex max-w-full flex-col grow">
                                    <div className="min-h-8 text-message flex w-full flex-col items-end gap-2 whitespace-normal break-words [.text-message+&]:mt-5">
                                        <div
                                            className={cn("flex w-full flex-col gap-1 empty:hidden", {
                                                "items-end rtl:items-start": role === "user",
                                                "first:pt-[3px]": role === "assistant",
                                            })}
                                        >
                                            <div
                                                className={
                                                    role === "user"
                                                        ? "relative max-w-[70%] rounded-3xl bg-[var(--grayscale-a3)] px-5 py-2.5 whitespace-pre-wrap"
                                                        : "markdown prose w-full break-words dark:prose-invert"
                                                }
                                            >
                                                {children}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        );
    },
);

ChatbotTurn.displayName = "ChatbotTurn";
