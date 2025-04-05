"use client";

import React from "react";

import {
  HOMEPAGE_SCREENSHOT_HEIGHT,
  HOMEPAGE_SCREENSHOT_WIDTH,
} from "@/app/api/homepage-images/constants";

export declare namespace DocsSiteImageLayout {
  export interface Props {
    children: React.JSX.Element;
  }
}

export function DocsSiteImageLayout({ children }: DocsSiteImageLayout.Props) {
  return (
    <div
      className="relative flex w-[150px] overflow-hidden rounded-lg border border-gray-500 sm:w-[350px] md:w-[400px] lg:w-[450px] dark:border-gray-900"
      style={{
        aspectRatio: `${HOMEPAGE_SCREENSHOT_WIDTH} / ${HOMEPAGE_SCREENSHOT_HEIGHT}`,
      }}
    >
      {children}
    </div>
  );
}
