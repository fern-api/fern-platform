"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

import {
  HOMEPAGE_SCREENSHOT_HEIGHT,
  HOMEPAGE_SCREENSHOT_WIDTH,
} from "@/app/api/homepage-images/constants";
import { useHomepageImageUrl } from "@/state/useHomepageImageUrl";
import { DocsUrl } from "@/utils/types";

import { Skeleton } from "../ui/skeleton";

export declare namespace DocsSiteImage {
  export interface Props {
    docsUrl: DocsUrl;
  }
}

export function DocsSiteImage({ docsUrl }: DocsSiteImage.Props) {
  const { theme } = useTheme();

  const imageUrl = useHomepageImageUrl({
    docsUrl,
    theme: theme === "dark" ? theme : "light",
  });

  const [isImageLoaded, setIsImageLoaded] = useState(false);
  useEffect(() => {
    if (imageUrl.type !== "loaded") {
      setIsImageLoaded(false);
    }
  }, [imageUrl.type]);

  const renderImage = () => {
    if (imageUrl.type === "failed") {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 bg-white text-gray-900 dark:bg-black dark:text-gray-900">
          <ExclamationCircleIcon className="size-10" />
          <div>Failed to load</div>
        </div>
      );
    }

    if (imageUrl.type !== "loaded") {
      return <Skeleton className="flex-1" />;
    }

    return (
      <>
        {/*eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl.value.imageUrl}
          alt="docs homepage"
          className="flex-1 object-cover object-top"
          onLoad={() => {
            setIsImageLoaded(true);
          }}
        />
        {!isImageLoaded && <Skeleton className="absolute inset-0" />}
      </>
    );
  };

  return (
    <div
      className="relative flex w-[150px] overflow-hidden rounded-lg border border-gray-500 sm:w-[350px] md:w-[400px] lg:w-[450px] dark:border-gray-900"
      style={{
        aspectRatio: `${HOMEPAGE_SCREENSHOT_WIDTH} / ${HOMEPAGE_SCREENSHOT_HEIGHT}`,
      }}
    >
      {renderImage()}
    </div>
  );
}
