"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { cn } from "@/utils/cn";

export declare namespace DocsSiteNavBarItem {
  export interface Props {
    title: string;
    href: `/${string}`;
  }
}

const DOCS_PATHNAME_REGEX = /(\/docs\/[^/]+)(.*)\/?/;

export function DocsSiteNavBarItem({ title, href }: DocsSiteNavBarItem.Props) {
  const pathname = usePathname();
  const { pathnameForDocsSite, tabPathname } = useMemo(() => {
    const match = pathname.match(DOCS_PATHNAME_REGEX);
    const pathnameForDocsSite = match?.[1];
    const tabPathname = match?.[2];
    if (pathnameForDocsSite == null || tabPathname == null) {
      throw new Error(`Failed to parse tab pathname (pathname=${pathname})`);
    }
    return { pathnameForDocsSite, tabPathname };
  }, [pathname]);
  const isSelected =
    tabPathname === href || (tabPathname === "" && href === "/");
  const isClickable = !isSelected;

  const className = cn(
    "flex flex-col pl-4 pr-4 first:pl-0 last:pr-0",
    isSelected ? "text-gray-1100" : "text-gray-900",
    isClickable && "hover:text-gray-1100"
  );

  const children = (
    <>
      <div className="flex py-3">{title}</div>
      {isSelected && <div className="h-0.5 rounded-full bg-gray-700" />}
    </>
  );

  if (isClickable) {
    return (
      <Link className={className} href={pathnameForDocsSite + href}>
        {children}
      </Link>
    );
  } else {
    return <div className={className}>{children}</div>;
  }
}
