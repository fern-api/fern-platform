import { Meta, StoryObj } from "@storybook/react";
import { ParameterDescription } from "./parameter-description";
import * as Tree from "./tree";
import { UnionVariants } from "./union-variants";

const meta: Meta<typeof Tree.Root> = {
    title: "Tree",
    component: Tree.Root,
};

export default meta;
type Story = StoryObj<typeof Tree.Root>;

export const Default: Story = {
    render: () => {
        return (
            <Tree.Root>
                <Tree.Item>
                    <Tree.Summary>
                        <Tree.Trigger className="flex items-center text-left relative">
                            <Tree.Indicator className="absolute left-[-16px]" />
                            <ParameterDescription
                                className="flex-1"
                                parameterName="customer"
                                typeShorthand="object"
                                required
                            />
                        </Tree.Trigger>
                        <div className="text-[var(--grayscale-a9)] text-sm" style={{ lineHeight: "1.7142857" }}>
                            <p>A customer can make purchases in your store and manage their profile.</p>
                        </div>
                    </Tree.Summary>

                    <Tree.Content>
                        <Tree.Item>
                            <Tree.Summary>
                                <Tree.Trigger className="flex items-center text-left relative">
                                    <Tree.Indicator className="absolute left-[-16px]" />
                                    <ParameterDescription
                                        className="flex-1"
                                        parameterName="id"
                                        typeShorthand="string"
                                        required
                                    />
                                </Tree.Trigger>
                                <div className="text-[var(--grayscale-a9)] text-sm" style={{ lineHeight: "1.7142857" }}>
                                    <p>The unique identifier for the customer.</p>
                                </div>
                            </Tree.Summary>
                        </Tree.Item>

                        <Tree.Item>
                            <Tree.Summary>
                                <Tree.Trigger className="flex items-center text-left relative">
                                    <Tree.Indicator className="absolute left-[-16px]" />
                                    <ParameterDescription
                                        className="flex-1"
                                        parameterName="email"
                                        typeShorthand="string"
                                        required
                                    />
                                </Tree.Trigger>
                                <div className="text-[var(--grayscale-a9)] text-sm" style={{ lineHeight: "1.7142857" }}>
                                    <p>The customer&apos;s email</p>
                                    <p>
                                        Example: <code>john.appleseed@example.com</code>
                                    </p>
                                </div>
                            </Tree.Summary>
                        </Tree.Item>

                        <Tree.Item>
                            <Tree.Summary>
                                <Tree.Trigger className="flex items-center text-left relative">
                                    <Tree.Indicator className="absolute left-[-16px]" />
                                    <ParameterDescription
                                        className="flex-1"
                                        parameterName="first_name"
                                        typeShorthand="string | null"
                                        required
                                    />
                                </Tree.Trigger>
                                <div className="text-[var(--grayscale-a9)] text-sm" style={{ lineHeight: "1.7142857" }}>
                                    <p>The customer&apos;s first name</p>
                                    <p>
                                        Example: <code>John</code>
                                    </p>
                                </div>
                            </Tree.Summary>
                        </Tree.Item>

                        <Tree.Item>
                            <Tree.Summary>
                                <Tree.Trigger className="flex items-center text-left relative">
                                    <Tree.Indicator className="absolute left-[-16px]" />
                                    <ParameterDescription
                                        className="flex-1"
                                        parameterName="last_name"
                                        typeShorthand="string | null"
                                        required
                                    />
                                </Tree.Trigger>
                                <div className="text-[var(--grayscale-a9)] text-sm" style={{ lineHeight: "1.7142857" }}>
                                    <p>The customer&apos;s last name</p>
                                    <p>
                                        Example: <code>Appleseed</code>
                                    </p>
                                </div>
                            </Tree.Summary>
                        </Tree.Item>
                    </Tree.Content>

                    <Tree.CollapsedContent>
                        <Tree.Item>
                            <Tree.Summary>
                                <Tree.Trigger className="flex items-center text-left relative">
                                    <Tree.Indicator className="absolute left-[-16px]" />
                                    <ParameterDescription
                                        className="flex-1"
                                        parameterName="groups"
                                        typeShorthand="object[]"
                                    />
                                </Tree.Trigger>
                                <div className="text-[var(--grayscale-a9)] text-sm" style={{ lineHeight: "1.7142857" }}>
                                    <p>
                                        The customer&apos;s groups. A group is a collection of customers that can be
                                        used to manage customers.
                                    </p>
                                </div>
                            </Tree.Summary>

                            <Tree.Content>
                                <Tree.Item>
                                    <Tree.Summary>
                                        <Tree.Trigger className="flex items-center text-left relative">
                                            <Tree.Indicator className="absolute left-[-16px]" />
                                            <ParameterDescription
                                                className="flex-1"
                                                parameterName="id"
                                                typeShorthand="string"
                                                required
                                            />
                                        </Tree.Trigger>
                                    </Tree.Summary>
                                </Tree.Item>

                                <Tree.Item>
                                    <Tree.Summary>
                                        <Tree.Trigger className="flex items-center text-left relative">
                                            <Tree.Indicator className="absolute left-[-16px]" />
                                            <ParameterDescription
                                                className="flex-1"
                                                parameterName="name"
                                                typeShorthand="string"
                                                required
                                            />
                                        </Tree.Trigger>
                                    </Tree.Summary>
                                </Tree.Item>

                                <Tree.Item>
                                    <Tree.Summary>
                                        <Tree.Trigger className="flex items-center text-left relative">
                                            <Tree.Indicator className="absolute left-[-16px]" />
                                            <ParameterDescription
                                                className="flex-1"
                                                parameterName="created_at"
                                                typeShorthand="date"
                                                required
                                            />
                                        </Tree.Trigger>
                                    </Tree.Summary>
                                </Tree.Item>

                                <Tree.Item>
                                    <Tree.Summary>
                                        <Tree.Trigger className="flex items-center text-left relative">
                                            <Tree.Indicator className="absolute left-[-16px]" />
                                            <ParameterDescription
                                                className="flex-1"
                                                parameterName="updated_at"
                                                typeShorthand="date"
                                                required
                                            />
                                        </Tree.Trigger>
                                    </Tree.Summary>
                                </Tree.Item>

                                <Tree.Item>
                                    <Tree.Summary>
                                        <Tree.Trigger className="flex items-center text-left relative">
                                            <Tree.Indicator className="absolute left-[-16px]" />
                                            <ParameterDescription
                                                className="flex-1"
                                                parameterName="deleted_at"
                                                typeShorthand="date | null"
                                                required
                                            />
                                        </Tree.Trigger>
                                    </Tree.Summary>
                                </Tree.Item>

                                <UnionVariants>
                                    <Tree.Root>
                                        <Tree.Item>
                                            <Tree.Summary>
                                                <Tree.Trigger className="flex items-center text-left relative">
                                                    <Tree.Indicator className="absolute left-[-16px]" />
                                                    <ParameterDescription
                                                        className="flex-1"
                                                        parameterName="id"
                                                        typeShorthand="string"
                                                        required
                                                    />
                                                </Tree.Trigger>
                                            </Tree.Summary>
                                        </Tree.Item>
                                    </Tree.Root>

                                    <Tree.Root>
                                        <Tree.Item>
                                            <Tree.Summary>
                                                <Tree.Trigger className="flex items-center text-left relative">
                                                    <Tree.Indicator className="absolute left-[-16px]" />
                                                    <ParameterDescription
                                                        className="flex-1"
                                                        parameterName="id"
                                                        typeShorthand="string"
                                                        required
                                                    />
                                                </Tree.Trigger>
                                            </Tree.Summary>
                                        </Tree.Item>
                                    </Tree.Root>
                                </UnionVariants>
                            </Tree.Content>
                        </Tree.Item>

                        <Tree.Item>
                            <Tree.Summary>
                                <Tree.Trigger className="flex items-center text-left relative">
                                    <Tree.Indicator className="absolute left-[-18px]" />
                                    <ParameterDescription
                                        className="flex-1"
                                        parameterName="groups"
                                        typeShorthand="object[]"
                                    />
                                </Tree.Trigger>
                                <div className="text-[var(--grayscale-a9)] text-sm" style={{ lineHeight: "1.7142857" }}>
                                    <p>
                                        The customer&apos;s groups. A group is a collection of customers that can be
                                        used to manage customers.
                                    </p>
                                </div>
                            </Tree.Summary>

                            <Tree.Content>
                                <Tree.Item>
                                    <Tree.Summary>
                                        <Tree.Trigger className="flex items-center text-left relative">
                                            <Tree.Indicator className="absolute left-[-16px]" />
                                            <ParameterDescription
                                                className="flex-1"
                                                parameterName="id"
                                                typeShorthand="string"
                                                required
                                            />
                                        </Tree.Trigger>
                                    </Tree.Summary>
                                </Tree.Item>

                                <Tree.Item>
                                    <Tree.Summary>
                                        <Tree.Trigger className="flex items-center text-left relative">
                                            <Tree.Indicator className="absolute left-[-16px]" />
                                            <ParameterDescription
                                                className="flex-1"
                                                parameterName="name"
                                                typeShorthand="string"
                                                required
                                            />
                                        </Tree.Trigger>
                                    </Tree.Summary>
                                </Tree.Item>

                                <Tree.Item>
                                    <Tree.Summary>
                                        <Tree.Trigger className="flex items-center text-left relative">
                                            <Tree.Indicator className="absolute left-[-16px]" />
                                            <ParameterDescription
                                                className="flex-1"
                                                parameterName="created_at"
                                                typeShorthand="date"
                                                required
                                            />
                                        </Tree.Trigger>
                                    </Tree.Summary>
                                </Tree.Item>

                                <Tree.Item>
                                    <Tree.Summary>
                                        <Tree.Trigger className="flex items-center text-left relative">
                                            <Tree.Indicator className="absolute left-[-16px]" />
                                            <ParameterDescription
                                                className="flex-1"
                                                parameterName="updated_at"
                                                typeShorthand="date"
                                                required
                                            />
                                        </Tree.Trigger>
                                    </Tree.Summary>
                                </Tree.Item>

                                <Tree.Item>
                                    <Tree.Summary>
                                        <Tree.Trigger className="flex items-center text-left relative">
                                            <Tree.Indicator className="absolute left-[-16px]" />
                                            <ParameterDescription
                                                className="flex-1"
                                                parameterName="deleted_at"
                                                typeShorthand="date | null"
                                                required
                                            />
                                        </Tree.Trigger>
                                    </Tree.Summary>
                                </Tree.Item>
                            </Tree.Content>
                        </Tree.Item>
                    </Tree.CollapsedContent>
                </Tree.Item>
            </Tree.Root>
        );
    },
};
