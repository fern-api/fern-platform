"use server";

import { SVGProps } from "react";
import { getIconUrl, parseSvg } from "./utils";

export async function RemoteIconServer({
  icon,
  ...props
}: {
  icon: string;
} & SVGProps<SVGSVGElement>) {
  const data = await fetch(getIconUrl(icon), {
    cache: "force-cache",
  })
    .then((res) => res.text())
    .catch((e) => {
      console.error(e);
      return null;
    });

  if (data == null) {
    return false;
  }

  // parse the svg
  const { props: svgProps, body } = parseSvg(data);

  if (body == null) {
    console.error("Failed to parse SVG for icon:", icon);
    return false;
  }

  delete svgProps.class;
  delete svgProps.className;
  delete svgProps.hidden;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      {...svgProps}
      aria-hidden="true"
      focusable="false"
      role="img"
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}
