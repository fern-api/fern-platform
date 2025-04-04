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
    title: React.JSX.Element | string;
    subtitle?: React.JSX.Element | string;
    pictureUrl?: string;
    rightContent?: React.JSX.Element;
    dropdownMenuItems?: React.JSX.Element;
    forceShowDropownMenuTrigger?: boolean;
  }
}

export function MemberOrInviteeRow({
  title,
  subtitle,
  pictureUrl,
  rightContent,
  dropdownMenuItems,
  forceShowDropownMenuTrigger = false,
}: MemberOrInviteeRow.Props) {
  const shouldShowDropdownMenuTrigger =
    dropdownMenuItems != null || forceShowDropownMenuTrigger;

  return (
    <div className="dark:border-gray-1100 flex justify-between border-b border-gray-500 p-4 last:border-b-0">
      <div className="flex items-center gap-4">
        <div className="dark:border-gray-1100 flex size-10 overflow-hidden rounded-full border-2 border-gray-500 bg-gray-300">
          {pictureUrl != null ? (
            <Image
              src={pictureUrl}
              alt={typeof title === "string" ? title : "user picture"}
              className="object-cover"
              width={40}
              height={40}
            />
          ) : (
            <div className="dark: dark:bg-gray-1200 flex flex-1 items-center justify-center text-xl uppercase text-gray-900">
              {typeof title === "string" && title[0]}
            </div>
          )}
        </div>
        <div className="flex flex-col items-start gap-1">
          <div className="font-bold">{title}</div>
          <div className="text-gray-900">{subtitle}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {rightContent}
        <div className="flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={dropdownMenuItems == null}>
              <Button size="icon" variant="ghost">
                {shouldShowDropdownMenuTrigger && (
                  <EllipsisHorizontalIcon className="size-5" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {dropdownMenuItems}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
