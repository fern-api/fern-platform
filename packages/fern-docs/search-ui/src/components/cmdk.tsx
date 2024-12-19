import * as RadixDialog from "@radix-ui/react-dialog";
import { useId } from "@radix-ui/react-id";
import { Primitive } from "@radix-ui/react-primitive";
import {
  ComponentPropsWithoutRef,
  KeyboardEvent,
  LegacyRef,
  MutableRefObject,
  ReactElement,
  ReactNode,
  RefCallback,
  RefObject,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useIsomorphicLayoutEffect } from "swr/_internal";
import { z } from "zod";
import { commandScore } from "./command-score";

type Children = { children?: ReactNode };
type DivProps = ComponentPropsWithoutRef<"div"> & {
  asChild?: boolean;
};

type LoadingProps = Children &
  DivProps & {
    /** Estimated progress of loading asynchronous options. */
    progress?: number;
    /**
     * Accessible label for this loading progressbar. Not shown visibly.
     */
    label?: string;
  };

type EmptyProps = Children & DivProps;
type SeparatorProps = DivProps & {
  /** Whether this separator should always be rendered. Useful if you disable automatic filtering. */
  alwaysRender?: boolean;
};
type DialogProps = RadixDialog.DialogProps &
  CommandProps & {
    /** Provide a className to the Dialog overlay. */
    overlayClassName?: string;
    /** Provide a className to the Dialog content. */
    contentClassName?: string;
    /** Provide a custom element the Dialog should portal into. */
    container?: HTMLElement;
  };
type ListProps = Children &
  DivProps & {
    /**
     * Accessible label for this List of suggestions. Not shown visibly.
     */
    label?: string;
  };
const ScrollLogicalPositionSchema = z.enum([
  "center",
  "end",
  "nearest",
  "start",
]);
type ScrollLogicalPosition = z.infer<typeof ScrollLogicalPositionSchema>;
type ItemProps = Children &
  Omit<DivProps, "disabled" | "onSelect" | "value"> & {
    /** Whether this item is currently disabled. */
    disabled?: boolean;
    /** Event handler for when this item is selected, either via click or keyboard selection. */
    onSelect?: (value: string) => void;
    /**
     * A unique value for this item.
     * If no value is provided, it will be inferred from `children` or the rendered `textContent`. If your `textContent` changes between renders, you _must_ provide a stable, unique `value`.
     */
    value?: string;
    /** Optional keywords to match against when filtering. */
    keywords?: string[];
    /** Whether this item is forcibly rendered regardless of filtering. */
    forceMount?: boolean;
    /**
     * The position to scroll the item to when it is selected.
     * @default "nearest"
     */
    scrollLogicalPosition?: ScrollLogicalPosition;
  };
type GroupProps = Children &
  Omit<DivProps, "heading" | "value"> & {
    /** Optional heading to render for this group. */
    heading?: ReactNode;
    /** If no heading is provided, you must provide a value that is unique for this group. */
    value?: string;
    /** Whether this group is forcibly rendered regardless of filtering. */
    forceMount?: boolean;
  };
type InputProps = Omit<
  ComponentPropsWithoutRef<"input">,
  "value" | "onChange" | "type"
> & {
  asChild?: boolean;
  /**
   * Optional controlled state for the value of the search input.
   */
  value?: string;
  /**
   * Event handler called when the search value changes.
   */
  onValueChange?: (search: string) => void;
};
type CommandProps = Children &
  DivProps & {
    /**
     * Accessible label for this command menu. Not shown visibly.
     */
    label?: string;
    /**
     * Optionally set to `false` to turn off the automatic filtering and sorting.
     * If `false`, you must conditionally render valid items based on the search query yourself.
     */
    shouldFilter?: boolean;
    /**
     * Custom filter function for whether each command menu item should matches the given search query.
     * It should return a number between 0 and 1, with 1 being the best match and 0 being hidden entirely.
     * By default, uses the `command-score` library.
     */
    filter?: (value: string, search: string, keywords?: string[]) => number;
    /**
     * Optional default item value when it is initially rendered.
     */
    defaultValue?: string;
    /**
     * Optional controlled state of the selected command menu item.
     */
    value?: string;
    /**
     * Event handler called when the selected item of the menu changes.
     */
    onValueChange?: (value: string) => void;
    /**
     * Optionally set to `true` to turn on looping around when using the arrow keys.
     */
    loop?: boolean;
    /**
     * Optionally set to `true` to disable selection via pointer events.
     */
    disablePointerSelection?: boolean;
    /**
     * Set to `false` to disable ctrl+n/j/p/k shortcuts. Defaults to `true`.
     */
    vimBindings?: boolean;
  };

