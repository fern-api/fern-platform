import type { ReactElement, SVGProps } from "react";
const SvgArrowUpDown = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M4.22 3.47 3.69 4l1.06 1.06.53-.53 1.97-1.97v10.88l-1.97-1.97-.53-.53L3.69 12l.53.53 3.073 3.074a1 1 0 0 0 1.414 0l3.073-3.074.53-.53-1.06-1.06-.53.53-1.97 1.97V2.56l1.97 1.97.53.53L12.31 4l-.53-.53L8.707.397a1 1 0 0 0-1.414 0z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgArrowUpDown;
