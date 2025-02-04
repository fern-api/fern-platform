"use client";

import { ElementType, SVGProps, forwardRef } from "react";
import useSWRImmutable from "swr/immutable";
import { getIconUrl, parseSvg } from "./utils";

export const RemoteIconClient = forwardRef<
  SVGSVGElement,
  {
    icon: string;
    fallback?: ElementType<SVGProps<SVGSVGElement>>;
  } & SVGProps<SVGSVGElement>
>(({ icon, fallback: Fallback = "svg", ...props }, ref) => {
  const { data } = useSWRImmutable(icon, () =>
    fetch(getIconUrl(icon)).then((res) => res.text())
  );

  if (data == null) {
    return (
      <Fallback
        ref={ref}
        aria-hidden="true"
        focusable="false"
        role="img"
        {...props}
      />
    );
  }

  // parse the svg
  const { props: svgProps, body } = parseSvg(data);

  if (body == null) {
    return (
      <Fallback
        ref={ref}
        aria-hidden="true"
        focusable="false"
        role="img"
        {...props}
      />
    );
  }

  delete svgProps.class;
  delete svgProps.className;
  delete svgProps.hidden;

  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      {...svgProps}
      aria-hidden="true"
      focusable="false"
      role="img"
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
});

RemoteIconClient.displayName = "RemoteIconClient";
