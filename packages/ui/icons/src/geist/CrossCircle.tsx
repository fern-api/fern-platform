import type { ReactElement, SVGProps } from "react";
const SvgCrossCircle = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M14.5 8a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.5 11.56l.53-.53L8 9.06l1.97 1.97.53.53 1.06-1.06-.53-.53L9.06 8l1.97-1.97.53-.53-1.06-1.06-.53.53L8 6.94 6.03 4.97l-.53-.53L4.44 5.5l.53.53L6.94 8 4.97 9.97l-.53.53z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgCrossCircle;
