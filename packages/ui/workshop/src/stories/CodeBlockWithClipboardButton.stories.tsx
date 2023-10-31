import { DefinitionObjectFactory } from "@fern-ui/app-utils/src/fern/definition-object-factory";
import { CodeBlockWithClipboardButton } from "@fern-ui/ui/src/commons/CodeBlockWithClipboardButton";
import { DocsContextProvider } from "@fern-ui/ui/src/docs-context/DocsContextProvider";
import type { Meta, StoryObj } from "@storybook/react";
import { RootStylesProvider } from "./RootStylesProvider";
import { JS_CODE_SNIPPET_1, PYTHON_CODE_SNIPPET_1 } from "./snippets";

const meta = {
    title: "Example/CodeBlockWithClipboardButton",
    component: CodeBlockWithClipboardButton,
    parameters: {
        layout: "centered",
    },
    argTypes: {},
    decorators: [
        (Story) => (
            <RootStylesProvider>
                <DocsContextProvider
                    docsDefinition={{
                        apis: {},
                        config: DefinitionObjectFactory.createDocsDefinition().config,
                        files: {},
                        pages: {},
                        search: { type: "legacyMultiAlgoliaIndex", algoliaIndex: "" },
                    }}
                >
                    <div style={{ width: 800, padding: 100 }}>
                        {/* Decorators in Storybook also accept a function. Replace <Story/> with Story() to enable it  */}
                        <Story />
                    </div>
                </DocsContextProvider>
            </RootStylesProvider>
        ),
    ],
} as Meta<typeof CodeBlockWithClipboardButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PythonWithHorizontalOverflow: Story = {
    args: {
        variant: "lg",
        language: "python",
        content: PYTHON_CODE_SNIPPET_1,
    },
};

export const JavaScriptWithVerticalOverflow: Story = {
    args: {
        variant: "lg",
        language: "js",
        content: JS_CODE_SNIPPET_1,
    },
};
