import type { ReactElement, SVGProps } from "react";
const SvgChevronDoubleDown = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M4.53 2.97 4 2.44 2.94 3.5l.53.53 3.823 3.824a1 1 0 0 0 1.414 0L12.53 4.03l.53-.53L12 2.44l-.53.53L8 6.44zm0 5L4 7.44 2.94 8.5l.53.53 3.823 3.824a1 1 0 0 0 1.414 0L12.53 9.03l.53-.53L12 7.44l-.53.53L8 11.44z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgChevronDoubleDown;
