"use server";

import { BgImageGradient } from "@/client/components/BgImageGradient";
import { cn } from "@fern-docs/components";

export default async function Page() {
  return (
    <header
      id="fern-header"
      role="banner"
      className={cn(
        "fixed inset-x-0 top-0",
        // https://github.com/theKashey/react-remove-scroll-bar/blob/master/src/constants.ts#L2
        "width-before-scroll-bar"
      )}
    >
      <div className="clipped-background">
        <BgImageGradient
          className="h-screen opacity-60 dark:opacity-80"
          colors={{}}
        />
      </div>
      Hello world
    </header>
  );
}
