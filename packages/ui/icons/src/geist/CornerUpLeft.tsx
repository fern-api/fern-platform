import type { ReactElement, SVGProps } from "react";
const SvgCornerUpLeft = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="m4.47 10.03.53.53L6.06 9.5l-.53-.53L3.56 7h9.69a.25.25 0 0 1 .25.25v7H15v-7a1.75 1.75 0 0 0-1.75-1.75H3.56l1.97-1.97.53-.53L5 1.94l-.53.53-3.25 3.25a.75.75 0 0 0 0 1.06z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgCornerUpLeft;
