import { Meta, StoryObj } from "@storybook/react";
import * as Parameter from "./parameter-description";
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
            <Tree.Trigger className="relative flex items-center text-left">
              <Tree.Indicator className="absolute left-[-16px]" />
              <Parameter.Root>
                <Parameter.Name parameterName="customer" />
                <Parameter.Spacer />
                <Parameter.Status status="required" />
              </Parameter.Root>
            </Tree.Trigger>
            <div
              className="text-sm text-[var(--grayscale-a9)]"
              style={{ lineHeight: "1.7142857" }}
            >
              <p>
                A customer can make purchases in your store and manage their
                profile.
              </p>
            </div>
          </Tree.Summary>

          <Tree.Content>
            <Tree.Item>
              <Tree.Summary>
                <Tree.Trigger className="relative flex items-center text-left">
                  <Tree.Indicator className="absolute left-[-16px]" />
                  <Parameter.Root>
                    <Parameter.Name parameterName="id" />
                    <Parameter.Spacer />
                    <Parameter.Status status="required" />
                  </Parameter.Root>
                </Tree.Trigger>
                <div
                  className="text-sm text-[var(--grayscale-a9)]"
                  style={{ lineHeight: "1.7142857" }}
                >
                  <p>The unique identifier for the customer.</p>
                </div>
              </Tree.Summary>
            </Tree.Item>

            <Tree.Item>
              <Tree.Summary>
                <Tree.Trigger className="relative flex items-center text-left">
                  <Tree.Indicator className="absolute left-[-16px]" />
                  <Parameter.Root>
                    <Parameter.Name parameterName="email" />
                    <Parameter.Spacer />
                    <Parameter.Status status="required" />
                  </Parameter.Root>
                </Tree.Trigger>
                <div
                  className="text-sm text-[var(--grayscale-a9)]"
                  style={{ lineHeight: "1.7142857" }}
                >
                  <p>The customer&apos;s email</p>
                  <p>
                    Example: <code>john.appleseed@example.com</code>
                  </p>
                </div>
              </Tree.Summary>
            </Tree.Item>

            <Tree.Item>
              <Tree.Summary>
                <Tree.Trigger className="relative flex items-center text-left">
                  <Tree.Indicator className="absolute left-[-16px]" />
                  <Parameter.Root>
                    <Parameter.Name parameterName="first_name" />
                    <span className="text-sm text-[var(--grayscale-a9)]">
                      {"string | null"}
                    </span>
                    <Parameter.Spacer />
                    <Parameter.Status status="required" />
                  </Parameter.Root>
                </Tree.Trigger>
                <div
                  className="text-sm text-[var(--grayscale-a9)]"
                  style={{ lineHeight: "1.7142857" }}
                >
                  <p>The customer&apos;s first name</p>
                  <p>
                    Example: <code>John</code>
                  </p>
                </div>
              </Tree.Summary>
            </Tree.Item>

            <Tree.Item>
              <Tree.Summary>
                <Tree.Trigger className="relative flex items-center text-left">
                  <Tree.Indicator className="absolute left-[-16px]" />
                  <Parameter.Root>
                    <Parameter.Name parameterName="last_name" />
                    <Parameter.Spacer />
                    <Parameter.Status status="required" />
                  </Parameter.Root>
                </Tree.Trigger>
                <div
                  className="text-sm text-[var(--grayscale-a9)]"
                  style={{ lineHeight: "1.7142857" }}
                >
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
                <Tree.Trigger className="relative flex items-center text-left">
                  <Tree.Indicator className="absolute left-[-16px]" />
                  <Parameter.Root>
                    <Parameter.Name parameterName="groups" />
                    <span className="text-sm text-[var(--grayscale-a9)]">
                      {"object[]"}
                    </span>
                    <Parameter.Spacer />
                    <Parameter.Status status="optional" />
                  </Parameter.Root>
                </Tree.Trigger>
                <div
                  className="text-sm text-[var(--grayscale-a9)]"
                  style={{ lineHeight: "1.7142857" }}
                >
                  <p>
                    The customer&apos;s groups. A group is a collection of
                    customers that can be used to manage customers.
                  </p>
                </div>
              </Tree.Summary>

              <Tree.Content>
                <Tree.Item>
                  <Tree.Summary>
                    <Tree.Trigger className="relative flex items-center text-left">
                      <Tree.Indicator className="absolute left-[-16px]" />
                      <Parameter.Root>
                        <Parameter.Name parameterName="id" />
                        <Parameter.Spacer />
                        <Parameter.Status status="required" />
                      </Parameter.Root>
                    </Tree.Trigger>
                  </Tree.Summary>
                </Tree.Item>

                <Tree.Item>
                  <Tree.Summary>
                    <Tree.Trigger className="relative flex items-center text-left">
                      <Tree.Indicator className="absolute left-[-16px]" />
                      <Parameter.Root>
                        <Parameter.Name parameterName="name" />
                        <Parameter.Spacer />
                        <Parameter.Status status="required" />
                      </Parameter.Root>
                    </Tree.Trigger>
                  </Tree.Summary>
                </Tree.Item>

                <Tree.Item>
                  <Tree.Summary>
                    <Tree.Trigger className="relative flex items-center text-left">
                      <Tree.Indicator className="absolute left-[-16px]" />
                      <Parameter.Root>
                        <Parameter.Name parameterName="created_at" />
                        <Parameter.Spacer />
                        <Parameter.Status status="required" />
                      </Parameter.Root>
                    </Tree.Trigger>
                  </Tree.Summary>
                </Tree.Item>

                <Tree.Item>
                  <Tree.Summary>
                    <Tree.Trigger className="relative flex items-center text-left">
                      <Tree.Indicator className="absolute left-[-16px]" />
                      <Parameter.Root>
                        <Parameter.Name parameterName="updated_at" />
                        <Parameter.Spacer />
                        <Parameter.Status status="required" />
                      </Parameter.Root>
                    </Tree.Trigger>
                  </Tree.Summary>
                </Tree.Item>

                <Tree.Item>
                  <Tree.Summary>
                    <Tree.Trigger className="relative flex items-center text-left">
                      <Tree.Indicator className="absolute left-[-16px]" />
                      <Parameter.Root>
                        <Parameter.Name parameterName="deleted_at" />
                        <Parameter.Spacer />
                        <Parameter.Status status="required" />
                      </Parameter.Root>
                    </Tree.Trigger>
                  </Tree.Summary>
                </Tree.Item>

                <UnionVariants>
                  <Tree.Root>
                    <Tree.Item>
                      <Tree.Summary>
                        <Tree.Trigger className="relative flex items-center text-left">
                          <Tree.Indicator className="absolute left-[-16px]" />
                          <Parameter.Root>
                            <Parameter.Name parameterName="id" />
                            <span className="text-sm text-[var(--grayscale-a9)]">
                              {"string"}
                            </span>
                            <Parameter.Spacer />
                            <Parameter.Status status="required" />
                          </Parameter.Root>
                        </Tree.Trigger>
                      </Tree.Summary>
                    </Tree.Item>
                  </Tree.Root>

                  <Tree.Root>
                    <Tree.Item>
                      <Tree.Summary>
                        <Tree.Trigger className="relative flex items-center text-left">
                          <Tree.Indicator className="absolute left-[-16px]" />
                          <Parameter.Root>
                            <Parameter.Name parameterName="id" />
                            <span className="text-sm text-[var(--grayscale-a9)]">
                              {"string"}
                            </span>
                            <Parameter.Spacer />
                            <Parameter.Status status="required" />
                          </Parameter.Root>
                        </Tree.Trigger>
                      </Tree.Summary>
                    </Tree.Item>
                  </Tree.Root>
                </UnionVariants>
              </Tree.Content>
            </Tree.Item>

            <Tree.Item>
              <Tree.Summary>
                <Tree.Trigger className="relative flex items-center text-left">
                  <Tree.Indicator className="absolute left-[-18px]" />
                  <Parameter.Root>
                    <Parameter.Name parameterName="groups" />
                    <span className="text-sm text-[var(--grayscale-a9)]">
                      {"object[]"}
                    </span>
                    <Parameter.Spacer />
                    <Parameter.Status status="optional" />
                  </Parameter.Root>
                </Tree.Trigger>
                <div
                  className="text-sm text-[var(--grayscale-a9)]"
                  style={{ lineHeight: "1.7142857" }}
                >
                  <p>
                    The customer&apos;s groups. A group is a collection of
                    customers that can be used to manage customers.
                  </p>
                </div>
              </Tree.Summary>

              <Tree.Content>
                <Tree.Item>
                  <Tree.Summary>
                    <Tree.Trigger className="relative flex items-center text-left">
                      <Tree.Indicator className="absolute left-[-16px]" />
                      <Parameter.Root>
                        <Parameter.Name parameterName="id" />
                        <Parameter.Spacer />
                        <Parameter.Status status="required" />
                      </Parameter.Root>
                    </Tree.Trigger>
                  </Tree.Summary>
                </Tree.Item>

                <Tree.Item>
                  <Tree.Summary>
                    <Tree.Trigger className="relative flex items-center text-left">
                      <Tree.Indicator className="absolute left-[-16px]" />
                      <Parameter.Root>
                        <Parameter.Name parameterName="name" />
                        <Parameter.Spacer />
                        <Parameter.Status status="required" />
                      </Parameter.Root>
                    </Tree.Trigger>
                  </Tree.Summary>
                </Tree.Item>

                <Tree.Item>
                  <Tree.Summary>
                    <Tree.Trigger className="relative flex items-center text-left">
                      <Tree.Indicator className="absolute left-[-16px]" />
                      <Parameter.Root>
                        <Parameter.Name parameterName="created_at" />
                        <Parameter.Spacer />
                        <Parameter.Status status="required" />
                      </Parameter.Root>
                    </Tree.Trigger>
                  </Tree.Summary>
                </Tree.Item>

                <Tree.Item>
                  <Tree.Summary>
                    <Tree.Trigger className="relative flex items-center text-left">
                      <Tree.Indicator className="absolute left-[-16px]" />
                      <Parameter.Root>
                        <Parameter.Name parameterName="updated_at" />
                        <Parameter.Spacer />
                        <Parameter.Status status="required" />
                      </Parameter.Root>
                    </Tree.Trigger>
                  </Tree.Summary>
                </Tree.Item>

                <Tree.Item>
                  <Tree.Summary>
                    <Tree.Trigger className="relative flex items-center text-left">
                      <Tree.Indicator className="absolute left-[-16px]" />
                      <Parameter.Root>
                        <Parameter.Name parameterName="deleted_at" />
                        <span className="text-sm text-[var(--grayscale-a9)]">
                          {"date | null"}
                        </span>
                        <Parameter.Spacer />
                        <Parameter.Status status="optional" />
                      </Parameter.Root>
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
