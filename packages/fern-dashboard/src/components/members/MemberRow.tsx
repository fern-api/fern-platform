import Image from "next/image";

import {
  EllipsisHorizontalIcon,
  UserMinusIcon,
} from "@heroicons/react/24/outline";
import { GetMembers200ResponseOneOfInner } from "auth0";

import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export declare namespace MemberRow {
  export interface Props {
    member: GetMembers200ResponseOneOfInner;
  }
}

export function MemberRow({ member }: MemberRow.Props) {
  return (
    <div className="dark:border-gray-1100 flex justify-between border-b border-gray-500 p-4 last:border-b-0">
      <div className="flex items-center gap-4">
        <div className="flex size-10 overflow-hidden rounded-full border-2 border-gray-500 bg-gray-500">
          {member.picture != null && (
            <Image
              src={member.picture}
              alt={`photo of ${member.name}`}
              className="object-cover"
              width={40}
              height={40}
            />
          )}
        </div>
        <div className="flex flex-col">
          <div className="font-bold">{member.name}</div>
          <div className="text-gray-900">{member.email}</div>
        </div>
      </div>
      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              <EllipsisHorizontalIcon className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem variant="destructive">
              <UserMinusIcon /> Remove member
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