type Context = {
  value: (id: string, value: string, keywords?: string[]) => void;
  item: (id: string, groupId: string) => () => void;
  group: (id: string) => () => void;
  filter: () => boolean;
  label: string;
  getDisablePointerSelection: () => boolean;
  // Ids
  listId: string;
  labelId: string;
  inputId: string;
  // Refs
  listInnerRef: RefObject<HTMLDivElement | null>;
};
type State = {
  search: string;
  value: string;
  filtered: {
    count: number;
    items: Map<string, number>;
    groups: Set<string>;
  };
};
type Store = {
  subscribe: (callback: () => void) => () => void;
  snapshot: () => State;
  setState: <K extends keyof State>(
    key: K,
    value: State[K],
    opts?: any
  ) => void;
  emit: () => void;
};
type Group = {
  id: string;
  forceMount?: boolean;
};

const GROUP_SELECTOR = "[data-cmdk-group]";
const GROUP_ITEMS_SELECTOR = "[data-cmdk-group-items]";
const GROUP_HEADING_SELECTOR = "[data-cmdk-group-heading]";
const ITEM_SELECTOR = "[data-cmdk-item]";
const VALID_ITEM_SELECTOR = `${ITEM_SELECTOR}:not([aria-disabled="true"])`;
const SELECT_EVENT = "cmdk-item-select";
const VALUE_ATTR = "data-value";
const defaultFilter: CommandProps["filter"] = (value, search, keywords) =>
  commandScore(value, search, keywords) ?? 0;

const CommandContext = createContext<Context>(undefined as unknown as Context);
const useCommand = () => useContext(CommandContext);
const StoreContext = createContext<Store>(undefined as unknown as Store);
const useStore = () => useContext(StoreContext);
const GroupContext = createContext<Group>(undefined as unknown as Group);

// const getId = (() => {
//     let i = 0;
//     return () => `${i++}`;
// })();
// const useIdCompatibility = () => {
//     useState(getId);
//     const [id] = useState(getId);
//     return "cmdk" + id;
// };

