import { Badge } from "@fern-docs/components/badges";
import { Button } from "@fern-docs/components/button";
import { useDebouncedCallback, useEventCallback } from "@fern-ui/react-commons";
import { composeEventHandlers } from "@radix-ui/primitive";
import { composeRefs } from "@radix-ui/react-compose-refs";
import { TooltipPortal, TooltipProvider } from "@radix-ui/react-tooltip";
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { Message, useChat } from "ai/react";
import { atom, useAtom, useAtomValue } from "jotai";
import {
  ArrowLeft,
  ArrowUp,
  Sparkles,
  SquarePen,
  StopCircle,
} from "lucide-react";
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
import { useIsomorphicLayoutEffect } from "swr/_internal";

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
import { CommandLink } from "../shared/command-link";
import tunnel from "../tunnel-rat";
import { cn } from "../ui/cn";
import { TextArea } from "../ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { DesktopCommandContent, afterInput } from "./desktop-command";
import { DesktopCommandInput } from "./desktop-command-input";
import { DesktopCommandRoot } from "./desktop-command-root";
import { Suggestions } from "./suggestions";

const headerActions = tunnel();

export const DesktopCommandWithAskAI = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof DesktopCommandRoot> & {
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
      ...props
    },
    ref
  ) => {
    const [askAI, setAskAI] = useControllableState<boolean>({
      defaultProp: defaultAskAI,
      prop: askAIProp,
      onChange: setAskAIProp,
    });
    const { filters, handlePopState: handlePopFilters } = useFacetFilters();

    return (
      <DesktopCommandRoot
        label={askAI ? "Ask AI" : "Search"}
        {...props}
        ref={ref}
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
      >
        {askAI ? (
          <DesktopAskAIContent
            api={api}
            suggestionsApi={suggestionsApi}
            body={body}
            headers={headers}
            onReturnToSearch={() => setAskAI(false)}
            initialInput={initialInput}
            chatId={chatId}
            onSelectHit={onSelectHit}
            prefetch={prefetch}
            composerActions={composerActions}
            domain={domain}
            renderActions={renderActions}
          />
        ) : (
          <DesktopCommandContent>{children}</DesktopCommandContent>
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
  headers?: Record<string, string>;
  onSelectHit?: (path: string) => void;
  prefetch?: (path: string) => Promise<void>;
  composerActions?: ReactNode;
  domain: string;
  renderActions?: (message: SqueezedMessage) => ReactNode;
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
  headers,
  onSelectHit,
  prefetch,
  composerActions,
  domain,
  renderActions,
}: {
  onReturnToSearch?: () => void;
  initialInput?: string;
  chatId?: string;
  api?: string;
  suggestionsApi?: string;
  body?: object;
  headers?: Record<string, string>;
  onSelectHit?: (path: string) => void;
  prefetch?: (path: string) => Promise<void>;
  composerActions?: ReactNode;
  domain: string;
  renderActions?: (message: SqueezedMessage) => ReactNode;
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
      void chat.append({ role: "user", content: message });
      chat.setInput("");
    },

    [chat.append, chat.setInput],
    1000,
    { edges: ["leading"] }
  );

  useEffect(() => {
    if (initialInput) {
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
            () => ({
              pre(props) {
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
                      />
                    );
                  }
                }
                return <pre {...props} />;
              },

              a: ({ children, node, ...props }) => (
                <a
                  {...props}
                  className="font-semibold decoration-[var(--accent-a10)] hover:text-[var(--accent-a10)] hover:decoration-2"
                  target="_blank"
                  rel="noreferrer"
                >
                  {children}
                </a>
              ),
            }),
            []
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
        className="cursor-text border-t border-[var(--grayscale-a6)]"
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
        <div className="flex items-center justify-between px-2 pb-2">
          <div>{actions}</div>
          <Button
            size="icon"
            className="rounded-full"
            variant="ghost"
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
    components,
    userScrolled = true,
    isLoading,
    children,
    prefetch,
    domain,
    renderActions,
  }): ReactElement => {
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
                  onSelect={() => {
                    const content = message.assistant?.content;
                    if (content) {
                      void navigator.clipboard.writeText(content);
                    }
                  }}
                  asChild
                  scrollLogicalPosition="start"
                >
                  <article>
                    <div className="relative mb-2 ml-auto w-fit max-w-[70%] whitespace-pre-wrap rounded-3xl bg-[var(--grayscale-a3)] px-5 py-2">
                      <section className="prose prose-sm dark:prose-invert cursor-auto">
                        <MarkdownContent components={components}>
                          {message.user?.content ?? "_No user message_"}
                        </MarkdownContent>
                      </section>
                    </div>
                    <div className="flex items-start justify-start gap-4">
                      <Sparkles className="my-1 size-4 shrink-0" />
                      <section className="prose prose-sm dark:prose-invert flex-1 shrink cursor-text">
                        {message.assistant?.content && (
                          <MarkdownContent
                            components={{
                              ...components,
                              sup: FootnoteSup,
                              section: ({ children, node, ...props }) => {
                                if (node?.properties.dataFootnotes) {
                                  return (
                                    <FootnotesSection
                                      node={node}
                                      searchResults={searchResults}
                                      className="hidden"
                                    />
                                  );
                                }

                                if (components?.section) {
                                  return createElement(
                                    components.section,
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
                            <p className="text-[var(--grayscale-a10)]">
                              Thinking...
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
          <Badge rounded>{String(idx + 1)}</Badge>
          <div>
            <div className="text-sm font-semibold">{footnote.title}</div>
            <div className="text-xs text-[var(--grayscale-a9)]">
              {footnote.url}
            </div>
          </div>
        </CommandLink>
      ))}
    </>
  );
}
