"use client";

import React from "react";
import { useFormStatus } from "react-dom";
import { Button } from "./button";

const SubmitButton = React.forwardRef<HTMLButtonElement, Omit<React.ComponentProps<typeof Button>, "type">>(
    ({ ...props }, ref) => {
        const { pending } = useFormStatus();
        return <Button ref={ref} type="submit" disabled={pending} {...props} />;
    },
);
SubmitButton.displayName = "SubmitButton";

export { SubmitButton };
