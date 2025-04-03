"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

import {
  HOMEPAGE_SCREENSHOT_HEIGHT,
  HOMEPAGE_SCREENSHOT_WIDTH,
} from "@/app/api/homepage-images/types";
import { useHomepageImageUrl } from "@/state/useHomepageImageUrl";
import { DocsUrl } from "@/utils/types";

import { Skeleton } from "../ui/skeleton";

export declare namespace DocsSiteImage {
  export interface Props {
    docsUrl: DocsUrl;
  }
}

const IMAGE_WIDTH = 400;
const IMAGE_HEIGHT =
  (HOMEPAGE_SCREENSHOT_HEIGHT * IMAGE_WIDTH) / HOMEPAGE_SCREENSHOT_WIDTH;

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
        <Image
          src={imageUrl.value.imageUrl}
          alt="docs homepage"
          width={IMAGE_WIDTH}
          height={IMAGE_HEIGHT}
          onLoad={() => {
            setIsImageLoaded(true);
          }}
          priority
        />
        {!isImageLoaded && <Skeleton className="absolute inset-0" />}
      </>
    );
  };

  return (
    <div
      className="relative flex overflow-hidden rounded-lg border border-gray-500 dark:border-gray-900"
      style={{
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT,
      }}
    >
      {renderImage()}
    </div>
  );
}
