import { Meta, StoryObj } from "@storybook/react";
import { ParameterDescription } from "./parameter-description";
import {
    Tree,
    TreeDetailIndicator,
    TreeItem,
    TreeItemContent,
    TreeItemSummary,
    TreeItemSummaryTrigger,
    TreeItemsContentAdditional,
} from "./tree";

const meta: Meta<typeof Tree> = {
    title: "Tree",
    component: Tree,
};

export default meta;
type Story = StoryObj<typeof Tree>;

export const Default: Story = {
    render: () => {
        return (
            <Tree>
                <TreeItem>
                    <TreeItemSummary>
                        <TreeItemSummaryTrigger className="flex items-center text-left relative">
                            <TreeDetailIndicator className="absolute left-[-20px]" />
                            <ParameterDescription
                                className="flex-1"
                                parameterName="customer"
                                typeShorthand="object"
                                required
                            />
                        </TreeItemSummaryTrigger>
                        <div className="text-[var(--grayscale-a9)] text-sm" style={{ lineHeight: "1.7142857" }}>
                            <p>A customer can make purchases in your store and manage their profile.</p>
                        </div>
                    </TreeItemSummary>

                    <TreeItemContent>
                        <TreeItem>
                            <TreeItemSummary>
                                <TreeItemSummaryTrigger className="flex items-center text-left relative">
                                    <TreeDetailIndicator className="absolute left-[-20px]" />
                                    <ParameterDescription
                                        className="flex-1"
                                        parameterName="id"
                                        typeShorthand="string"
                                        required
                                    />
                                </TreeItemSummaryTrigger>
                                <div className="text-[var(--grayscale-a9)] text-sm" style={{ lineHeight: "1.7142857" }}>
                                    <p>The unique identifier for the customer.</p>
                                </div>
                            </TreeItemSummary>
                        </TreeItem>

                        <TreeItem>
                            <TreeItemSummary>
                                <TreeItemSummaryTrigger className="flex items-center text-left relative">
                                    <TreeDetailIndicator className="absolute left-[-20px]" />
                                    <ParameterDescription
                                        className="flex-1"
                                        parameterName="email"
                                        typeShorthand="string"
                                        required
                                    />
                                </TreeItemSummaryTrigger>
                                <div className="text-[var(--grayscale-a9)] text-sm" style={{ lineHeight: "1.7142857" }}>
                                    <p>The customer&apos;s email</p>
                                    <p>
                                        Example: <code>john.appleseed@example.com</code>
                                    </p>
                                </div>
                            </TreeItemSummary>
                        </TreeItem>

                        <TreeItem>
                            <TreeItemSummary>
                                <TreeItemSummaryTrigger className="flex items-center text-left relative">
                                    <TreeDetailIndicator className="absolute left-[-20px]" />
                                    <ParameterDescription
                                        className="flex-1"
                                        parameterName="first_name"
                                        typeShorthand="string | null"
                                        required
                                    />
                                </TreeItemSummaryTrigger>
                                <div className="text-[var(--grayscale-a9)] text-sm" style={{ lineHeight: "1.7142857" }}>
                                    <p>The customer&apos;s first name</p>
                                    <p>
                                        Example: <code>John</code>
                                    </p>
                                </div>
                            </TreeItemSummary>
                        </TreeItem>

                        <TreeItem>
                            <TreeItemSummary>
                                <TreeItemSummaryTrigger className="flex items-center text-left relative">
                                    <TreeDetailIndicator className="absolute left-[-20px]" />
                                    <ParameterDescription
                                        className="flex-1"
                                        parameterName="last_name"
                                        typeShorthand="string | null"
                                        required
                                    />
                                </TreeItemSummaryTrigger>
                                <div className="text-[var(--grayscale-a9)] text-sm" style={{ lineHeight: "1.7142857" }}>
                                    <p>The customer&apos;s last name</p>
                                    <p>
                                        Example: <code>Appleseed</code>
                                    </p>
                                </div>
                            </TreeItemSummary>
                        </TreeItem>
                    </TreeItemContent>

                    <TreeItemsContentAdditional>
                        <TreeItem>
                            <TreeItemSummary>
                                <TreeItemSummaryTrigger className="flex items-center text-left relative">
                                    <TreeDetailIndicator className="absolute left-[-20px]" />
                                    <ParameterDescription
                                        className="flex-1"
                                        parameterName="groups"
                                        typeShorthand="object[]"
                                    />
                                </TreeItemSummaryTrigger>
                                <div className="text-[var(--grayscale-a9)] text-sm" style={{ lineHeight: "1.7142857" }}>
                                    <p>
                                        The customer&apos;s groups. A group is a collection of customers that can be
                                        used to manage customers.
                                    </p>
                                </div>
                            </TreeItemSummary>

                            <TreeItemContent>
                                <TreeItem>
                                    <TreeItemSummary>
                                        <TreeItemSummaryTrigger className="flex items-center text-left relative">
                                            <TreeDetailIndicator className="absolute left-[-20px]" />
                                            <ParameterDescription
                                                className="flex-1"
                                                parameterName="id"
                                                typeShorthand="string"
                                                required
                                            />
                                        </TreeItemSummaryTrigger>
                                    </TreeItemSummary>
                                </TreeItem>

                                <TreeItem>
                                    <TreeItemSummary>
                                        <TreeItemSummaryTrigger className="flex items-center text-left relative">
                                            <TreeDetailIndicator className="absolute left-[-20px]" />
                                            <ParameterDescription
                                                className="flex-1"
                                                parameterName="name"
                                                typeShorthand="string"
                                                required
                                            />
                                        </TreeItemSummaryTrigger>
                                    </TreeItemSummary>
                                </TreeItem>

                                <TreeItem>
                                    <TreeItemSummary>
                                        <TreeItemSummaryTrigger className="flex items-center text-left relative">
                                            <TreeDetailIndicator className="absolute left-[-20px]" />
                                            <ParameterDescription
                                                className="flex-1"
                                                parameterName="created_at"
                                                typeShorthand="date"
                                                required
                                            />
                                        </TreeItemSummaryTrigger>
                                    </TreeItemSummary>
                                </TreeItem>

                                <TreeItem>
                                    <TreeItemSummary>
                                        <TreeItemSummaryTrigger className="flex items-center text-left relative">
                                            <TreeDetailIndicator className="absolute left-[-20px]" />
                                            <ParameterDescription
                                                className="flex-1"
                                                parameterName="updated_at"
                                                typeShorthand="date"
                                                required
                                            />
                                        </TreeItemSummaryTrigger>
                                    </TreeItemSummary>
                                </TreeItem>

                                <TreeItem>
                                    <TreeItemSummary>
                                        <TreeItemSummaryTrigger className="flex items-center text-left relative">
                                            <TreeDetailIndicator className="absolute left-[-20px]" />
                                            <ParameterDescription
                                                className="flex-1"
                                                parameterName="deleted_at"
                                                typeShorthand="date | null"
                                                required
                                            />
                                        </TreeItemSummaryTrigger>
                                    </TreeItemSummary>
                                </TreeItem>
                            </TreeItemContent>
                        </TreeItem>
                    </TreeItemsContentAdditional>
                </TreeItem>
            </Tree>
        );
    },
};
