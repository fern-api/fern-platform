"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

import { DashboardApiClient } from "@/app/services/dashboard-api/client";
import { DocsUrl } from "@/utils/types";

export declare namespace DocsSiteImage {
  export interface Props {
    docsUrl: DocsUrl;
  }
}

export function DocsSiteImage({ docsUrl }: DocsSiteImage.Props) {
  const [imageUrl, setImageUrl] = useState<string>();
  const { theme } = useTheme();

  useEffect(() => {
    async function run() {
      try {
        const { imageUrl } = await DashboardApiClient.getHomepageImages({
          url: docsUrl,
          theme: theme === "dark" ? theme : "light",
        });
        setImageUrl(imageUrl);
      } catch (e) {
        console.error("Failed to load image", e);
      }
    }

    void run();
  }, [docsUrl, theme]);

  if (imageUrl == null) {
    return <div>image...</div>;
  }

  return <Image src={imageUrl} alt="docs homepage" width={400} height={400} />;
}
