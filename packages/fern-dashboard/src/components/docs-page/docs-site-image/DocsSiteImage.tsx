"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

import { FdrAPI } from "@fern-api/fdr-sdk";

import { useHomepageImageUrl } from "@/state/useHomepageImageUrl";

import { Skeleton } from "../../ui/skeleton";
import { DocsSiteImageLayout } from "./DocsSiteImageLayout";
import { SkeletonDocsSiteImage } from "./SkeletonDocsSiteImage";

export declare namespace DocsSiteImage {
  export interface Props {
    docsSite: FdrAPI.dashboard.DocsSite;
  }
}

export function DocsSiteImage({ docsSite }: DocsSiteImage.Props) {
  const { theme } = useTheme();

  const imageUrl = useHomepageImageUrl({
    docsSite,
    theme: theme === "dark" ? theme : "light",
  });

  const [isImageLoaded, setIsImageLoaded] = useState(false);
  useEffect(() => {
    if (imageUrl.type !== "loaded") {
      setIsImageLoaded(false);
    }
  }, [imageUrl.type]);

  if (imageUrl.type === "failed") {
    return (
      <DocsSiteImageLayout>
        <div className="flex flex-1 flex-col items-center justify-center gap-2 bg-white text-gray-900 dark:bg-black dark:text-gray-900">
          <ExclamationCircleIcon className="size-10" />
          <div>Failed to load</div>
        </div>
      </DocsSiteImageLayout>
    );
  }

  if (imageUrl.type !== "loaded") {
    return <SkeletonDocsSiteImage />;
  }

  return (
    <DocsSiteImageLayout>
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
    </DocsSiteImageLayout>
  );
}
