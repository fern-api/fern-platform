import Image from "next/image";
import React from "react";

import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";

import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export declare namespace MemberOrInviteeRow {
  export interface Props {
    title: string;
    subtitle?: string;
    pictureUrl?: string;
    rightContent?: React.JSX.Element;
    dropdownMenuItems?: React.JSX.Element;
  }
}

export function MemberOrInviteeRow({
  title,
  subtitle,
  pictureUrl,
  rightContent,
  dropdownMenuItems,
}: MemberOrInviteeRow.Props) {
  return (
    <div className="dark:border-gray-1100 flex justify-between border-b border-gray-500 p-4 last:border-b-0">
      <div className="flex items-center gap-4">
        <div className="dark:border-gray-1100 flex size-10 overflow-hidden rounded-full border-2 border-gray-500 bg-gray-300">
          {pictureUrl != null ? (
            <Image
              src={pictureUrl}
              alt={title}
              className="object-cover"
              width={40}
              height={40}
            />
          ) : (
            <div className="dark: dark:bg-gray-1200 flex flex-1 items-center justify-center text-xl uppercase text-gray-900">
              {title[0]}
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <div className="font-bold">{title}</div>
          <div className="text-gray-900">{subtitle}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {rightContent}
        {dropdownMenuItems != null && (
          <div className="flex">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost">
                  <EllipsisHorizontalIcon className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {dropdownMenuItems}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
}
