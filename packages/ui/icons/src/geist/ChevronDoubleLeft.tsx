import type { ReactElement, SVGProps } from "react";
const SvgChevronDoubleLeft = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M3.146 7.293a1 1 0 0 0 0 1.414L6.97 12.53l.53.53L8.56 12l-.53-.53L4.56 8l3.47-3.47.53-.53L7.5 2.94l-.53.53zm5 0a1 1 0 0 0 0 1.414l3.824 3.823.53.53L13.56 12l-.53-.53L9.56 8l3.47-3.47.53-.53-1.06-1.06-.53.53z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgChevronDoubleLeft;
