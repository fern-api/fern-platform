import type { ReactElement, SVGProps } from "react";
const SvgArrowCircleLeft = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M10.75 8.75h.75v-1.5H6.56l1.47-1.47.53-.53L7.5 4.19l-.53.53-2.75 2.75a.75.75 0 0 0 0 1.06l2.75 2.75.53.53 1.06-1.06-.53-.53-1.47-1.47zM8 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13M16 8A8 8 0 1 0 0 8a8 8 0 0 0 16 0"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgArrowCircleLeft;
