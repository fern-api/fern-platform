import { PropsWithChildren } from "react";

export function Download({
  children,
  src,
  filename,
}: PropsWithChildren<{ src?: string; filename?: string }>) {
  if (!src) {
    return children;
  }

  return (
    <a href={src} download={filename || true}>
      {children}
    </a>
  );
}
