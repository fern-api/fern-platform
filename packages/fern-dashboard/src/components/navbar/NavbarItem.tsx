"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { cn } from "@/lib/cn";

export declare namespace NavbarItem {
  export interface Props {
    title: string;
    icon: React.JSX.Element;

    /**
     * href is used to determine:
     *   (1) if this item is selected: pathname.startsWith(href)
     *   (2) the href for the <a />
     *       (to override, use hrefForActualLinking)
     */
    href: `/${string}`;
    hrefForActualLinking?: string;
  }
}

export const ICON_SIZE = "size-5";

export const NavbarItem = ({
  title,
  icon,
  href,
  hrefForActualLinking = href,
}: NavbarItem.Props) => {
  const pathname = usePathname();

  const isSelected = pathname.startsWith(href);
  const isClickable = !isSelected;

  const className = cn(
    "flex flex-1 flex-col items-center gap-2 py-2 text-sm transition md:flex-row",
    isSelected ? "text-green-1100" : "text-gray-900",
    isClickable && "hover:text-gray-1200 dark:hover:text-gray-700"
  );

  const children = (
    <>
      {icon}
      <div>{title}</div>
    </>
  );

  if (isClickable) {
    return (
      <Link className={className} href={hrefForActualLinking}>
        {children}
      </Link>
    );
  } else {
    return <div className={className}>{children}</div>;
  }
};
