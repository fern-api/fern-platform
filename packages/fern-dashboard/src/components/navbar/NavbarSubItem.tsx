"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { cn } from "@/utils/utils";

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

  const className = cn(
    "hidden sm:flex",
    "flex-1 flex-row gap-2 text-sm transition",
    isSelected
      ? "text-green-1100"
      : "hover:text-gray-1100 text-gray-900 dark:hover:text-gray-700"
  );

  const children = (
    <>
      <div className="flex w-5 shrink-0 justify-center">
        <div
          className={cn("w-px", isSelected ? "bg-green-1100" : "bg-gray-700")}
        />
      </div>
      <div className="flex min-w-0 items-center py-2 pr-4">
        {icon}
        <div className="overflow-x-hidden text-ellipsis whitespace-nowrap">
          {title}
        </div>
      </div>
    </>
  );

  if (isSelected) {
    return <div className={className}>{children}</div>;
  } else {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
};
