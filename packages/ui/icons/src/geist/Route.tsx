import type { ReactElement, SVGProps } from "react";
const SvgRoute = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M7.53.72 7 .19 5.94 1.25l.53.53.22.22H3.374a3.375 3.375 0 0 0 0 6.75h9.25a1.875 1.875 0 0 1 0 3.75h-7.74a2.501 2.501 0 1 0 0 1.5h7.74a3.375 3.375 0 1 0 0-6.75h-9.25a1.875 1.875 0 0 1 0-3.75h3.314l-.22.22-.53.53L7 5.31l.53-.53 1.324-1.323a1 1 0 0 0 0-1.414zM2.5 14.25a1 1 0 1 0 0-2 1 1 0 0 0 0 2m12-11.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0m1.5 0a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgRoute;
