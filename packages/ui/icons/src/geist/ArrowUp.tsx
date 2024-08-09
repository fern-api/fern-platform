import type { ReactElement, SVGProps } from "react";
const SvgArrowUp = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M8.707 1.396a1 1 0 0 0-1.414 0L2.22 6.47 1.69 7l1.06 1.06.53-.53 3.97-3.97V15h1.5V3.56l3.97 3.97.53.53L14.31 7l-.53-.53z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgArrowUp;
