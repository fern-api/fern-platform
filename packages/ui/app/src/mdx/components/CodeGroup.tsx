import { clsx as cn } from "clsx";
import { ReactElement, useRef } from "react";
import { FernCodeGroup } from "../../components/FernCodeGroup";

export function CodeGroup(props: FernCodeGroup.Props): ReactElement {
    const ref = useRef<HTMLDivElement>(null);
    return <FernCodeGroup {...props} className={cn(props.className, "mt-4 mb-6")} ref={ref} />;
}
