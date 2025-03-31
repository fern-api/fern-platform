import Image from "next/image";

import { SessionData } from "@auth0/nextjs-auth0/types";
import { UserIcon } from "@heroicons/react/24/outline";
import { PopoverArrow } from "@radix-ui/react-popover";

import { Auth0OrgID } from "@/app/services/auth0/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { LogoutButton } from "../auth/LogoutButton";
import { OrgSwitcher } from "../auth/OrgSwitcher";
import { ThemedFernLogo } from "../theme/ThemedFernLogo";
import { Button } from "../ui/button";
import { DocsSiteSwitcher } from "./DocsSiteSwitcher";

export declare namespace Header {
  export interface Props {
    session: SessionData;
  }
}

export async function Header({ session }: Header.Props) {
  const { name, email, picture, org_id } = session.user;
  const orgId = org_id != null ? Auth0OrgID(org_id) : undefined;

  return (
    <div className="flex justify-between p-4">
      <div className="flex items-center gap-4">
        <ThemedFernLogo className="w-16" />
        <OrgSwitcher currentOrgId={orgId} />
        <div className="flex md:hidden">
          <DocsSiteSwitcher />
        </div>
      </div>
      <div className="flex gap-4">
        <div className="hidden items-center gap-2 md:flex">
          <Button size="sm" variant="outline">
            Feedback
          </Button>
          <Button size="sm" variant="ghost">
            Docs
          </Button>
          <Button size="sm" variant="ghost">
            Changelog
          </Button>
        </div>
        <Popover>
          <PopoverTrigger className="cursor-pointer">
            {picture != null ? (
              <Image
                src={picture}
                alt={name ?? "user photo"}
                className="rounded-full"
                width={32}
                height={32}
              />
            ) : (
              <div className="bg-gray-1200 size-8 rounded-full border border-gray-500 p-1">
                <UserIcon className="size-full text-white" />
              </div>
            )}
          </PopoverTrigger>
          <PopoverContent collisionPadding={8}>
            <PopoverArrow className="fill-white" />
            <div className="flex flex-col gap-4">
              <div className="text-gray-1000 flex flex-col text-xs">
                <div>{name}</div>
                <div>{email}</div>
              </div>
              <LogoutButton />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
