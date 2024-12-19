import {
  ComponentPropsWithoutRef,
  ReactElement,
  ReactNode,
  createContext,
  forwardRef,
  useContext,
} from "react";
import { Anthropic } from "../icons/anthropic";
import { Cohere } from "../icons/cohere";
import { OpenAI } from "../icons/openai";
import { cn } from "../ui/cn";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface ChatbotModel {
  provider: "anthropic" | "openai" | "cohere";
  model: string;
  displayName: string;
}

export const CHATBOT_MODELS: ChatbotModel[] = [
  {
    provider: "anthropic",
    model: "claude-3-5-haiku",
    displayName: "Claude 3.5 Haiku",
  },
  {
    provider: "anthropic",
    model: "claude-3-5-sonnet",
    displayName: "Claude 3.5 Sonnet",
  },
  {
    provider: "openai",
    model: "gpt-4o-mini",
    displayName: "GPT-4o Mini",
  },
  {
    provider: "openai",
    model: "gpt-4o",
    displayName: "GPT-4o",
  },
  {
    provider: "cohere",
    model: "command-r-plus",
    displayName: "Cohere Command R+",
  },
  {
    provider: "cohere",
    model: "command-r",
    displayName: "Cohere Command R",
  },
];

const ChatbotModelContext = createContext<ChatbotModel[]>(CHATBOT_MODELS);

export function ChatbotModelProvider({
  children,
  models,
}: {
  children: ReactNode;
  models: ChatbotModel[];
}): ReactElement {
  return (
    <ChatbotModelContext.Provider value={models}>
      {children}
    </ChatbotModelContext.Provider>
  );
}

export function useChatbotModels(): ChatbotModel[] {
  return useContext(ChatbotModelContext);
}

export const ChatbotModelSelect = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<"button"> & {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    disabled?: boolean;
    required?: boolean;
    onCloseAutoFocus?: ComponentPropsWithoutRef<
      typeof SelectContent
    >["onCloseAutoFocus"];
  }
>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      open,
      defaultOpen,
      onOpenChange,
      disabled,
      required,
      onCloseAutoFocus,
      ...props
    },
    ref
  ) => {
    const models = useChatbotModels();
    return (
      <Select
        name="model"
        defaultValue={defaultValue ?? models[0]?.model}
        value={value}
        onValueChange={onValueChange}
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        disabled={disabled}
        required={required}
      >
        <SelectTrigger
          ref={ref}
          {...props}
          className={cn("rounded-full shadow-none", props.className)}
        >
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent onCloseAutoFocus={onCloseAutoFocus}>
          <SelectGroup>
            {models.map(({ provider, model, displayName }) => (
              <SelectItem key={model} value={model}>
                <Icon provider={provider} /> {displayName}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    );
  }
);

ChatbotModelSelect.displayName = "ChatbotModelSelect";

function Icon({ provider }: { provider: "anthropic" | "openai" | "cohere" }) {
  if (provider === "anthropic") {
    return <Anthropic />;
  }
  if (provider === "openai") {
    return <OpenAI />;
  }
  if (provider === "cohere") {
    return <Cohere />;
  }
  return null;
}
