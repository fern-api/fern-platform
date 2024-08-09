import type { ReactElement, SVGProps } from "react";
const SvgMenuAltUnread = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <circle cx={13.5} cy={2.5} r={2.5} fill="#52a8ff" />
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M9.531 2H1v1.5h8.626A4 4 0 0 1 9.531 2M1.75 12H1v1.5h14V12zM1 7h14v1.5H1z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgMenuAltUnread;
