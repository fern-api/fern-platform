"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { cn } from "@/lib/utils";

export declare namespace NavbarSubItem {
  export interface Props {
    title: string;
    icon?: React.JSX.Element;
    href: `/${string}`;
  }
}

export const NavbarSubItem = ({ title, icon, href }: NavbarSubItem.Props) => {
  const pathname = usePathname();
  const isSelected = pathname.startsWith(href);

  const Component = isSelected ? "div" : Link;

  return (
    <Component
      className={cn(
        "flex flex-1 flex-col gap-2 text-sm transition md:flex-row",
        isSelected
          ? "text-green-1100"
          : "hover:text-gray-1200 text-gray-900 dark:hover:text-gray-700"
      )}
      href={href}
    >
      <div className="flex w-5 shrink-0 justify-center">
        <div
          className={cn("w-px", isSelected ? "bg-green-1100" : "bg-gray-900")}
        />
      </div>
      <div className="flex min-w-0 items-center py-2">
        {icon}
        <div className="overflow-x-hidden text-ellipsis whitespace-nowrap">
          {title}
        </div>
      </div>
    </Component>
  );
};
