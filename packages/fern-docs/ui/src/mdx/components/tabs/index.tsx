import { cn } from "@fern-docs/components";
import * as RadixTabs from "@radix-ui/react-tabs";
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { useAtomValue } from "jotai";
import React from "react";
import { ANCHOR_ATOM } from "../../../atoms";
import { filterChildren } from "../../common/util";

const HasTabGroupContext = React.createContext<boolean>(false);

const TabGroup = React.forwardRef<
  React.ElementRef<typeof RadixTabs.Root>,
  React.ComponentPropsWithoutRef<typeof RadixTabs.Root> & {
    /**
     * This is only used in the rehype toc plugin
     */
    toc?: boolean;
  }
>((props, ref) => {
  const {
    children,
    value: valueProp,
    onValueChange: onValueChangeProp,
    defaultValue: defaultValueProp,
    ...rest
  } = props;
  const tabs = filterChildren(children, Tab);

  const [activeTab, setActiveTab] = useControllableState({
    prop: valueProp,
    onChange: onValueChangeProp,
    defaultProp: defaultValueProp ?? tabs[0]?.props.id,
  });

  const anchor = useAtomValue(ANCHOR_ATOM);
  React.useEffect(() => {
    if (anchor != null) {
      if (tabs.some((tab) => tab.props.id === anchor)) {
        setActiveTab(anchor);
      }
    }
  }, [anchor, tabs, setActiveTab]);

  return (
    <RadixTabs.Root
      {...rest}
      ref={ref}
      value={activeTab}
      onValueChange={setActiveTab}
    >
      <RadixTabs.List className="border-default mb-6 mt-4 flex gap-4 border-b first:-mt-3">
        {tabs.map(({ props: { title, id } }) => (
          <RadixTabs.Trigger key={id} value={id ?? "untitled"} asChild>
            <h6
              className="text-default scroll-mt-content-padded hover:border-default data-[state=active]:t-accent data-[state=active]:border-accent -mb-px flex max-w-max cursor-pointer whitespace-nowrap border-b border-transparent pb-2.5 pt-3 text-sm font-semibold leading-6"
              id={id}
            >
              {title}
            </h6>
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      <HasTabGroupContext.Provider value={true}>
        {tabs}
      </HasTabGroupContext.Provider>
    </RadixTabs.Root>
  );
});

TabGroup.displayName = "TabGroup";

const Tab = React.forwardRef<
  React.ElementRef<typeof RadixTabs.Content>,
  Omit<React.ComponentPropsWithoutRef<typeof RadixTabs.Content>, "value"> & {
    /**
     * If not provided, the title will default to "Untitled"
     */
    title?: string;
    /**
     * If not provided, the id will be generated from the title using kebab-casing
     */
    id?: string;
    /**
     * This is only used in the rehype toc plugin
     */
    toc?: boolean;
  }
>(({ children, title, id, toc, ...props }, ref) => {
  // if the Tab is not inside a TabGroup, we need to wrap it in a TabGroup to avoid errors
  const hasTabGroupContext = React.useContext(HasTabGroupContext);
  if (!hasTabGroupContext) {
    return (
      <TabGroup toc={toc}>
        <Tab {...props} ref={ref}>
          {children}
        </Tab>
      </TabGroup>
    );
  }
  return (
    <RadixTabs.Content
      {...props}
      ref={ref}
      value={id ?? "untitled"}
      className={cn(
        "border:content-[''] before:mb-4 before:block",
        props.className
      )}
    >
      <HasTabGroupContext.Provider value={false}>
        {children}
      </HasTabGroupContext.Provider>
    </RadixTabs.Content>
  );
});

Tab.displayName = "Tab";

export { Tab, TabGroup };
