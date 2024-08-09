import type { ReactElement, SVGProps } from "react";
const SvgChevronUpSmall = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="m3.94 9.25.53-.53 2.823-2.824a1 1 0 0 1 1.414 0L11.53 8.72l.53.53L11 10.31l-.53-.53L8 7.31 5.53 9.78l-.53.53z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgChevronUpSmall;
