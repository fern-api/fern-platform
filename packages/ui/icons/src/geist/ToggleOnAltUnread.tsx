import type { ReactElement, SVGProps } from "react";
const SvgToggleOnAltUnread = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <circle cx={13.5} cy={2.5} r={2.5} fill="#52a8ff" />
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M6 2h3.531a4 4 0 0 0 .095 1.5H6a4.5 4.5 0 0 0 0 9h4a4.5 4.5 0 0 0 4.22-6.065c.506-.092.98-.279 1.4-.542A6 6 0 0 1 10 14H6A6 6 0 0 1 6 2m4 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgToggleOnAltUnread;
