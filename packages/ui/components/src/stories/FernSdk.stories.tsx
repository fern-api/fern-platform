import type { Meta, StoryObj } from "@storybook/react";
import { FernSdk } from "../FernSdk";

const meta: Meta<typeof FernSdk> = {
  title: "General/FernSdk",
  component: FernSdk,
  args: {
    sdks: {
      "node": {
        packageName: "@fern/sdk-node",
      },
    }
  }
};

export const Default: StoryObj<typeof FernSdk> = {

};

export default meta;