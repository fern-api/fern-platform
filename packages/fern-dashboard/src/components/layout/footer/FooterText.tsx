import { cn } from "@/lib/cn";

export declare namespace FooterText {
  export interface Props {
    text: string;
    className?: string;
  }
}

export const FooterText = ({ text, className }: FooterText.Props) => {
  return <div className={cn(className, "text-sm text-gray-900")}>{text}</div>;
};
