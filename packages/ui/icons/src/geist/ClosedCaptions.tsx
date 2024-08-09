import type { ReactElement, SVGProps } from "react";
const SvgClosedCaptions = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M0 3.5A2.5 2.5 0 0 1 2.5 1h11A2.5 2.5 0 0 1 16 3.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 0 12.5zM2 7a2.25 2.25 0 0 1 2.25-2.25h1A2.25 2.25 0 0 1 7.5 7H6a.75.75 0 0 0-.75-.75h-1A.75.75 0 0 0 3.5 7v2c0 .414.336.75.75.75h1A.75.75 0 0 0 6 9h1.5a2.25 2.25 0 0 1-2.25 2.25h-1A2.25 2.25 0 0 1 2 9zm8.75-2.25A2.25 2.25 0 0 0 8.5 7v2a2.25 2.25 0 0 0 2.25 2.25h1A2.25 2.25 0 0 0 14 9h-1.5a.75.75 0 0 1-.75.75h-1A.75.75 0 0 1 10 9V7a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 .75.75H14a2.25 2.25 0 0 0-2.25-2.25z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgClosedCaptions;
