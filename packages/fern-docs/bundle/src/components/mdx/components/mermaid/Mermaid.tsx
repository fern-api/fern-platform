import { ReactElement, useEffect, useRef, useState } from "react";

import { useTheme } from "../../../atoms";

export function Mermaid({ children }: { children: string }): ReactElement<any> {
  if (typeof window === "undefined" || typeof children !== "string") {
    return <div />;
  }

  return <MermaidInternal code={children} />;
}

function MermaidInternal({ code }: { code: string }): ReactElement<any> {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>();
  const theme = useTheme();

  useEffect(() => {
    void (async () => {
      const mermaid = await import("mermaid").then((m) => m.default);

      if (ref.current) {
        mermaid.initialize({
          theme: theme === "dark" ? "dark" : "default",
        });
        const result = await mermaid.render("mermaid-svg", code, ref.current);
        setSvg(result.svg);
      }
    })();
  }, [code, theme]);

  return (
    <div
      ref={ref}
      dangerouslySetInnerHTML={svg != null ? { __html: svg } : undefined}
    />
  );
}
