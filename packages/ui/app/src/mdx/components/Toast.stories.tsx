// @ts-nocheck this is only storybook
import type { Meta, StoryObj } from "@storybook/react";
import { FernButton } from "../../components/FernButton";
import { ToastT, toast } from "../../components/FernToast";

const meta: Meta<ToastT> = {
  title: "General/toast",
  component: toast,
  args: {
    message: "This is a toast message!",
  },
};
export default meta;
type Story = StoryObj<typeof toast>;

export const Default: Story = {
  render: ({ message }) => {
    return (
      <FernButton variant="outlined" intent="none" onClick={() => toast(message)}>
        Create toast
      </FernButton>
    );
  },
};

export const SuccessToast: Story = {
  args: {
    message: "This is a success toast!",
  },
  render: ({ message }) => {
    return (
      <FernButton variant="outlined" intent="success" onClick={() => toast.success(message)}>
        Create success toast
      </FernButton>
    );
  },
};

export const ErrorToast: Story = {
  args: {
    message: "This is an error toast!",
  },
  render: ({ message }) => {
    return (
      <FernButton variant="outlined" intent="danger" onClick={() => toast.error(message)}>
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
  args: {
    description: "And a little description to accompany"
  },
  render: ({ message, description }) => (
    <FernButton
      variant="outlined"
      intent="none"
      onClick={() =>
        toast(message, { description })
      }
    >
      Create promise toast
    </FernButton>
  ),
};

// export const VeryLongMessage: Story = {
//   render: () => {
//     return (
//       <>
//         <Button
//           onClick={() =>
//             toast.success(
//               "This is a success toast! It can continue to ramble on forever. Okay, maybe not forever, but longer than typical and this should still look decent.",
//             )
//           }
//         >
//           Create success toast
//         </Button>
//         <Toaster />
//       </>
//     );
//   },
// };
