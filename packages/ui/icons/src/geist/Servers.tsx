import type { ReactElement, SVGProps } from "react";
const SvgServers = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M13.5 1.5h-11v3a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1zM15 0H1v4.5A2.5 2.5 0 0 0 3.5 7h9A2.5 2.5 0 0 0 15 4.5zM2.5 13.5v-3h11v3a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1M1 9h14v4.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 1 13.5zm3.75 4.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5M8 12.5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0m2.5-9a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0m-1.75.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgServers;
