import { ChevronDownIcon } from "@heroicons/react/24/outline";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { FernIcon } from "../../theme/FernIcon";
import { FooterExternalLink } from "./FooterExternalLink";
import { FooterText } from "./FooterText";

export function Footer() {
  return (
    <div className="hidden items-center gap-6 sm:flex">
      <FernIcon className="w-4" />
      <FooterText>/</FooterText>
      <FooterExternalLink href="https://buildwithfern.com">
        Home
      </FooterExternalLink>
      <FooterExternalLink href="https://buildwithfern.com/learn">
        Docs
      </FooterExternalLink>
      <FooterExternalLink href="https://jobs.ashbyhq.com/buildwithfern">
        Careers
      </FooterExternalLink>
      <FooterExternalLink href="https://buildwithfern.com/book-a-demo/demo">
        Contact
      </FooterExternalLink>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <FooterText hoverable>
            <div className="flex cursor-pointer items-center gap-1">
              <div>Legal</div>
              <ChevronDownIcon className="mt-0.5 size-3" />
            </div>
          </FooterText>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem asChild>
            <a
              href="https://buildwithfern.com/privacy-policy"
              target="_blank"
              className="cursor-pointer"
            >
              Privacy Policy
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a
              href="https://buildwithfern.com/terms-of-service"
              target="_blank"
              className="cursor-pointer"
            >
              Terms of Service
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
