import "server-only";

import React from "react";

import { FaIcon } from "@fern-docs/components/fa-icon";
import { getIconUrl, parseSvg } from "@fern-docs/components/util/fa";

export async function FaIconServer({
  icon,
  ...props
}: {
  icon: string;
} & React.SVGProps<SVGSVGElement>) {
  const url = getIconUrl(icon);
  const clientIcon = <FaIcon icon={icon} {...props} />;
  try {
    const res = await fetch(url, {
      cache: "force-cache",
      next: { tags: ["icon", icon] },
    });
    if (!res.ok) {
      return clientIcon;
    }

    const { props: svgProps, body } = parseSvg(await res.text());

    if (body == null) {
      return clientIcon;
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
  } catch (error) {
    console.error(error);
    return clientIcon;
  }
}
