import type { ReactElement, SVGProps } from "react";
const SvgChevronCircleRight = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M8 14.5a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13M0 8a8 8 0 1 0 16 0A8 8 0 0 0 0 8m7.53 3.28 2.58-2.58a.99.99 0 0 0 0-1.4L7.53 4.72 7 4.19 5.94 5.25l.53.53L8.69 8l-2.22 2.22-.53.53L7 11.81z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgChevronCircleRight;
