import Image from "next/image";

import { Session } from "@auth0/nextjs-auth0";
import { UserIcon } from "@heroicons/react/24/outline";
import { PopoverArrow } from "@radix-ui/react-popover";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { LogoutButton } from "./auth/LogoutButton";
import { ThemedFernLogo } from "./theme/ThemedFernLogo";
import { Button } from "./ui/button";

export declare namespace Header {
  export interface Props {
    session: Session;
  }
}

export async function Header({ session }: Header.Props) {
  const name = session.user.name;
  const email = session.user.email;
  const picture = session.user.picture;

  return (
    <div className="flex justify-between p-4">
      <div className="flex items-center">
        <ThemedFernLogo className="w-16" />
      </div>
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
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
