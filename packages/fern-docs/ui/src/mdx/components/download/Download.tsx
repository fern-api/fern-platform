import React, { ComponentProps, PropsWithChildren } from "react";
import { FernLink } from "../../../components/FernLink";
import { Button } from "../button";
import { Card } from "../card";
import { A } from "../html";

export function Download({
  children,
  src,
  filename,
}: PropsWithChildren<{ src?: string; filename?: string }>) {
  if (!src) {
    return children;
  }

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    // enable downloads from the same origin, or data urls
    if (
      src.startsWith(window.location.origin + "/") ||
      src.startsWith("data:")
    ) {
      return;
    }

    e.preventDefault();
    try {
      const response = await fetch(src, { mode: "no-cors" });
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename || "";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
      // if we can't download the file, open it in a new tab
      window.open(src, "_blank");
    }
  };

  if (
    React.isValidElement<ComponentProps<typeof FernLink>>(children) &&
    (children.type === A || children.type === Card || children.type === Button)
  ) {
    return React.cloneElement(children, {
      href: src,
      download: filename || true,
      onClick: handleClick,
    });
  }

  return (
    <A href={src} download={filename || true} onClick={handleClick}>
      {children}
    </A>
  );
}
