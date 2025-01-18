import { isNonNullish } from "@fern-api/ui-core-utils";
import {
  AccordionMultipleProps,
  AccordionSingleProps,
  Accordion as FernAccordion,
  cn,
} from "@fern-docs/components";
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { uniq } from "es-toolkit/array";
import { kebabCase } from "es-toolkit/string";
import { useAtomValue } from "jotai";
import React from "react";
import { UnreachableCaseError } from "ts-essentials";
import { ANCHOR_ATOM } from "../../../atoms";
import { filterChildren } from "../../common/util";

const HasAccordionGroupContext = React.createContext<boolean>(false);

type AccordionGroupProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  "children"
> & {
  /**
   * The direct children of the accordion group must always be <Accordion />.
   * All other children types will be ignored.
   */
  children?:
    | React.ReactElement<typeof Accordion>
    | React.ReactElement<typeof Accordion>[];
  /**
   * @default false
   */
  disabled?: boolean;
  /**
   * @default multiple
   */
  type?: "multiple" | "single";
  /**
   * must be string if type is single, string[] if type is multiple
   */
  value?: string | string[];
  /**
   * must be string if type is single, string[] if type is multiple
   */
  defaultValue?: string | string[];
  /**
   * must be (value: string[]) => void if type is multiple, (value: string) => void if type is single
   * this will be called whenever any of the accordion items are opened or closed
   */
  onValueChange?: ((value: string[]) => void) | ((value: string) => void);
  /**
   * @default "ltr"
   */
  dir?: "ltr" | "rtl";
};

type AccordionProps = React.ComponentPropsWithoutRef<"div"> & {
  /**
   * The id is automatically generated from the title prop, but can be overridden here.
   */
  id?: string;
  /**
   * The title is used as the trigger text for the detail summary.
   */
  title?: string;
  /**
   * @default false
   */
  disabled?: boolean;
};

/**
 * This is a curried component that allows you to create an accordion group.
 *
 * The direct children of the accordion group must always be <Accordion />.
 * All other children types will be ignored.
 *
 * Support props are declared below, including additional div attributes.
 *
 * By default, type="multiple" which means that multiple accordion items can be open at once.
 * You can change this to type="single" which means that only one accordion item can be open at once.
 */
const AccordionGroup = React.forwardRef<
  React.ElementRef<typeof FernAccordion.Root>,
  AccordionGroupProps
>((props, forwardedRef) => {
  const {
    children,
    disabled,
    type = "multiple",
    value,
    defaultValue,
    onValueChange,
    ...rest
  } = props;
  const items = filterChildren(children, Accordion);
  const ids = uniq(items.map((item) => item.props.id).filter(isNonNullish));
  if (type === "multiple") {
    return (
      <AccordionGroupMultipleImpl
        ref={forwardedRef}
        {...rest}
        disabled={disabled}
        ids={ids}
        value={Array.isArray(value) ? value : value ? [value] : undefined}
        defaultValue={
          Array.isArray(defaultValue)
            ? defaultValue
            : defaultValue
              ? [defaultValue]
              : undefined
        }
        onValueChange={onValueChange as (value: string[]) => void}
      />
    );
  } else if (type === "single") {
    return (
      <AccordionGroupSingleImpl
        ref={forwardedRef}
        {...rest}
        disabled={disabled}
        ids={ids}
        value={typeof value === "string" ? value : undefined}
        defaultValue={
          typeof defaultValue === "string" ? defaultValue : undefined
        }
        onValueChange={onValueChange as (value: string) => void}
      />
    );
  }
  console.error(new UnreachableCaseError(type));
  return false;
});

AccordionGroup.displayName = "AccordionGroup";

const AccordionGroupMultipleImpl = React.forwardRef<
  React.ElementRef<typeof FernAccordion.Root>,
  Omit<AccordionMultipleProps, "type"> & { ids: string[] }
>(
  (
    { children, ids, value: valueProp, defaultValue, onValueChange, ...props },
    forwardedRef
  ) => {
    const [value, setValue] = useControllableState({
      prop: valueProp,
      defaultProp: defaultValue,
      onChange: onValueChange,
    });

    const anchor = useAtomValue(ANCHOR_ATOM);
    React.useEffect(() => {
      if (anchor && ids.includes(anchor)) {
        setValue((prev) =>
          prev?.includes(anchor) ? prev : [...(prev ?? []), anchor]
        );
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [anchor]);

    return (
      <FernAccordion.Root
        ref={forwardedRef}
        {...props}
        type="multiple"
        value={value}
        onValueChange={setValue}
      >
        {children}
      </FernAccordion.Root>
    );
  }
);

AccordionGroupMultipleImpl.displayName = "AccordionGroupMultipleImpl";

const AccordionGroupSingleImpl = React.forwardRef<
  React.ElementRef<typeof FernAccordion.Root>,
  Omit<AccordionSingleProps, "type"> & { ids: string[] }
>(
  (
    { children, ids, value: valueProp, defaultValue, onValueChange, ...props },
    forwardedRef
  ) => {
    const [value, setValue] = useControllableState({
      prop: valueProp,
      defaultProp: defaultValue,
      onChange: onValueChange,
    });

    const anchor = useAtomValue(ANCHOR_ATOM);
    React.useEffect(() => {
      if (anchor && ids.includes(anchor)) {
        setValue(anchor);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [anchor]);

    return (
      <FernAccordion.Root
        ref={forwardedRef}
        {...props}
        type="single"
        value={value}
        onValueChange={setValue}
      >
        {children}
      </FernAccordion.Root>
    );
  }
);

AccordionGroupSingleImpl.displayName = "AccordionGroupSingleImpl";

/**
 * This is a curried component that allows you to create an accordion item.
 *
 * Support props are declared below, including additional div attributes.
 *
 * If the <Accordion> is not wrapped in a <AccordionGroup>, it will automatically wrap itself in a <AccordionGroup> with type="single".
 */
const Accordion = React.forwardRef<
  React.ElementRef<typeof FernAccordion.Item>,
  AccordionProps
>(({ children, ...props }, forwardedRef) => {
  const hasAccordionGroup = React.useContext(HasAccordionGroupContext);
  if (!hasAccordionGroup) {
    return (
      <AccordionGroup type="single">
        <Accordion ref={forwardedRef} {...props}>
          {children}
        </Accordion>
      </AccordionGroup>
    );
  }

  const value = props.id || kebabCase(props.title ?? "");
  return (
    <FernAccordion.Item
      {...props}
      value={value}
      ref={forwardedRef}
      className={cn("scroll-mt-content-padded", props.className)}
    >
      <FernAccordion.Trigger>{props.title}</FernAccordion.Trigger>
      <FernAccordion.Content>
        <HasAccordionGroupContext.Provider value={false}>
          <div className="m-5">{children}</div>
        </HasAccordionGroupContext.Provider>
      </FernAccordion.Content>
    </FernAccordion.Item>
  );
});

Accordion.displayName = "Accordion";

export { Accordion, AccordionGroup };
