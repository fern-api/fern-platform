import type { ReactElement, SVGProps } from "react";
const SvgChevronUp = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="m1.94 10.5.53-.53 4.823-4.824a1 1 0 0 1 1.414 0L13.53 9.97l.53.53L13 11.56l-.53-.53L8 6.56l-4.47 4.47-.53.53z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgChevronUp;
