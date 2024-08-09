import type { ReactElement, SVGProps } from "react";
const SvgChevronDownSmall = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="m12.06 6.75-.53.53-2.823 2.824a1 1 0 0 1-1.414 0L4.47 7.28l-.53-.53L5 5.69l.53.53L8 8.69l2.47-2.47.53-.53z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgChevronDownSmall;
