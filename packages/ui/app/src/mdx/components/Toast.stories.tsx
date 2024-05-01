import type { Meta, StoryObj } from "@storybook/react";
import { FernButton } from "../../components/FernButton";
import { toast } from "../../components/FernToast";

const meta: Meta<typeof toast> = {
    title: "General/toast",
    component: toast,
};
export default meta;
type Story = StoryObj<typeof toast>;

export const Default: Story = {
    render: () => {
        return (
            <FernButton variant="outlined" intent="none" onClick={() => toast("This is a toast message!")}>
                Create toast
            </FernButton>
        );
    },
};

export const SuccessToast: Story = {
    render: () => {
        return (
            <FernButton variant="outlined" intent="success" onClick={() => toast.success("This is a success toast!")}>
                Create success toast
            </FernButton>
        );
    },
};

export const ErrorToast: Story = {
    render: () => {
        return (
            <FernButton variant="outlined" intent="danger" onClick={() => toast.error("This is an error toast!")}>
                Create error toast
            </FernButton>
        );
    },
};

export const PromiseToast: Story = {
    render: () => (
        <FernButton
            variant="outlined"
            intent="none"
            onClick={() =>
                toast.promise(
                    new Promise((resolve) => {
                        setTimeout(resolve, 2000);
                    }),
                    {
                        loading: "Loading...",
                        success: "Loaded!",
                        error: "Error!",
                    },
                )
            }
        >
            Create promise toast
        </FernButton>
    ),
};

export const WithDescription: Story = {
    render: () => (
        <FernButton
            variant="outlined"
            intent="none"
            onClick={() => toast("This is a toast message!", { description: "And a little description to accompany" })}
        >
            Create promise toast
        </FernButton>
    ),
};
