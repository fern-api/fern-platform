import type { Meta, StoryObj } from "@storybook/react";
import { toast } from "../FernToast";

const meta: Meta<typeof toast> = {
    title: "General/toast",
    component: toast,
};
export default meta;
type Story = StoryObj<typeof toast>;

export const Default: Story = {
    render: () => {
        return <div onClick={() => toast("This is a toast message!")}>Create toast</div>;
    },
};

export const SuccessToast: Story = {
    render: () => {
        return <div onClick={() => toast.success("This is a success toast!")}>Create success toast</div>;
    },
};

export const ErrorToast: Story = {
    render: () => {
        return <div onClick={() => toast.error("This is an error toast!")}>Create error toast</div>;
    },
};

export const PromiseToast: Story = {
    render: () => (
        <div
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
        </div>
    ),
};

export const WithDescription: Story = {
    render: () => (
        <div
            onClick={() => toast("This is a toast message!", { description: "And a little description to accompany" })}
        >
            Create promise toast
        </div>
    ),
};
