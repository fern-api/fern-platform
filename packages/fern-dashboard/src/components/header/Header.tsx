import Image from "next/image";
import { Suspense } from "react";

import { SessionData } from "@auth0/nextjs-auth0/types";
import { UserIcon } from "@heroicons/react/24/outline";
import { PopoverArrow } from "@radix-ui/react-popover";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { LogoutButton } from "../auth/LogoutButton";
import { OrgSwitcher } from "../auth/OrgSwitcher";
import { ThemedFernLogo } from "../theme/ThemedFernLogo";
import { Button } from "../ui/button";
import { DocsSiteSelect } from "./DocsSiteSelect";
import { DocsSiteSwitcher } from "./DocsSiteSwitcher";

export declare namespace Header {
  export interface Props {
    session: SessionData;
    currentDocsDomain: string | undefined;
  }
}

export async function Header({ session, currentDocsDomain }: Header.Props) {
  const name = session.user.name;
  const email = session.user.email;
  const picture = session.user.picture;
  const orgId = session.user.org_id;

  return (
    <div className="flex justify-between p-4">
      <div className="flex items-center gap-4">
        <ThemedFernLogo className="w-16" />
        <OrgSwitcher currentOrgId={orgId} />
        <input className="w-40" />
        {currentDocsDomain != null && (
          <div className="flex md:hidden">
            <Suspense
              fallback={
                <DocsSiteSelect
                  currentDomain={currentDocsDomain}
                  docsSites={[]}
                />
              }
            >
              <DocsSiteSwitcher currentDomain={currentDocsDomain} />
            </Suspense>
          </div>
        )}
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
