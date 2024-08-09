import type { ReactElement, SVGProps } from "react";
const SvgCrossSmall = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="m9.97 11.03.53.53 1.06-1.06-.53-.53L9.06 8l1.97-1.97.53-.53-1.06-1.06-.53.53L8 6.94 6.03 4.97l-.53-.53L4.44 5.5l.53.53L6.94 8 4.97 9.97l-.53.53 1.06 1.06.53-.53L8 9.06z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgCrossSmall;
