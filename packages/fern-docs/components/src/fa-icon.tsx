"use client";

import React from "react";

import { isEqual } from "es-toolkit/predicate";
import useSWRImmutable from "swr/immutable";

import { getIconUrl, parseSvg } from "./util/fa";

export const FaIcon = React.memo(
  React.forwardRef<
    React.ComponentRef<"svg">,
    {
      icon: string;
      fallback?: React.ElementType<React.SVGProps<SVGSVGElement>>;
    } & React.SVGProps<SVGSVGElement>
  >(({ icon, fallback: Fallback = "svg", ...props }, ref) => {
    const url = getIconUrl(icon);

    const { data } = useSWRImmutable(url, () =>
      fetch(url, { cache: "force-cache" }).then((res) => res.text())
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
  }),
  (prevProps, nextProps) => {
    return (
      prevProps.icon === nextProps.icon &&
      prevProps.className === nextProps.className &&
      isEqual(prevProps.style, nextProps.style) &&
      prevProps.width === nextProps.width &&
      prevProps.height === nextProps.height &&
      prevProps.color === nextProps.color &&
      prevProps.fill === nextProps.fill &&
      prevProps.stroke === nextProps.stroke
    );
  }
);
