import type { Meta, StoryObj } from "@storybook/react";
import { FernSdk } from "../FernSdk";

const meta: Meta<typeof FernSdk> = {
  title: "General/FernSdk",
  component: FernSdk,
  args: {
    sdks: {
      "node": {
        packageName: "@mergeapi/merge-node-client",
        installCommand: (packageName: string) => `yarn add ${packageName}`,
      },
      "python": {
        packageName: "MergePythonClient",
      },
      "go": {
        packageName: "github.com/merge-api/merge-go-client"
      },
      "java": {
        packageName: "dev.merge:merge-java-client"
      },
      ruby: {
        packageName: "merge-ruby-client"
      },
      "c#": {
        packageName: "Merge.net"
      },
      "swift": {
        packageName: "MergeSwiftClient"
      }
    }
  }
};

export const Default: StoryObj<typeof FernSdk> = {

};

export default meta;