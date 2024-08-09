import type { ReactElement, SVGProps } from "react";
const SvgArrowDown = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M8.75 1.75V1h-1.5v11.44L3.28 8.47l-.53-.53L1.69 9l.53.53 5.073 5.074a1 1 0 0 0 1.414 0L13.78 9.53l.53-.53-1.06-1.06-.53.53-3.97 3.97z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgArrowDown;
