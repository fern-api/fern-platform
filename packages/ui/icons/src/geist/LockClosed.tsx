import type { ReactElement, SVGProps } from "react";
const SvgLockClosed = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M10 4.5V6H6V4.5a2 2 0 1 1 4 0M4.5 6V4.5a3.5 3.5 0 1 1 7 0V6H14v6.5a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 2 12.5V6zm7 1.5h-8v5a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-5z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgLockClosed;
