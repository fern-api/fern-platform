"use client";

import {
  ComponentPropsWithoutRef,
  KeyboardEventHandler,
  ReactElement,
  ReactNode,
  createElement,
  forwardRef,
  isValidElement,
  memo,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Components } from "react-markdown";

import { composeEventHandlers } from "@radix-ui/primitive";
import { composeRefs } from "@radix-ui/react-compose-refs";
import { TooltipPortal, TooltipProvider } from "@radix-ui/react-tooltip";
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { Message, useChat } from "ai/react";
import type { Element as HastElement } from "hast";
import { atom, useAtom, useAtomValue } from "jotai";
import {
  ArrowLeft,
  ArrowUp,
  Sparkles,
  SquarePen,
  StopCircle,
} from "lucide-react";
import { useIsomorphicLayoutEffect } from "swr/_internal";

import { cn } from "@fern-docs/components";
import { Badge } from "@fern-docs/components/badges";
import { Button } from "@fern-docs/components/button";
import {
  tunnel,
  useDebouncedCallback,
  useEventCallback,
  useIsMobile,
} from "@fern-ui/react-commons";

import { FacetFilter } from "@/types";

import { FootnoteSup, FootnotesSection } from "../chatbot/footnote";
import {
  ChatbotTurnContextProvider,
  useChatbotTurnContext,
} from "../chatbot/turn-context";
import {
  SqueezedMessage,
  combineSearchResults,
  squeezeMessages,
} from "../chatbot/utils";
import * as Command from "../cmdk";
import { CodeBlock } from "../code-block";
import { MarkdownContent } from "../md-content";
import { useFacetFilters } from "../search-client";
import { CommandAskAIGroup } from "../shared";
import { CommandLink } from "../shared/command-link";
import { TextArea } from "../ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { DesktopCommandContent, afterInput } from "./desktop-command";
import { DesktopCommandInput } from "./desktop-command-input";
import { DesktopCommandRoot } from "./desktop-command-root";
import { Suggestions } from "./suggestions";

type PropsWithElement<T> = T & { node: HastElement };

const headerActions = tunnel();

export const DesktopCommandWithAskAI = forwardRef<
  HTMLDivElement,
  Omit<ComponentPropsWithoutRef<typeof DesktopCommandRoot>, "children"> & {
    askAI?: boolean;
    defaultAskAI?: boolean;
    setAskAI?: (askAI: boolean) => void;
    api?: string;
    suggestionsApi?: string;
    body?: object;
    headers?: Record<string, string>;
    initialInput?: string;
    chatId?: string;
    onSelectHit?: (path: string) => void;
    prefetch?: (path: string) => Promise<void>;
    composerActions?: ReactNode;
    domain: string;
    renderActions?: (message: SqueezedMessage) => ReactNode;
    setInitialInput?: (initialInput: string) => void;
    children?: ReactNode;
    darkCodeEnabled?: boolean;
  }
