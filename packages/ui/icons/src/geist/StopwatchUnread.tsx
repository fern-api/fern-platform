import type { ReactElement, SVGProps } from "react";
const SvgStopwatchUnread = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <g clipPath="url(#stopwatch-unread_svg__a)">
            <circle cx={13.5} cy={2.5} r={2.5} fill="#52a8ff" />
            <path
                fill="#fff"
                fillRule="evenodd"
                d="M10 .562V-.25H6v1.5h1.25v.79a6.97 6.97 0 0 0-3.641 1.508L3.03 2.97l-.53-.53L1.44 3.5l.53.53.578.579a7 7 0 1 0 11.943 1.767 4 4 0 0 1-1.616.075 5.5 5.5 0 1 1-3.17-2.682 4 4 0 0 1-.191-1.605 7 7 0 0 0-.764-.124v-.79h.95q.118-.36.3-.688M8.75 6v3.75h-1.5V6z"
                clipRule="evenodd"
            />
        </g>
        <defs>
            <clipPath id="stopwatch-unread_svg__a">
                <path fill="#fff" d="M0 0h16v16H0z" />
            </clipPath>
        </defs>
    </svg>
);
export default SvgStopwatchUnread;
