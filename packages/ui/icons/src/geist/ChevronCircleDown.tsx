import type { ReactElement, SVGProps } from "react";
const SvgChevronCircleDown = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M1.5 8a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0M4.72 7.53l2.58 2.58a.99.99 0 0 0 1.4 0l2.58-2.58.53-.53-1.06-1.06-.53.53L8 8.69 5.78 6.47l-.53-.53L4.19 7z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgChevronCircleDown;