>(
  (
    {
      children,
      api,
      suggestionsApi,
      body,
      headers,
      askAI: askAIProp,
      setAskAI: setAskAIProp,
      defaultAskAI,
      initialInput,
      chatId,
      onSelectHit,
      prefetch,
      composerActions,
      domain,
      renderActions,
      setInitialInput,
      asChild,
      darkCodeEnabled,
      ...props
    },
    forwardedRef
  ) => {
    const isMobile = useIsMobile();
    const ref = useRef<HTMLDivElement>(null);

    const [askAI, setAskAI] = useControllableState<boolean>({
      defaultProp: defaultAskAI,
      prop: askAIProp,
      onChange: setAskAIProp,
    });
    const { filters, handlePopState: handlePopFilters } = useFacetFilters();

    function glow() {
      if (ref.current) {
        const prefix = isMobile ? "inset " : "";
        ref.current.animate(
          {
            boxShadow: [
              `${prefix}0 0 0px var(--accent-a5), var(--cmdk-shadow)`,
              `${prefix}0 0 75px var(--accent-a5), var(--cmdk-shadow)`,
              `${prefix}0 0 150px transparent, var(--cmdk-shadow)`,
            ],
          },
          { duration: 800, easing: "ease-out" }
        );
      }
    }

    // animate on presence
    useEffect(() => {
      if (ref.current) {
        ref.current.animate(
          { transform: ["scale(0.96)", "scale(1)"] },
          { duration: 100, easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)" }
        );

        if (askAI) {
          glow();
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // bounce on action
    function bounce() {
      if (ref.current && !isMobile) {
        ref.current.animate(
          { transform: ["scale(1)", "scale(0.96)", "scale(1)"] },
          { duration: 200, easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)" }
        );
      }
    }

    return (
      <DesktopCommandRoot
        label={askAI ? "Ask AI" : "Search"}
        {...props}
        ref={composeRefs(forwardedRef, ref)}
        shouldFilter={!askAI}
        disableAutoSelection={askAI}
        onPopState={
          askAI
            ? props.onPopState
            : composeEventHandlers(props.onPopState, handlePopFilters, {
                checkForDefaultPrevented: false,
              })
        }
        onEscapeKeyDown={props.onEscapeKeyDown}
        escapeKeyShouldPopState={!askAI && filters.length > 0}
        data-mode={askAI ? "ask-ai" : "search"}
      >
        {askAI ? (
          <DesktopAskAIContent
            api={api}
            suggestionsApi={suggestionsApi}
            body={body}
            headers={headers}
            filters={filters}
            onReturnToSearch={() => {
              setAskAI(false);
              bounce();
            }}
            initialInput={initialInput}
            chatId={chatId}
            onSelectHit={onSelectHit}
            prefetch={prefetch}
            composerActions={composerActions}
            domain={domain}
            renderActions={renderActions}
            darkCodeEnabled={darkCodeEnabled}
          />
        ) : (
          <DesktopCommandContent asChild={asChild}>
            <CommandAskAIGroup
              onAskAI={(initialInput) => {
                setInitialInput?.(initialInput);
                setAskAI(true);
                bounce();
                glow();
              }}
              forceMount
            />
            {children}
          </DesktopCommandContent>
        )}
      </DesktopCommandRoot>
    );
  }
);

DesktopCommandWithAskAI.displayName = "DesktopCommandWithAskAI";

const DesktopAskAIContent = (props: {
  onReturnToSearch?: () => void;
  initialInput?: string;
  chatId?: string;
  api?: string;
  suggestionsApi?: string;
  body?: object;
  filters?: readonly FacetFilter[];
  headers?: Record<string, string>;
  onSelectHit?: (path: string) => void;
  prefetch?: (path: string) => Promise<void>;
  composerActions?: ReactNode;
  domain: string;
  renderActions?: (message: SqueezedMessage) => ReactNode;
  darkCodeEnabled?: boolean;
}) => {
  return (
    <>
      <div className="flex items-center justify-between p-2 pb-0">
        <div>
          {props.onReturnToSearch && (
            <Button
              size="xs"
              variant="outline"
              onClick={props.onReturnToSearch}
            >
              <ArrowLeft />
              Back to search
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <headerActions.Out />
          <afterInput.Out />
        </div>
      </div>
      <DesktopAskAIChat {...props} />
    </>
  );
};

const initialConversationAtom = atom<Message[]>([]);

const DesktopAskAIChat = ({
  onReturnToSearch,
  initialInput,
  chatId,
  api,
  suggestionsApi,
  body,
  filters,
  headers,
  onSelectHit,
  prefetch,
  composerActions,
  domain,
  renderActions,
  darkCodeEnabled,
}: {
  onReturnToSearch?: () => void;
  initialInput?: string;
  chatId?: string;
  api?: string;
  suggestionsApi?: string;
  body?: object;
  filters?: readonly FacetFilter[];
  headers?: Record<string, string>;
  onSelectHit?: (path: string) => void;
  prefetch?: (path: string) => Promise<void>;
  composerActions?: ReactNode;
  domain: string;
  renderActions?: (message: SqueezedMessage) => ReactNode;
  darkCodeEnabled?: boolean;
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [userScrolled, setUserScrolled] = useState(false);
  const [initialConversation, setInitialConversation] = useAtom(
    initialConversationAtom
  );
  const chat = useChat({
    id: chatId,
    initialInput,
    initialMessages: initialConversation,
    api,
    body,
    headers,
    onFinish: useEventCallback(() => {
      setInitialConversation(chat.messages);
    }),
  });

  // Reset userScrolled when the chat is loading
  useIsomorphicLayoutEffect(() => {
    if (chat.isLoading) {
      setUserScrolled(false);
    }
  }, [chat.isLoading]);

  const askAI = useDebouncedCallback(
    (message: string): void => {
      if (message.trim().split(/\s+/).length < 2) {
        chat.setInput(message);
        inputRef.current?.focus();
        inputRef.current?.setSelectionRange(
          chat.input.length,
          chat.input.length
        );
        return;
      }
      void chat.append(
        { role: "user", content: message },
        {
          body: {
            url: document.location.href,
            filters,
          },
        }
      );
      chat.setInput("");
    },

    [chat.append, chat.setInput],
    1000,
    { edges: ["leading"] }
  );

  useEffect(() => {
    if (
      initialInput &&
      !chat.messages.map((m) => m.content).includes(initialInput)
    ) {
      askAI(initialInput);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [isScrolled, setIsScrolled] = useState(false);

  const messages = useDeferredValue(chat.messages);

  return (
    <>
      <Command.List
        onWheel={(e) => {
          if (e.deltaY > 0) {
            setUserScrolled(true);
          }
        }}
        onTouchMove={(e) => {
          if (
            e.touches[0]?.clientY !== e.touches[e.touches.length - 1]?.clientY
          ) {
            setUserScrolled(true);
          }
        }}
        onScroll={(e) => {
          if (e.currentTarget.scrollTop > 5) {
            setIsScrolled(true);
          } else {
            setIsScrolled(false);
          }
        }}
        tabIndex={-1}
        className={cn(isScrolled && "mask-grad-top-3")}
        data-disable-animation={chat.isLoading ? "" : undefined}
      >
        <headerActions.In>
          {chat.messages.length > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="iconXs"
                    variant="outline"
                    onClick={() => {
                      chat.setMessages([]);
                      setInitialConversation([]);
                    }}
                  >
                    <SquarePen />
                  </Button>
                </TooltipTrigger>
                <TooltipPortal>
                  <TooltipContent>
                    <p>New chat</p>
                  </TooltipContent>
                </TooltipPortal>
              </Tooltip>
            </TooltipProvider>
          )}
        </headerActions.In>

        <AskAICommandItems
          messages={messages}
          onSelectHit={onSelectHit}
          prefetch={prefetch}
          components={useMemo(
            (): Components => ({
              pre({
                node,
                ...props
              }: PropsWithElement<React.ComponentProps<"pre">>) {
                if (
                  isValidElement(props.children) &&
                  props.children.type === "code"
                ) {
                  const { children, className } = props.children.props as {
                    children: string;
                    className: string;
                  };
                  if (typeof children === "string") {
                    const match =
                      /language-(\w+)/.exec(className || "")?.[1] ??
                      "plaintext";
                    return (
                      <CodeBlock
                        code={children}
                        language={match}
                        fontSize="sm"
                        className={cn({
                          "bg-card-solid dark": darkCodeEnabled,
                        })}
                      />
                    );
                  }
                }
                return <pre {...props} />;
              },

              a: ({
                children,
                node,
                ...props
              }: PropsWithElement<React.ComponentProps<"a">>) => (
                <a
                  {...props}
                  className="decoration-(color:--accent-a10) hover:text-(color:--accent-a10) font-semibold hover:decoration-2"
                  target="_blank"
                  rel="noreferrer"
                >
                  {children}
                </a>
              ),
            }),
            [darkCodeEnabled]
          )}
          isLoading={chat.isLoading}
          userScrolled={userScrolled}
          domain={domain}
          renderActions={renderActions}
        >
          {suggestionsApi && (
            <Suggestions
              api={suggestionsApi}
              body={body}
              headers={headers}
              askAI={askAI}
            />
          )}
        </AskAICommandItems>
      </Command.List>
      <AskAIComposer
        ref={inputRef}
        value={chat.input}
        onValueChange={chat.setInput}
        isLoading={chat.isLoading}
        stop={chat.stop}
        onSend={askAI}
        onKeyDown={useEventCallback((e) => {
          if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            setUserScrolled(true);
          }
        })}
        onPopState={onReturnToSearch}
        actions={composerActions}
      />
    </>
  );
};

const AskAIComposer = forwardRef<
  HTMLTextAreaElement,
  ComponentPropsWithoutRef<typeof TextArea> & {
    isLoading?: boolean;
    stop?: () => void;
    onSend?: (message: string) => void;
    onPopState?: KeyboardEventHandler<HTMLTextAreaElement>;
    actions?: ReactNode;
  }
>(
  (
    { isLoading, stop, onSend, onPopState, actions, ...props },
    forwardedRef
  ) => {
    const value = typeof props.value === "string" ? props.value : "";
    const canSubmit = value.trim().split(/\s+/).length >= 2;
    const inputRef = useRef<HTMLTextAreaElement>(null);
    return (
      <div
        className="border-border-default cursor-text border-t p-2"
        onClick={() => inputRef.current?.focus()}
      >
        <DesktopCommandInput asChild>
          <TextArea
            ref={composeRefs(forwardedRef, inputRef)}
            autoFocus
            placeholder="Ask AI a question..."
            minLines={1}
            lineHeight={24}
            maxLines={10}
            padding={8}
            {...props}
            className={cn(
              "block w-full resize-none p-2 focus:outline-none",
              props.className
            )}
            style={{
              fontSize: "16px",
              lineHeight: "24px",
              maxHeight: 200,
              ...props.style,
            }}
            onKeyDown={composeEventHandlers(
              props.onKeyDown,
              (e) => {
                if (e.key === "Enter") {
                  if (!e.shiftKey && value.length === 0) {
                    return;
                  } else if (isLoading) {
                    stop?.();
                    e.preventDefault();
                  } else {
                    if (canSubmit) {
                      onSend?.(value);
                    }
                    e.preventDefault();
                  }

                  e.stopPropagation();
                } else if (
                  value.length > 0 &&
                  (e.key === "ArrowUp" || e.key === "ArrowDown")
                ) {
                  e.stopPropagation();
                } else if (
                  value.length === 0 &&
                  e.key === "Backspace" &&
                  (e.ctrlKey || e.metaKey)
                ) {
                  onPopState?.(e);
                }
              },
              { checkForDefaultPrevented: false }
            )}
          />
        </DesktopCommandInput>
        <div className="flex items-center justify-between">
          <div>{actions}</div>
          <Button
            size="icon"
            className="rounded-full"
            variant="default"
            onClick={isLoading ? stop : () => onSend?.(value)}
            disabled={!isLoading && !canSubmit}
          >
            {isLoading ? <StopCircle /> : <ArrowUp />}
          </Button>
        </div>
      </div>
    );
  }
);

AskAIComposer.displayName = "AskAIComposer";

const AskAICommandItems = memo<{
  messages: Message[];
  onSelectHit?: (path: string) => void;
  components?: Components;
  isLoading?: boolean;
  userScrolled?: boolean;
  children?: ReactNode;
  prefetch?: (path: string) => Promise<void>;
  domain: string;
  renderActions?: (message: SqueezedMessage) => ReactNode;
}>(
  ({
    messages,
    onSelectHit,
    components = {},
    userScrolled = true,
    isLoading,
    children,
    prefetch,
    domain,
    renderActions,
  }): ReactElement<any> => {
    const squeezedMessages = squeezeMessages(messages);

    const lastConversationRef = useRef<Element | null>(null);
    const lastConversationId =
      squeezedMessages[squeezedMessages.length - 1]?.assistant?.id ??
      squeezedMessages[squeezedMessages.length - 1]?.user?.id;
    useIsomorphicLayoutEffect(() => {
      if (
        lastConversationRef.current &&
        lastConversationRef.current.getAttribute("data-conversation-id") !==
          lastConversationId
      ) {
        lastConversationRef.current = null;
      }

      if (!lastConversationRef.current) {
        lastConversationRef.current = document.querySelector(
          `[data-conversation-id="${lastConversationId}"]`
        );
      }
    }, [lastConversationId]);

    useEffect(() => {
      if (lastConversationRef.current && isLoading && !userScrolled) {
        lastConversationRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    });

    if (squeezedMessages.length === 0) {
      return (
        <>
          <div className="flex gap-4 p-2">
            <Sparkles className="my-1 size-4 shrink-0" />
            <div className="space-y-2">
              <p>
                Hi, I&apos;m an AI assistant with access to documentation and
                other content.
              </p>
            </div>
          </div>
          {children}
        </>
      );
    }

    return (
      <>
        {squeezedMessages.map((message, idx) => {
          const isLastMessage = idx === squeezedMessages.length - 1;
          const searchResults = combineSearchResults([message]);
          return (
            <ChatbotTurnContextProvider
              key={message.user?.id ?? message.assistant?.id ?? idx}
            >
              <Command.Group>
                <Command.Item
                  data-conversation-id={
                    message.assistant?.id ?? message.user?.id
                  }
                  value={message.assistant?.id ?? message.user?.id}
                  asChild
                  scrollLogicalPosition="start"
                >
                  <article>
                    <div className="bg-(color:--grayscale-a3) rounded-6 relative mb-2 ml-auto w-fit max-w-[70%] whitespace-pre-wrap px-5 py-2">
                      <section className="prose cursor-auto text-sm">
                        <MarkdownContent components={components}>
                          {message.user?.content ?? "_No user message_"}
                        </MarkdownContent>
                      </section>
                    </div>
                    <div className="flex items-start justify-start gap-4">
                      <Sparkles className="my-1 size-4 shrink-0" />
                      <section className="prose min-w-0 flex-1 shrink cursor-text text-sm">
                        {message.assistant?.content && (
                          <MarkdownContent
                            components={{
                              ...components,
                              sup: FootnoteSup,
                              section: ({
                                children,
                                node,
                                ...props
                              }: PropsWithElement<
                                React.ComponentProps<"section">
                              >) => {
                                if (node?.properties.dataFootnotes) {
                                  return (
                                    <FootnotesSection
                                      node={node}
                                      searchResults={searchResults}
                                      className="hidden"
                                    />
                                  );
                                }

                                if ("section" in components) {
                                  return createElement(
                                    components.section as React.ComponentType<
                                      PropsWithElement<
                                        React.ComponentProps<"section">
                                      >
                                    >,
                                    {
                                      ...props,
                                      node,
                                    },
                                    children
                                  );
                                }

                                return <section {...props}>{children}</section>;
                              },
                            }}
                          >
                            {message.assistant.content}
                          </MarkdownContent>
                        )}
                        {isLoading &&
                          (!message.toolInvocations ||
                            message.toolInvocations.some(
                              (invocation) => invocation.state !== "result"
                            )) && (
                            <p className="text-(color:--grayscale-a10) thinking-dots">
                              Thinking
                            </p>
                          )}
                        {(!isLastMessage || !isLoading) &&
                          renderActions?.(message)}
                      </section>
                    </div>
                  </article>
                </Command.Item>
                <FootnoteCommands
                  onSelect={onSelectHit}
                  prefetch={prefetch}
                  domain={domain}
                />
              </Command.Group>
            </ChatbotTurnContextProvider>
          );
        })}
      </>
    );
  }
);

AskAICommandItems.displayName = "AskAICommandItems";

function FootnoteCommands({
  onSelect,
  prefetch,
  domain,
}: {
  onSelect?: (path: string) => void;
  prefetch?: (path: string) => Promise<void>;
  domain: string;
}) {
  const { footnotesAtom } = useChatbotTurnContext();
  const footnotes = useAtomValue(footnotesAtom);
  return (
    <>
      {footnotes.map((footnote, idx) => (
        <CommandLink
          key={footnote.ids.join("-")}
          href={footnote.url}
          onSelect={onSelect}
          prefetch={prefetch}
          domain={domain}
        >
          <Badge color="grayWithAccent" variant="subtleSolidHover">
            {String(idx + 1)}
          </Badge>
          <div>
            <div className="text-sm font-semibold">{footnote.title}</div>
            <div className="text-(color:--grayscale-a9) text-xs">
              {footnote.url}
            </div>
          </div>
        </CommandLink>
      ))}
    </>
  );
}

const AnimatedSparkles = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path
      className="sparkle-center"
      d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"
    />
    <g className="sparkle-outer">
      <path d="M20 3v4" />
      <path d="M22 5h-4" />
      <path d="M4 17v2" />
      <path d="M5 18H3" />
    </g>
  </svg>
);
