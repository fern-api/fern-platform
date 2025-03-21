"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { cn } from "@/lib/utils";

export declare namespace NavbarItem {
  export interface Props {
    title: string;
    icon: React.JSX.Element;
    href: `/${string}`;
  }
}

export const NavbarItem = ({ title, icon, href }: NavbarItem.Props) => {
  const pathname = usePathname();
  const isSelected = pathname.startsWith(href);

  const Component = isSelected ? "div" : Link;

  return (
    <Component
      className={cn(
        "flex flex-1 flex-col items-center gap-2 py-2 text-sm transition md:flex-row",
        isSelected
          ? "text-green-1100"
          : "hover:text-gray-1200 text-gray-900 dark:hover:text-gray-700"
      )}
      href={href}
    >
      {icon}
      <div>{title}</div>
    </Component>
  );
};