const Root = forwardRef<HTMLDivElement, CommandProps>((props, forwardedRef) => {
  const state = useLazyRef<State>(() => ({
    /** Value of the search query. */
    search: "",
    /** Currently selected item value. */
    value: props.value ?? props.defaultValue ?? "",
    filtered: {
      /** The count of all visible items. */
      count: 0,
      /** Map from visible item id to its search score. */
      items: new Map(),
      /** Set of groups with at least one visible item. */
      groups: new Set(),
    },
  }));
  const allItems = useLazyRef<Set<string>>(() => new Set()); // [...itemIds]
  const allGroups = useLazyRef<Map<string, Set<string>>>(() => new Map()); // groupId → [...itemIds]
  const ids = useLazyRef<Map<string, { value: string; keywords?: string[] }>>(
    () => new Map()
  ); // id → { value, keywords }
  const listeners = useLazyRef<Set<() => void>>(() => new Set()); // [...rerenders]
  const propsRef = useAsRef(props);
  const {
    label,
    children,
    value,
    onValueChange,
    filter,
    shouldFilter,
    loop,
    // disablePointerSelection = false,
    vimBindings = true,
    ...etc
  } = props;

  const listId = useId();
  const labelId = useId();
  const inputId = useId();

  const listInnerRef = useRef<HTMLDivElement>(null);

  const schedule = useScheduleLayoutEffect();

  /** Controlled mode `value` handling. */
  useIsomorphicLayoutEffect(() => {
    if (value !== undefined) {
      const v = value.trim();
      state.current.value = v;
      store.emit();
    }
  }, [value]);

  useIsomorphicLayoutEffect(() => {
    schedule(6, scrollSelectedIntoView);
  }, []);

  const store: Store = useMemo(() => {
    return {
      subscribe: (cb) => {
        listeners.current.add(cb);
        return () => listeners.current.delete(cb);
      },
      snapshot: () => {
        return state.current;
      },
      setState: (key, value, opts) => {
        if (Object.is(state.current[key], value)) {
          return;
        }
        state.current[key] = value;

        if (key === "search") {
          // Filter synchronously before emitting back to children
          filterItems();
          sort();
          schedule(1, selectFirstItem);
        } else if (key === "value") {
          // opts is a boolean referring to whether it should NOT be scrolled into view
          if (!opts) {
            // Scroll the selected item into view
            schedule(5, scrollSelectedIntoView);
          }
          if (propsRef.current?.value !== undefined) {
            // If controlled, just call the callback instead of updating state internally
            const newValue = (value ?? "") as string;
            propsRef.current.onValueChange?.(newValue);
            return;
          }
        }

        // Notify subscribers that state has changed
        store.emit();
      },
      emit: () => {
        listeners.current.forEach((l) => l());
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const context: Context = useMemo(
    () => ({
      // Keep id → {value, keywords} mapping up-to-date
      value: (id, value, keywords) => {
        if (value !== ids.current.get(id)?.value) {
          ids.current.set(id, { value, keywords });
          state.current.filtered.items.set(id, score(value, keywords));
          schedule(2, () => {
            sort();
            store.emit();
          });
        }
      },
      // Track item lifecycle (mount, unmount)
      item: (id, groupId) => {
        allItems.current.add(id);

        // Track this item within the group
        if (groupId) {
          if (!allGroups.current.has(groupId)) {
            allGroups.current.set(groupId, new Set([id]));
          } else {
            allGroups.current.get(groupId)?.add(id);
          }
        }

        // Batch this, multiple items can mount in one pass
        // and we should not be filtering/sorting/emitting each time
        schedule(3, () => {
          filterItems();
          sort();

          // Could be initial mount, select the first item if none already selected
          if (!state.current.value) {
            selectFirstItem();
          }

          store.emit();
        });

        return () => {
          ids.current.delete(id);
          allItems.current.delete(id);
          state.current.filtered.items.delete(id);
          const selectedItem = getSelectedItem();

          // Batch this, multiple items could be removed in one pass
          schedule(4, () => {
            filterItems();

            // The item removed have been the selected one,
            // so selection should be moved to the first
            if (selectedItem?.getAttribute("id") === id) {
              selectFirstItem();
            }

            store.emit();
          });
        };
      },
      // Track group lifecycle (mount, unmount)
      group: (id) => {
        if (!allGroups.current.has(id)) {
          allGroups.current.set(id, new Set());
        }

        return () => {
          ids.current.delete(id);
          allGroups.current.delete(id);
        };
      },
      filter: () => {
        return propsRef.current.shouldFilter ?? true;
      },
      label: label || props["aria-label"] || "",
      getDisablePointerSelection: () => {
        return propsRef.current.disablePointerSelection ?? false;
      },
      listId,
      inputId,
      labelId,
      listInnerRef,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  function score(value: string, keywords?: string[]) {
    const filter = propsRef.current?.filter ?? defaultFilter;
    return value ? (filter?.(value, state.current.search, keywords) ?? 0) : 0;
  }

  /** Sorts items by score, and groups by highest item score. */
  function sort() {
    if (
      !state.current.search ||
      // Explicitly false, because true | undefined is the default
      propsRef.current.shouldFilter === false
    ) {
      return;
    }

    const scores = state.current.filtered.items;

    // Sort the groups
    const groups: [string, number][] = [];
    state.current.filtered.groups.forEach((value) => {
      const items = allGroups.current.get(value);

      // Get the maximum score of the group's items
      let max = 0;
      items?.forEach((item) => {
        const score = scores.get(item);
        max = Math.max(score ?? 0, max);
      });

      groups.push([value, max]);
    });

    // Sort items within groups to bottom
    // Sort items outside of groups
    // Sort groups to bottom (pushes all non-grouped items to the top)
    const listInsertionElement = listInnerRef.current;

    // Sort the items
    getValidItems()
      .sort((a, b) => {
        const valueA = a.getAttribute("id");
        const valueB = b.getAttribute("id");
        return (
          (scores.get(valueB ?? "__unknown") ?? 0) -
          (scores.get(valueA ?? "__unknown") ?? 0)
        );
      })
      .forEach((item) => {
        const group = item.closest(GROUP_ITEMS_SELECTOR);

        if (group) {
          const child =
            item.parentElement === group
              ? item
              : item.closest(`${GROUP_ITEMS_SELECTOR} > *`);
          if (child) {
            group.appendChild(child);
          }
        } else {
          const child =
            item.parentElement === listInsertionElement
              ? item
              : item.closest(`${GROUP_ITEMS_SELECTOR} > *`);
          if (child) {
            listInsertionElement?.appendChild(child);
          }
        }
      });

    groups
      .sort((a, b) => b[1] - a[1])
      .forEach((group) => {
        const element = listInnerRef.current?.querySelector(
          `${GROUP_SELECTOR}[${VALUE_ATTR}="${encodeURIComponent(group[0])}"]`
        );
        element?.parentElement?.appendChild(element);
      });
  }

  function selectFirstItem() {
    const item = getValidItems().find(
      (item) => item.getAttribute("aria-disabled") !== "true"
    );
    const value = item?.getAttribute(VALUE_ATTR);
    store.setState("value", value ?? "");
  }

  /** Filters the current items. */
  function filterItems() {
    if (
      !state.current.search ||
      // Explicitly false, because true | undefined is the default
      propsRef.current.shouldFilter === false
    ) {
      state.current.filtered.count = allItems.current.size;
      // Do nothing, each item will know to show itself because search is empty
      return;
    }

    // Reset the groups
    state.current.filtered.groups = new Set();
    let itemCount = 0;

    // Check which items should be included
    for (const id of allItems.current) {
      const value = ids.current.get(id)?.value ?? "";
      const keywords = ids.current.get(id)?.keywords ?? [];
      const rank = score(value, keywords);
      state.current.filtered.items.set(id, rank);
      if (rank > 0) {
        itemCount++;
      }
    }

    // Check which groups have at least 1 item shown
    for (const [groupId, group] of allGroups.current) {
      for (const itemId of group) {
        if (state.current.filtered.items.get(itemId) ?? 0 > 0) {
          state.current.filtered.groups.add(groupId);
          break;
        }
      }
    }

    state.current.filtered.count = itemCount;
  }

  function scrollSelectedIntoView() {
    const item = getSelectedItem();

    if (item) {
      if (item.parentElement?.firstChild === item) {
        // First item in Group, ensure heading is in view
        item
          .closest(GROUP_SELECTOR)
          ?.querySelector(GROUP_HEADING_SELECTOR)
          ?.scrollIntoView({
            block:
              ScrollLogicalPositionSchema.safeParse(
                item.getAttribute("data-scroll-logical-position")
              ).data ?? "nearest",
          });

        // Ensure the item is always in view under the heading
        item.scrollIntoView({
          block:
            ScrollLogicalPositionSchema.safeParse(
              item.getAttribute("data-scroll-logical-position")
            ).data ?? "nearest",
        });
      } else {
        // Ensure the item is always in view
        item.scrollIntoView({
          block:
            ScrollLogicalPositionSchema.safeParse(
              item.getAttribute("data-scroll-logical-position")
            ).data ?? "nearest",
        });
      }
    }
  }

  /** Getters */

  function getSelectedItem() {
    return listInnerRef.current?.querySelector(
      `${ITEM_SELECTOR}[aria-selected="true"]`
    );
  }

  function getValidItems() {
    return Array.from(
      listInnerRef.current?.querySelectorAll(VALID_ITEM_SELECTOR) || []
    );
  }

  /** Setters */

  function updateSelectedToIndex(index: number) {
    const items = getValidItems();
    const item = items[index];
    if (item) {
      store.setState("value", item.getAttribute(VALUE_ATTR) ?? "");
    }
  }

  function updateSelectedByItem(change: 1 | -1) {
    const selected = getSelectedItem();
    const items = getValidItems();
    const index = items.findIndex((item) => item === selected);

    // Get item at this index
    let newSelected = items[index + change];

    if (propsRef.current?.loop) {
      newSelected =
        index + change < 0
          ? items[items.length - 1]
          : index + change === items.length
            ? items[0]
            : items[index + change];
    }

    if (newSelected) {
      store.setState("value", newSelected.getAttribute(VALUE_ATTR) ?? "");
    }
  }

  function updateSelectedByGroup(change: 1 | -1) {
    const selected = getSelectedItem();
    let group = selected?.closest(GROUP_SELECTOR);
    let item: HTMLElement | null | undefined;

    while (group && !item) {
      group =
        change > 0
          ? findNextSibling(group, GROUP_SELECTOR)
          : findPreviousSibling(group, GROUP_SELECTOR);
      item = group?.querySelector(VALID_ITEM_SELECTOR);
    }

    if (item) {
      store.setState("value", item.getAttribute(VALUE_ATTR) ?? "");
    } else {
      updateSelectedByItem(change);
    }
  }

  const last = () => updateSelectedToIndex(getValidItems().length - 1);

  const next = (e: KeyboardEvent) => {
    e.preventDefault();

    if (e.metaKey) {
      // Last item
      last();
    } else if (e.altKey) {
      // Next group
      updateSelectedByGroup(1);
    } else {
      // Next item
      updateSelectedByItem(1);
    }
  };

  const prev = (e: KeyboardEvent) => {
    e.preventDefault();

    if (e.metaKey) {
      // First item
      updateSelectedToIndex(0);
    } else if (e.altKey) {
      // Previous group
      updateSelectedByGroup(-1);
    } else {
      // Previous item
      updateSelectedByItem(-1);
    }
  };

  return (
    <Primitive.div
      ref={forwardedRef}
      tabIndex={-1}
      {...etc}
      data-cmdk-root=""
      onKeyDown={(e) => {
        etc.onKeyDown?.(e);

        if (!e.defaultPrevented) {
          switch (e.key) {
            case "n":
            case "j": {
              // vim keybind down
              if (vimBindings && e.ctrlKey) {
                next(e);
              }
              break;
            }
            case "ArrowDown": {
              next(e);
              break;
            }
            case "p":
            case "k": {
              // vim keybind up
              if (vimBindings && e.ctrlKey) {
                prev(e);
              }
              break;
            }
            case "ArrowUp": {
              prev(e);
              break;
            }
            case "Home": {
              // First item
              e.preventDefault();
              updateSelectedToIndex(0);
              break;
            }
            case "End": {
              // Last item
              e.preventDefault();
              last();
              break;
            }
            case "Enter": {
              // Check if IME composition is finished before triggering onSelect
              // This prevents unwanted triggering while user is still inputting text with IME
              // e.keyCode === 229 is for the Japanese IME and Safari.
              // isComposing does not work with Japanese IME and Safari combination.
              // eslint-disable-next-line deprecation/deprecation
              if (!e.nativeEvent.isComposing && e.keyCode !== 229) {
                // Trigger item onSelect
                e.preventDefault();
                const item = getSelectedItem();
                if (item) {
                  const event = new Event(SELECT_EVENT);
                  item.dispatchEvent(event);
                }
              }
            }
          }
        }
      }}
    >
      <label
        data-cmdk-label=""
        htmlFor={context.inputId}
        id={context.labelId}
        // Screen reader only
        style={srOnlyStyles}
      >
        {label}
      </label>
      {SlottableWithNestedChildren(props, (child) => (
        <StoreContext.Provider value={store}>
          <CommandContext.Provider value={context}>
            {child}
          </CommandContext.Provider>
        </StoreContext.Provider>
      ))}
    </Primitive.div>
  );
});

Root.displayName = "CommandRoot";

/**
 * Command menu item. Becomes active on pointer enter or through keyboard navigation.
 * Preferably pass a `value`, otherwise the value will be inferred from `children` or
 * the rendered item's `textContent`.
 */
const Item = forwardRef<HTMLDivElement, ItemProps>((props, forwardedRef) => {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const groupContext = useContext(GroupContext);
  const context = useCommand();
  const propsRef = useAsRef(props);
  const forceMount = propsRef.current?.forceMount ?? groupContext?.forceMount;

  useIsomorphicLayoutEffect(() => {
    if (!forceMount) {
      return context.item(id, groupContext?.id);
    }
    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceMount]);

  const value = useValue(
    id,
    ref,
    [props.value, props.children, ref],
    props.keywords
  );

  const store = useStore();
  const selected = useCmdk(
    (state) => state.value && state.value === value.current
  );
  const render = useCmdk((state) =>
    forceMount
      ? true
      : context.filter() === false
        ? true
        : !state.search
          ? true
          : (state.filtered.items.get(id) ?? 0 > 0)
  );

  useEffect(() => {
    const element = ref.current;
    if (!element || props.disabled) {
      return;
    }
    element.addEventListener(SELECT_EVENT, onSelect);
    return () => element.removeEventListener(SELECT_EVENT, onSelect);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [render, props.onSelect, props.disabled]);

  function onSelect() {
    select();
    propsRef.current.onSelect?.(value.current ?? "");
  }

  function select() {
    store.setState("value", value.current ?? "", true);
  }

  if (!render) {
    return null;
  }

  const {
    disabled,
    value: _,
    onSelect: __,
    forceMount: ___,
    keywords: ____,
    scrollLogicalPosition,
    ...etc
  } = props;

  return (
    <Primitive.div
      ref={mergeRefs([ref, forwardedRef])}
      {...etc}
      id={id}
      data-cmdk-item=""
      role="option"
      aria-disabled={Boolean(disabled)}
      aria-selected={Boolean(selected)}
      data-disabled={Boolean(disabled)}
      data-selected={Boolean(selected)}
      data-scroll-logical-position={scrollLogicalPosition}
      onPointerMove={
        disabled || context.getDisablePointerSelection() ? undefined : select
      }
      onClick={disabled ? undefined : onSelect}
    >
      {props.children}
    </Primitive.div>
  );
});

Item.displayName = "CommandItem";

/**
 * Group command menu items together with a heading.
 * Grouped items are always shown together.
 */
const Group = forwardRef<HTMLDivElement, GroupProps>((props, forwardedRef) => {
  const { heading, children, forceMount, ...etc } = props;
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const headingId = useId();
  const context = useCommand();
  const render = useCmdk((state) =>
    forceMount
      ? true
      : context.filter() === false
        ? true
        : !state.search
          ? true
          : state.filtered.groups.has(id)
  );

  useIsomorphicLayoutEffect(() => {
    return context.group(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useValue(id, ref, [props.value, props.heading, headingRef]);

  const contextValue = useMemo(() => ({ id, forceMount }), [forceMount, id]);

  return (
    <Primitive.div
      ref={mergeRefs([ref, forwardedRef])}
      {...etc}
      data-cmdk-group=""
      role="presentation"
      hidden={render ? undefined : true}
    >
      {heading && (
        <div
          ref={headingRef}
          data-cmdk-group-heading=""
          aria-hidden
          id={headingId}
        >
          {heading}
        </div>
      )}
      {SlottableWithNestedChildren(props, (child) => (
        <div
          data-cmdk-group-items=""
          role="group"
          aria-labelledby={heading ? headingId : undefined}
        >
          <GroupContext.Provider value={contextValue}>
            {child}
          </GroupContext.Provider>
        </div>
      ))}
    </Primitive.div>
  );
});

Group.displayName = "CommandGroup";

/**
 * A visual and semantic separator between items or groups.
 * Visible when the search query is empty or `alwaysRender` is true, hidden otherwise.
 */
const Separator = forwardRef<HTMLDivElement, SeparatorProps>(
  (props, forwardedRef) => {
    const { alwaysRender, ...etc } = props;
    const ref = useRef<HTMLDivElement>(null);
    const render = useCmdk((state) => !state.search);

    if (!alwaysRender && !render) {
      return null;
    }
    return (
      <Primitive.div
        ref={mergeRefs([ref, forwardedRef])}
        {...etc}
        data-cmdk-separator=""
        role="separator"
      />
    );
  }
);

Separator.displayName = "CommandSeparator";

/**
 * Command menu input.
 * All props are forwarded to the underyling `input` element.
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  (props, forwardedRef) => {
    const { onValueChange, ...etc } = props;
    const isControlled = props.value != null;
    const store = useStore();
    const search = useCmdk((state) => state.search);
    const value = useCmdk((state) => state.value);
    const context = useCommand();

    const selectedItemId = useMemo(() => {
      const item = context.listInnerRef.current?.querySelector(
        `${ITEM_SELECTOR}[${VALUE_ATTR}="${encodeURIComponent(value)}"]`
      );
      return item?.getAttribute("id");
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    useEffect(() => {
      if (props.value != null) {
        store.setState("search", props.value);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.value]);

    return (
      <Primitive.input
        ref={forwardedRef}
        {...etc}
        data-cmdk-input=""
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        aria-autocomplete="list"
        role="combobox"
        aria-expanded={true}
        aria-controls={context.listId}
        aria-labelledby={context.labelId}
        aria-activedescendant={selectedItemId ?? undefined}
        id={context.inputId}
        type="text"
        value={isControlled ? props.value : search}
        onChange={(e) => {
          if (!isControlled) {
            store.setState("search", e.target.value);
          }

          onValueChange?.(e.target.value);
        }}
      />
    );
  }
);

Input.displayName = "CommandInput";

/**
 * Contains `Item`, `Group`, and `Separator`.
 * Use the `--cmdk-list-height` CSS variable to animate height based on the number of results.
 */
const List = forwardRef<HTMLDivElement, ListProps>((props, forwardedRef) => {
  const { children, label = "Suggestions", ...etc } = props;
  const ref = useRef<HTMLDivElement>(null);
  const height = useRef<HTMLDivElement>(null);
  const context = useCommand();

  useEffect(() => {
    if (height.current && ref.current) {
      const el = height.current;
      const wrapper = ref.current;
      let animationFrame: number;
      const observer = new ResizeObserver(() => {
        animationFrame = requestAnimationFrame(() => {
          const height = el.offsetHeight;
          wrapper.style.setProperty(
            "--cmdk-list-height",
            height.toFixed(1) + "px"
          );
        });
      });
      observer.observe(el);
      return () => {
        cancelAnimationFrame(animationFrame);
        observer.unobserve(el);
      };
    }
    return;
  }, []);

  return (
    <Primitive.div
      ref={mergeRefs([ref, forwardedRef])}
      {...etc}
      data-cmdk-list=""
      role="listbox"
      aria-label={label}
      id={context.listId}
    >
      {SlottableWithNestedChildren(props, (child) => (
        <div
          ref={mergeRefs([height, context.listInnerRef])}
          data-cmdk-list-sizer=""
        >
          {child}
        </div>
      ))}
    </Primitive.div>
  );
});

List.displayName = "CommandList";

/**
 * Renders the command menu in a Radix Dialog.
 */
const Dialog = forwardRef<HTMLDivElement, DialogProps>(
  (props, forwardedRef) => {
    const {
      open,
      onOpenChange,
      overlayClassName,
      contentClassName,
      container,
      ...etc
    } = props;
    return (
      <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
        <RadixDialog.Portal container={container}>
          <RadixDialog.Overlay
            data-cmdk-overlay=""
            className={overlayClassName}
          />
          <RadixDialog.Content
            aria-label={props.label}
            data-cmdk-dialog=""
            className={contentClassName}
          >
            <Root ref={forwardedRef} {...etc} />
          </RadixDialog.Content>
        </RadixDialog.Portal>
      </RadixDialog.Root>
    );
  }
);

Dialog.displayName = "CommandDialog";

/**
 * Automatically renders when there are no results for the search query.
 */
const Empty = forwardRef<HTMLDivElement, EmptyProps>((props, forwardedRef) => {
  const render = useCmdk((state) => state.filtered.count === 0);

  if (!render) {
    return null;
  }
  return (
    <Primitive.div
      ref={forwardedRef}
      {...props}
      data-cmdk-empty=""
      role="presentation"
    />
  );
});

Empty.displayName = "CommandEmpty";

/**
 * You should conditionally render this with `progress` while loading asynchronous items.
 */
const Loading = forwardRef<HTMLDivElement, LoadingProps>(
  (props, forwardedRef) => {
    const { progress, children, label = "Loading...", ...etc } = props;

    return (
      <Primitive.div
        ref={forwardedRef}
        {...etc}
        data-cmdk-loading=""
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        {SlottableWithNestedChildren(props, (child) => (
          <div aria-hidden>{child}</div>
        ))}
      </Primitive.div>
    );
  }
);

Loading.displayName = "CommandLoading";

export {
  Dialog,
  Empty,
  Group,
  Input,
  Item,
  List,
  Loading,
  Root,
  SELECT_EVENT,
  Separator,
  defaultFilter,
  useCmdk as useCommandState,
};

/**
 *
 *
 * Helpers
 *
 *
 */

function findNextSibling(el: Element, selector: string) {
  let sibling = el.nextElementSibling;

  while (sibling) {
    if (sibling.matches(selector)) {
      return sibling;
    }
    sibling = sibling.nextElementSibling;
  }
  return;
}

function findPreviousSibling(el: Element, selector: string) {
  let sibling = el.previousElementSibling;

  while (sibling) {
    if (sibling.matches(selector)) {
      return sibling;
    }
    sibling = sibling.previousElementSibling;
  }
  return;
}

function useAsRef<T>(data: T) {
  const ref = useRef<T>(data);

  useIsomorphicLayoutEffect(() => {
    ref.current = data;
  });

  return ref;
}

function useLazyRef<T>(fn: () => T) {
  const ref = useRef<T>();

  if (ref.current === undefined) {
    ref.current = fn();
  }

  return ref as MutableRefObject<T>;
}

// ESM is still a nightmare with Next.js so I'm just gonna copy the package code in
// https://github.com/gregberge/react-merge-refs
// Copyright (c) 2020 Greg Bergé
function mergeRefs<T = any>(
  refs: Array<MutableRefObject<T> | LegacyRef<T>>
): RefCallback<T> {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref != null) {
        (ref as MutableRefObject<T | null>).current = value;
      }
    });
  };
}

/** Run a selector against the store state. */
function useCmdk<T = any>(selector: (state: State) => T): T {
  const store = useStore();
  const cb = () => selector(store.snapshot());
  return useSyncExternalStore(store.subscribe, cb, cb);
}

function useValue(
  id: string,
  ref: RefObject<HTMLElement>,
  deps: (string | ReactNode | RefObject<HTMLElement>)[],
  aliases: string[] = []
) {
  const valueRef = useRef<string>();
  const context = useCommand();

  useIsomorphicLayoutEffect(() => {
    const value = (() => {
      for (const part of deps) {
        if (typeof part === "string") {
          return part.trim();
        }

        if (typeof part === "object" && part != null && "current" in part) {
          if (part.current) {
            return part.current.textContent?.trim();
          }
          return valueRef.current;
        }
      }
      return;
    })();

    const keywords = aliases.map((alias) => alias.trim());

    context.value(id, value ?? "", keywords);
    ref.current?.setAttribute(VALUE_ATTR, value ?? "");
    valueRef.current = value;
  });

  return valueRef;
}

/** Imperatively run a function on the next layout effect cycle. */
const useScheduleLayoutEffect = () => {
  const [s, ss] = useState<object>();
  const fns = useLazyRef(() => new Map<string | number, () => void>());

  useIsomorphicLayoutEffect(() => {
    fns.current.forEach((f) => f());
    fns.current = new Map();
  }, [s]);

  return (id: string | number, cb: () => void) => {
    fns.current.set(id, cb);
    ss({});
  };
};

function renderChildren(children: ReactElement) {
  const childrenType = children.type as any;
  // The children is a component
  if (typeof childrenType === "function") {
    return childrenType(children.props);
  }
  // The children is a component with `forwardRef`
  else if ("render" in childrenType) {
    return childrenType.render(children.props);
  }
  // It's a string, boolean, etc.
  else {
    return children;
  }
}

function SlottableWithNestedChildren(
  { asChild, children }: { asChild?: boolean; children?: ReactNode },
  render: (child: ReactNode) => ReactElement
) {
  if (asChild && isValidElement(children)) {
    return cloneElement(
      renderChildren(children),
      { ref: (children as any).ref },
      render(children.props.children)
    );
  }
  return render(children);
}

const srOnlyStyles = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: "0",
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  borderWidth: "0",
} as const;
