// import { DefinitionObjectFactory } from "@fern-ui/app-utils/src/fern/definition-object-factory";
import { Callout } from "@fern-ui/ui/src/mdx/components/Callout";
// import { DocsContextProvider } from "@fern-ui/ui/src/docs-context/DocsContextProvider";
import type { Meta, StoryFn, StoryObj } from "@storybook/react";
import { RootStylesProvider } from "./RootProvider";

const meta = {
    title: "Example/Callout",
    component: Callout as StoryFn,
    parameters: {
        layout: "centered",
    },
    argTypes: {},
    decorators: [
        (Story) => (
            <RootStylesProvider>
                {/* <DocsContextProvider
                    docsDefinition={{
                        apis: {},
                        config: DefinitionObjectFactory.createDocsDefinition().config,
                        files: {},
                        pages: {},
                        search: { type: "legacyMultiAlgoliaIndex", algoliaIndex: "" },
                    }}
                > */}
                <div style={{ width: 800, padding: 100 }}>
                    {/* Decorators in Storybook also accept a function. Replace <Story/> with Story() to enable it  */}
                    <Story />
                </div>
                {/* </DocsContextProvider> */}
            </RootStylesProvider>
        ),
    ],
} satisfies Meta<typeof Callout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Info: Story = {
    args: {
        intent: "info",
        children:
            "We typically recommend using the frontend SDKs/components, as they speed up development and provide a better user experience.",
    } satisfies Callout.Props,
};

export const Warning: Story = {
    args: {
        intent: "warning",
        children:
            "Instant Account Verification via Plaid is coming soon. If you already use Plaid to verify bank accounts, the existing Plaid token can be used. Please contact us for more information.",
    } satisfies Callout.Props,
};

export const Success: Story = {
    args: {
        intent: "success",
        children:
            "An invoice needs a payer entity and a vendor entity. Your customer is the payer, and payers need to be verified and have a verified bank account. The vendor entity needs to be created, but only needs basic information like the legal name, email, and type of business. Vendor entities also do not need verified bank accounts.",
    } satisfies Callout.Props,
};
