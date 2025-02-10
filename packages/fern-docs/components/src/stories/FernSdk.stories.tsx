import { useArgs } from "@storybook/client-api";
import type { Meta, StoryObj } from "@storybook/react";

import { FernSdk } from "../FernSdk";

const meta: Meta<typeof FernSdk> = {
  title: "General/FernSdk",
  component: FernSdk,
};

type Story = StoryObj<typeof FernSdk>;

export const Default: Story = {
  args: {
    language: "node",
    sdks: {
      node: {
        packageName: "@mergeapi/merge-node-client",
        installCommand: (packageName: string) => `yarn add ${packageName}`,
      },
      python: {
        packageName: "MergePythonClient",
      },
      go: {
        packageName: "github.com/merge-api/merge-go-client",
      },
      java: {
        packageName: "dev.merge:merge-java-client",
      },
      ruby: {
        packageName: "merge-ruby-client",
      },
      csharp: {
        packageName: "Merge.net",
      },
      swift: {
        packageName: "MergeSwiftClient",
      },
    },
  },
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [{ language, sdks }, updateArgs] = useArgs();
    return (
      <FernSdk
        sdks={sdks}
        language={language}
        onChange={(language) => {
          updateArgs({ language });
        }}
      />
    );
  },
};

export default meta;
